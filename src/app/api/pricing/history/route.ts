import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import type { PricingHistoryPoint, PricingHistoryResponse } from "@/lib/types";
import { COLL } from "@/lib/queries/collections";
import {
  BLENDED_PRICE_INPUT_WEIGHT,
  BLENDED_PRICE_OUTPUT_WEIGHT,
} from "@/lib/constants";

type WindowKey = "30d" | "90d" | "180d" | "365d" | "all";

const WINDOW_DAYS: Record<Exclude<WindowKey, "all">, number> = {
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
};

function chunk<T>(arr: T[], size: number): T[][];
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function toDateKey(input: string | null | undefined): string | null {
  if (!input) return null;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function toMillis(input: string | null | undefined): number {
  if (!input) return 0;
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return 0;
  return d.getTime();
}

function parseWindow(value: string | null): WindowKey {
  if (value === "90d" || value === "180d" || value === "365d" || value === "all") {
    return value;
  }
  return "30d";
}

function withinWindow(dateKey: string, windowKey: WindowKey): boolean {
  if (windowKey === "all") return true;
  const days = WINDOW_DAYS[windowKey];
  const point = new Date(`${dateKey}T00:00:00.000Z`);
  const now = new Date();
  const delta = now.getTime() - point.getTime();
  return delta <= days * 24 * 60 * 60 * 1000;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const windowKey = parseWindow(searchParams.get("window"));
  const slugs = (searchParams.get("slugs") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (slugs.length === 0) {
    const empty: PricingHistoryResponse = { series: [] };
    return NextResponse.json(empty);
  }

  const slugChunks = chunk([...new Set(slugs)], 10);

  const pricingDocs: Array<{
    modelSlug: string;
    snapshotDate: string;
    inputPrice1m: number | null;
    outputPrice1m: number | null;
  }> = [];
  const metricDocs: Array<{
    modelSlug: string;
    snapshotDate: string;
    valueScore: number | null;
    eloScore: number | null;
  }> = [];

  for (const c of slugChunks) {
    const [pricingSnap, metricsSnap] = await Promise.all([
      adminDb
        .collection(COLL.pricing)
        .where("pricingType", "==", "api")
        .where("modelSlug", "in", c)
        .get(),
      adminDb
        .collection(COLL.computedMetrics)
        .where("domain", "==", "overall")
        .where("modelSlug", "in", c)
        .get(),
    ]);

    for (const doc of pricingSnap.docs) {
      const d = doc.data();
      pricingDocs.push({
        modelSlug: d.modelSlug ?? "",
        snapshotDate: d.snapshotDate ?? "",
        inputPrice1m: d.inputPrice1m ?? null,
        outputPrice1m: d.outputPrice1m ?? null,
      });
    }

    for (const doc of metricsSnap.docs) {
      const d = doc.data();
      metricDocs.push({
        modelSlug: d.modelSlug ?? "",
        snapshotDate: d.snapshotDate ?? "",
        valueScore: d.valueScore ?? null,
        eloScore: d.eloScore ?? null,
      });
    }
  }

  const seriesMap = new Map<string, Map<string, PricingHistoryPoint>>();
  const priceTimeMap = new Map<string, Map<string, number>>();
  const metricTimeMap = new Map<string, Map<string, number>>();

  for (const slug of slugs) {
    seriesMap.set(slug, new Map());
    priceTimeMap.set(slug, new Map());
    metricTimeMap.set(slug, new Map());
  }

  for (const p of pricingDocs) {
    const dateKey = toDateKey(p.snapshotDate);
    if (!dateKey || !withinWindow(dateKey, windowKey)) continue;
    const modelMap = seriesMap.get(p.modelSlug);
    const modelTimeMap = priceTimeMap.get(p.modelSlug);
    if (!modelMap) continue;
    if (!modelTimeMap) continue;
    const millis = toMillis(p.snapshotDate);
    const previousMillis = modelTimeMap.get(dateKey) ?? 0;
    if (previousMillis > millis) continue;
    modelTimeMap.set(dateKey, millis);

    const prev = modelMap.get(dateKey);
    const input = p.inputPrice1m;
    const output = p.outputPrice1m;
    const blended =
      input != null && output != null
        ? input * BLENDED_PRICE_INPUT_WEIGHT + output * BLENDED_PRICE_OUTPUT_WEIGHT
        : null;

    modelMap.set(dateKey, {
      snapshotDate: dateKey,
      input1m: input,
      output1m: output,
      blendedPrice1m: blended,
      valueScore: prev?.valueScore ?? null,
      eloScore: prev?.eloScore ?? null,
    });
  }

  for (const m of metricDocs) {
    const dateKey = toDateKey(m.snapshotDate);
    if (!dateKey || !withinWindow(dateKey, windowKey)) continue;
    const modelMap = seriesMap.get(m.modelSlug);
    const modelTimeMap = metricTimeMap.get(m.modelSlug);
    if (!modelMap) continue;
    if (!modelTimeMap) continue;
    const millis = toMillis(m.snapshotDate);
    const previousMillis = modelTimeMap.get(dateKey) ?? 0;
    if (previousMillis > millis) continue;
    modelTimeMap.set(dateKey, millis);

    const prev = modelMap.get(dateKey);
    modelMap.set(dateKey, {
      snapshotDate: dateKey,
      input1m: prev?.input1m ?? null,
      output1m: prev?.output1m ?? null,
      blendedPrice1m: prev?.blendedPrice1m ?? null,
      valueScore: m.valueScore,
      eloScore: m.eloScore,
    });
  }

  const response: PricingHistoryResponse = {
    series: slugs.map((slug) => {
      const points = [...(seriesMap.get(slug)?.values() ?? [])].sort((a, b) =>
        a.snapshotDate.localeCompare(b.snapshotDate)
      );
      return { modelSlug: slug, points };
    }),
  };

  return NextResponse.json(response);
}
