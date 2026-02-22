import { NextResponse } from "next/server";
import { getModels, getPricingData } from "@/lib/queries";
import type { PricingResponse } from "@/lib/types";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as "api" | "consumer" | null;
    const vendor = searchParams.get("vendor");

    // We can fetch all current pricing of the given type
    let allPricing = await getPricingData(undefined, type || "api");

    // Fetch the associated models to get their vendor slugs/names, contextWindow
    const modelSlugs = Array.from(new Set(allPricing.map(p => p.modelSlug)));
    // We might have more than 10 models, so we'll need a batched fetch or fetch all active models
    let allModels = await getModels();

    if (vendor) {
        allModels = allModels.filter(m => m.vendorSlug === vendor);
        const vendorModelSlugs = new Set(allModels.map(m => m.slug));
        allPricing = allPricing.filter(p => vendorModelSlugs.has(p.modelSlug));
    }

    const models = allModels.filter(m => allPricing.some(p => p.modelSlug === m.slug));

    const response: PricingResponse = {
        models: models.map(model => {
            const modelPricing = allPricing.filter(p => p.modelSlug === model.slug);
            const apiPricingDoc = modelPricing.find(p => p.pricingType === "api");
            const consumerPricingDocs = modelPricing.filter(p => p.pricingType === "consumer");

            return {
                model: {
                    id: model.id,
                    slug: model.slug,
                    canonicalName: model.canonicalName,
                    vendorSlug: model.vendorSlug,
                    vendorName: model.vendorName,
                    contextWindow: model.contextWindow
                },
                apiPricing: apiPricingDoc ? {
                    input1m: apiPricingDoc.inputPrice1m ?? 0,
                    output1m: apiPricingDoc.outputPrice1m ?? 0,
                    cached1m: apiPricingDoc.cachedInput1m,
                    batchIn1m: apiPricingDoc.batchInput1m,
                    batchOut1m: apiPricingDoc.batchOutput1m,
                } : null,
                consumerPlans: consumerPricingDocs.map(c => ({
                    planName: c.planName ?? "Premium",
                    monthlyUsd: c.monthlyPriceUsd ?? 0,
                    usageLimits: c.usageLimits
                })),
                sourceUrl: apiPricingDoc?.sourceUrl || consumerPricingDocs[0]?.sourceUrl || null,
                snapshotDate: apiPricingDoc?.snapshotDate || consumerPricingDocs[0]?.snapshotDate || new Date().toISOString()
            };
        })
    };

    // Sort logic could be handled client side or here. 
    // Let's just return to client, client seems to do it.

    return NextResponse.json(response);
}
