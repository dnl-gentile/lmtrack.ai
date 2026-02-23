import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ModelHeader from "@/components/model/ModelHeader";
import ModelPricingCard from "@/components/model/ModelPricingCard";
import ModelScoreCard from "@/components/model/ModelScoreCard";
import MissingDataBadge from "@/components/shared/MissingDataBadge";
import type { DomainKey } from "@/lib/constants";
import { DOMAINS, DOMAIN_MAP } from "@/lib/constants";
import { adminDb } from "@/lib/firebaseAdmin";
import { COLL } from "@/lib/queries/collections";
import { getMetrics } from "@/lib/queries/metrics";
import { getModelBySlug } from "@/lib/queries/models";
import { getPricingByModel } from "@/lib/queries/pricing";
import type { ArenaScore, Pricing, Vendor } from "@/lib/types";
import { computeBlendedPrice, formatCurrency, formatNumber } from "@/lib/utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return formatCurrency(value, "USD", value < 0.01 ? 4 : 2);
}

function latestByDomain<T extends { domain: DomainKey; snapshotDate: string }>(
  rows: T[]
): Map<DomainKey, T> {
  const map = new Map<DomainKey, T>();
  for (const row of rows) {
    const existing = map.get(row.domain);
    if (!existing || row.snapshotDate > existing.snapshotDate) {
      map.set(row.domain, row);
    }
  }
  return map;
}

function selectCurrentOrLatestPricing(pricing: Pricing[]): Pricing[] {
  if (pricing.length === 0) return [];

  const current = pricing.filter((row) => row.isCurrent);
  if (current.length > 0) return current;

  const latestSnapshot = pricing.reduce((latest, row) => {
    return row.snapshotDate > latest ? row.snapshotDate : latest;
  }, pricing[0].snapshotDate);

  return pricing.filter((row) => row.snapshotDate === latestSnapshot);
}

async function getArenaScoresByModel(modelId: string): Promise<ArenaScore[]> {
  const snapshot = await adminDb
    .collection(COLL.arenaScores)
    .where("modelId", "==", modelId)
    .get();

  return snapshot.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      modelId: d.modelId ?? "",
      modelSlug: d.modelSlug ?? "",
      domain: (d.domain ?? "overall") as DomainKey,
      eloScore: d.eloScore ?? 0,
      eloCiLower: d.eloCiLower ?? null,
      eloCiUpper: d.eloCiUpper ?? null,
      rank: d.rank ?? null,
      votes: d.votes ?? null,
      snapshotDate: d.snapshotDate ?? "",
      createdAt: d.createdAt ?? "",
    };
  });
}

function createVendorFromModel(model: {
  vendorId: string;
  vendorSlug: string;
  vendorName: string;
  createdAt: string;
  updatedAt: string;
}): Vendor {
  return {
    id: model.vendorId || model.vendorSlug,
    slug: model.vendorSlug,
    name: model.vendorName,
    logoUrl: `/vendor-logos/${model.vendorSlug}.svg`,
    websiteUrl: "",
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);
  const modelName = model?.canonicalName ?? "Model";

  return {
    title: modelName,
    description: model
      ? `${model.canonicalName} quality, pricing, and value metrics on lmtrack.ai.`
      : "Model quality, pricing, and value metrics on lmtrack.ai.",
    openGraph: {
      title: `${modelName} | lmtrack.ai`,
      description: model
        ? `${model.canonicalName} quality, pricing, and value metrics on lmtrack.ai.`
        : "Model quality, pricing, and value metrics on lmtrack.ai.",
      type: "website",
    },
  };
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    notFound();
  }

  const [arenaScores, pricing, metrics] = await Promise.all([
    getArenaScoresByModel(model.id),
    getPricingByModel(model.id),
    getMetrics(model.id),
  ]);

  const vendor = createVendorFromModel(model);
  const arenaByDomain = latestByDomain(arenaScores);
  const metricsByDomain = latestByDomain(metrics);

  const overallArena =
    arenaByDomain.get("overall") ?? Array.from(arenaByDomain.values())[0] ?? null;
  const overallMetric =
    metricsByDomain.get("overall") ??
    Array.from(metricsByDomain.values())[0] ??
    null;

  const selectedPricing = selectCurrentOrLatestPricing(pricing);
  const apiPricing =
    selectedPricing
      .filter((row) => row.pricingType === "api")
      .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))[0] ?? null;

  const blendedPrice =
    apiPricing?.inputPrice1m != null && apiPricing.outputPrice1m != null
      ? computeBlendedPrice(apiPricing.inputPrice1m, apiPricing.outputPrice1m)
      : null;

  const domainRows = DOMAINS.map((domainDef) => {
    const arena = arenaByDomain.get(domainDef.key);
    const metric = metricsByDomain.get(domainDef.key);

    return {
      domain: domainDef.key,
      elo: arena?.eloScore ?? metric?.eloScore ?? null,
      valueScore: metric?.valueScore ?? null,
      rank: arena?.rank ?? null,
    };
  }).filter((row) => row.elo != null || row.valueScore != null || row.rank != null);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
        <ModelHeader model={model} vendor={vendor} />

        <section className="grid gap-4 md:grid-cols-3">
          <ModelScoreCard
            title="Track Quality"
            mainValue={
              overallArena?.eloScore != null ? Math.round(overallArena.eloScore) : "—"
            }
            mainLabel="Overall Elo"
            subItems={[
              { label: "Rank", value: overallArena?.rank != null ? `#${overallArena.rank}` : "—" },
              { label: "Votes", value: formatNumber(overallArena?.votes) },
              {
                label: "Domain",
                value: overallArena?.domain
                  ? DOMAIN_MAP[overallArena.domain].label
                  : "—",
              },
            ]}
            variant="quality"
          />

          <ModelScoreCard
            title="API Pricing"
            mainValue={formatPrice(blendedPrice)}
            mainLabel="Blended per 1M tokens"
            subItems={[
              { label: "Input", value: formatPrice(apiPricing?.inputPrice1m) },
              { label: "Output", value: formatPrice(apiPricing?.outputPrice1m) },
            ]}
            variant="pricing"
          />

          <ModelScoreCard
            title="Value Score"
            mainValue={
              overallMetric?.valueScore != null
                ? overallMetric.valueScore.toFixed(1)
                : "—"
            }
            mainLabel="Overall Value"
            subItems={[
              {
                label: "Value Rank",
                value:
                  overallMetric?.valueRank != null
                    ? `#${overallMetric.valueRank}`
                    : "—",
              },
              {
                label: "Elo per Dollar",
                value:
                  overallMetric?.eloPerDollar != null
                    ? formatNumber(overallMetric.eloPerDollar)
                    : "—",
              },
            ]}
            variant="value"
          />
        </section>

        <section className="mt-8 rounded-xl border border-line bg-panel p-6">
          <h2 className="text-lg font-semibold text-primary">Domain Breakdown</h2>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line/70 bg-table">
            <table className="w-full min-w-[520px] bg-table text-left text-sm">
              <thead className="bg-table-header">
                <tr>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Domain
                  </th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Elo
                  </th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Value Score
                  </th>
                  <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    Rank
                  </th>
                </tr>
              </thead>
              <tbody>
                {domainRows.length === 0 ? (
                  <tr className="border-t border-line/60">
                    <td colSpan={4} className="px-4 py-4">
                      <MissingDataBadge label="No domain metrics available" />
                    </td>
                  </tr>
                ) : (
                  domainRows.map((row) => (
                    <tr key={row.domain} className="border-t border-line/60">
                      <td className="px-4 py-3 text-primary">
                        {DOMAIN_MAP[row.domain].label}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-primary">
                        {row.elo != null ? Math.round(row.elo) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-primary">
                        {row.valueScore != null ? row.valueScore.toFixed(1) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-primary">
                        {row.rank != null ? `#${row.rank}` : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8">
          <ModelPricingCard pricing={pricing} />
        </section>

        <div className="mt-8">
          <Link
            href="/leaderboard"
            className="inline-flex items-center text-sm text-accent hover:underline"
          >
            ← Back to Leaderboard
          </Link>
        </div>
      </main>
    </div>
  );
}
