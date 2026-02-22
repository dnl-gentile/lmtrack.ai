import type { DocumentSnapshot, Query } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import type { Model } from "@/lib/types";
import { COLL } from "./collections";
import type { Modality } from "@/lib/constants";

export interface GetModelsFilters {
  vendor?: string;
  modality?: Modality;
  active?: boolean;
  search?: string;
}

function docToModel(doc: DocumentSnapshot): Model {
  const d = doc.data()!;
  return {
    id: doc.id,
    vendorId: d.vendorId ?? "",
    vendorSlug: d.vendorSlug ?? "",
    vendorName: d.vendorName ?? "",
    slug: d.slug ?? "",
    canonicalName: d.canonicalName ?? "",
    family: d.family ?? null,
    modality: d.modality ?? "text",
    contextWindow: d.contextWindow ?? null,
    maxOutput: d.maxOutput ?? null,
    releaseDate: d.releaseDate ?? null,
    isOpenSource: d.isOpenSource ?? false,
    isActive: d.isActive ?? true,
    aliases: Array.isArray(d.aliases) ? d.aliases : [],
    createdAt: d.createdAt ?? "",
    updatedAt: d.updatedAt ?? "",
  };
}

export async function getModels(
  filters?: GetModelsFilters
): Promise<Model[]> {
  let q: Query = adminDb.collection(COLL.models);

  if (filters?.vendor) {
    q = q.where("vendorSlug", "==", filters.vendor);
  }
  if (filters?.modality) {
    q = q.where("modality", "==", filters.modality);
  }
  if (filters?.active !== undefined) {
    q = q.where("isActive", "==", filters.active);
  }

  const snapshot = await q.get();
  let models = snapshot.docs.map((doc) => docToModel(doc));

  if (filters?.search?.trim()) {
    const search = filters.search.trim().toLowerCase();
    models = models.filter(
      (m) =>
        m.canonicalName.toLowerCase().includes(search) ||
        m.slug.toLowerCase().includes(search) ||
        m.aliases.some((a) => a.toLowerCase().includes(search))
    );
  }

  return models;
}

export async function getModelBySlug(slug: string): Promise<Model | null> {
  const snapshot = await adminDb
    .collection(COLL.models)
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return docToModel(snapshot.docs[0]);
}
