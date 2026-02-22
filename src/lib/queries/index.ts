import type { Query } from "firebase-admin/firestore";
import { adminDb } from "../firebaseAdmin";
import type { Model, ArenaScore, Pricing, ComputedMetrics } from "../types";

export async function getModels(slugs?: string[]): Promise<Model[]> {
    const modelsRef = adminDb.collection("models");
    let query: Query = modelsRef.where("isActive", "==", true);

    if (slugs && slugs.length > 0) {
        query = query.where("slug", "in", slugs);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Model));
}

export async function getArenaScores(modelSlugs: string[]): Promise<ArenaScore[]> {
    if (!modelSlugs.length) return [];
    const snapshot = await adminDb.collection("arenaScores")
        .where("modelSlug", "in", modelSlugs)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ArenaScore));
}

export async function getPricingData(modelSlugs?: string[], type?: "api" | "consumer"): Promise<Pricing[]> {
    let query: Query = adminDb.collection("pricing");
    query = query.where("isCurrent", "==", true);

    if (type) {
        query = query.where("pricingType", "==", type);
    }
    if (modelSlugs && modelSlugs.length > 0) {
        // Firestore 'in' queries are limited to 10 items, but fine for now
        if (modelSlugs.length <= 10) {
            query = query.where("modelSlug", "in", modelSlugs);
        }
    }

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pricing));

    if (modelSlugs && modelSlugs.length > 10) {
        results = results.filter(p => modelSlugs.includes(p.modelSlug));
    }

    return results;
}

export async function getMetricsData(modelSlugs?: string[], domain: string = "overall"): Promise<ComputedMetrics[]> {
    let query: Query = adminDb.collection("computedMetrics");
    query = query.where("domain", "==", domain);

    if (modelSlugs && modelSlugs.length > 0) {
        if (modelSlugs.length <= 10) {
            query = query.where("modelSlug", "in", modelSlugs);
        }
    }

    const snapshot = await query.get();
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ComputedMetrics));

    if (modelSlugs && modelSlugs.length > 10) {
        results = results.filter(m => modelSlugs.includes(m.modelSlug));
    }
    return results;
}
