import { normalizeModelName, normalizeToken } from "./normalizers";
import type { MatchedPricingRecord, PricingModelIndexItem, PricingSourceRecord } from "./types";

function createLookup(models: PricingModelIndexItem[]): Map<string, PricingModelIndexItem> {
  const lookup = new Map<string, PricingModelIndexItem>();

  for (const model of models) {
    const candidates = new Set<string>([
      model.slug,
      model.canonicalName,
      ...model.aliases,
      `${model.vendorSlug}/${model.slug}`,
      `${model.vendorSlug}-${model.slug}`,
    ]);

    for (const c of candidates) {
      if (!c) continue;
      const exact = normalizeToken(c);
      const fuzzy = normalizeModelName(c);
      if (exact && !lookup.has(exact)) lookup.set(exact, model);
      if (fuzzy && !lookup.has(fuzzy)) lookup.set(fuzzy, model);
    }
  }

  return lookup;
}

function candidateKeys(externalModelId: string): string[] {
  const normalized = normalizeToken(externalModelId);
  const fuzzy = normalizeModelName(externalModelId);

  const keys = new Set<string>([normalized, fuzzy]);

  const parts = normalized.split("/");
  if (parts.length > 1) {
    const tail = parts[parts.length - 1];
    keys.add(tail);
    keys.add(normalizeModelName(tail));
  }

  return [...keys].filter(Boolean);
}

export function matchPricingRecords(
  models: PricingModelIndexItem[],
  records: PricingSourceRecord[],
  sourceName: string
): { matched: MatchedPricingRecord[]; missingExternalIds: string[] } {
  const lookup = createLookup(models);
  const matched: MatchedPricingRecord[] = [];
  const missingExternalIds: string[] = [];

  for (const record of records) {
    const keys = candidateKeys(record.externalModelId);
    const model = keys.map((k) => lookup.get(k)).find(Boolean);

    if (!model) {
      missingExternalIds.push(record.externalModelId);
      continue;
    }

    matched.push({
      ...record,
      modelId: model.id,
      modelSlug: model.slug,
      sourceName,
    });
  }

  return { matched, missingExternalIds };
}
