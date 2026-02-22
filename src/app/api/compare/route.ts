import { NextResponse } from "next/server";
import { getModels, getArenaScores, getPricingData, getMetricsData } from "@/lib/queries";
import type { CompareResponse, CompareModel } from "@/lib/types";
import { DOMAINS, type DomainKey } from "@/lib/constants";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const modelsParam = searchParams.get("models");

    if (!modelsParam) {
        return NextResponse.json({ models: [] } as CompareResponse);
    }

    const slugs = modelsParam.split(",").map(s => s.trim()).filter(Boolean);
    if (slugs.length === 0) {
        return NextResponse.json({ models: [] } as CompareResponse);
    }

    // Fetch data
    const [models, allArenaScores, allPricing, allMetrics] = await Promise.all([
        getModels(slugs),
        getArenaScores(slugs),
        getPricingData(slugs), // get both api and consumer
        getMetricsData(slugs, "overall") // we might want metrics for all domains, but let's grab overall for valueMetrics or general
    ]);

    // Actually, the compare response might need metrics for all domains to fill in valueMetrics correctly,
    // but let's see. The CompareModel needs arenaScores for all domains, pricing, and valueMetrics.

    // We should fetch metrics across all domains for these models.
    // Instead of fetching 1 query per domain, let's grab them all.
    const domainsMetricsPromises = DOMAINS.map(d => getMetricsData(slugs, d.key));
    const allDomainsMetricsResults = await Promise.all(domainsMetricsPromises);
    const allDomainsMetrics = allDomainsMetricsResults.flat();

    const compareModels: CompareModel[] = models.map(model => {
        // Arena scores for this model
        const modelScores = allArenaScores.filter(s => s.modelSlug === model.slug);
        const arenaScores: CompareModel["arenaScores"] = {};
        for (const domain of DOMAINS) {
            const score = modelScores.find(s => s.domain === domain.key);
            if (score) {
                arenaScores[domain.key] = {
                    elo: score.eloScore,
                    ci: score.eloCiUpper && score.eloCiLower
                        ? `+${score.eloCiUpper - score.eloScore}/-${score.eloScore - score.eloCiLower}`
                        : null,
                    votes: score.votes,
                    rank: score.rank,
                };
            } else {
                arenaScores[domain.key] = null;
            }
        }

        // Pricing
        const modelPricing = allPricing.filter(p => p.modelSlug === model.slug);
        const apiP = modelPricing.find(p => p.pricingType === "api");
        const consumerP = modelPricing.filter(p => p.pricingType === "consumer");

        // Value Metrics
        const modelMetrics = allDomainsMetrics.filter(m => m.modelSlug === model.slug);
        const valueMetrics: CompareModel["valueMetrics"] = {};
        for (const domain of DOMAINS) {
            const metric = modelMetrics.find(m => m.domain === domain.key);
            if (metric && metric.eloPerDollar != null && metric.valueScore != null && metric.valueRank != null) {
                valueMetrics[domain.key] = {
                    eloPerDollar: metric.eloPerDollar,
                    valueScore: metric.valueScore,
                    valueRank: metric.valueRank,
                };
            } else {
                valueMetrics[domain.key] = null;
            }
        }

        // Vendor is part of Model in our DB? The prompt says `model: Model & { vendor: Vendor }`.
        // We don't have getVendor. Let's make a mock vendor or fetch it.
        // For now, construct a dummy Vendor using the vendorSlug/vendorName from Model.
        return {
            model: {
                ...model,
                vendor: {
                    id: model.vendorId,
                    slug: model.vendorSlug,
                    name: model.vendorName,
                    logoUrl: `/vendor-logos/${model.vendorSlug}.svg`,
                    websiteUrl: "",
                    createdAt: "",
                    updatedAt: ""
                }
            },
            arenaScores,
            pricing: {
                api: apiP ? {
                    input1m: apiP.inputPrice1m ?? 0,
                    output1m: apiP.outputPrice1m ?? 0,
                    blended1m: (apiP.inputPrice1m ?? 0) * 0.3 + (apiP.outputPrice1m ?? 0) * 0.7,
                    cached1m: apiP.cachedInput1m,
                    batchIn1m: apiP.batchInput1m,
                    batchOut1m: apiP.batchOutput1m,
                } : null,
                consumer: consumerP.map(p => ({
                    plan: p.planName ?? "Unknown Plan",
                    monthlyUsd: p.monthlyPriceUsd ?? 0,
                    limits: p.usageLimits
                }))
            },
            valueMetrics
        };
    });

    return NextResponse.json({ models: compareModels } as CompareResponse);
}
