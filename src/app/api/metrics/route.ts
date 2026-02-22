import { NextResponse } from "next/server";
import { getMetricsData, getModels } from "@/lib/queries";
import type { MetricsResponse } from "@/lib/types";
import { DOMAINS, type DomainKey } from "@/lib/constants";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("model");
    const domain = searchParams.get("domain") || "overall";
    const weightsParam = searchParams.get("weights");

    if (!slug) {
        return NextResponse.json({ error: "Missing model slug" }, { status: 400 });
    }

    const modelQuery = await getModels([slug]);
    const model = modelQuery[0];
    if (!model) {
        return NextResponse.json({ error: "Model not found" }, { status: 404 });
    }

    // Fetch metrics for all domains for this model
    const domainsMetricsPromises = DOMAINS.map(d => getMetricsData([slug], d.key));
    const allDomainsMetricsResults = await Promise.all(domainsMetricsPromises);
    const allMetrics = allDomainsMetricsResults.flat();

    const metricsMap: MetricsResponse["metrics"] = {};
    for (const domainDef of DOMAINS) {
        const metricDoc = allMetrics.find(m => m.domain === domainDef.key);
        if (metricDoc) {
            metricsMap[domainDef.key] = {
                eloScore: metricDoc.eloScore,
                blendedPrice: metricDoc.blendedPrice1m,
                eloPerDollar: metricDoc.eloPerDollar,
                valueScore: metricDoc.valueScore,
                valueRank: metricDoc.valueRank,
            };
        }
    }

    let weightedValueScore = metricsMap[domain as DomainKey]?.valueScore ?? null;

    // Custom weight calculation if weights provided
    if (weightsParam) {
        const weights: Record<string, number> = {};
        weightsParam.split(",").forEach(pair => {
            const [k, v] = pair.split(":");
            weights[k] = parseFloat(v);
        });

        // We would compute a weighted value score here.
        // For simplicity, sum(valueScore * weight) / sum(weights)
        let totalScore = 0;
        let totalWeight = 0;
        for (const [k, w] of Object.entries(weights)) {
            const score = metricsMap[k as DomainKey]?.valueScore;
            if (score != null) {
                totalScore += score * w;
                totalWeight += w;
            }
        }

        if (totalWeight > 0) {
            weightedValueScore = totalScore / totalWeight;
        }
    }

    return NextResponse.json({
        model: {
            id: model.id,
            slug: model.slug,
            canonicalName: model.canonicalName
        },
        metrics: metricsMap,
        weightedValueScore
    } as MetricsResponse);
}
