import MissingDataBadge from "@/components/shared/MissingDataBadge";
import type { Pricing } from "@/lib/types";
import { formatCurrency, computeBlendedPrice } from "@/lib/utils";

interface ModelPricingCardProps {
  pricing: Pricing[];
}

function selectCurrentOrLatest(pricing: Pricing[]): Pricing[] {
  if (pricing.length === 0) return [];

  const current = pricing.filter((row) => row.isCurrent);
  if (current.length > 0) return current;

  const latestSnapshot = pricing.reduce((latest, row) => {
    return row.snapshotDate > latest ? row.snapshotDate : latest;
  }, pricing[0].snapshotDate);

  return pricing.filter((row) => row.snapshotDate === latestSnapshot);
}

function formatPrice(value: number | null | undefined): string {
  if (value == null) return "—";
  return formatCurrency(value, "USD", value < 0.01 ? 4 : 2);
}

export default function ModelPricingCard({ pricing }: ModelPricingCardProps) {
  const selectedPricing = selectCurrentOrLatest(pricing);
  const apiPricing =
    selectedPricing
      .filter((row) => row.pricingType === "api")
      .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))[0] ?? null;
  const consumerPlans = selectedPricing
    .filter((row) => row.pricingType === "consumer")
    .sort((a, b) => {
      const aPrice = a.monthlyPriceUsd ?? Number.MAX_SAFE_INTEGER;
      const bPrice = b.monthlyPriceUsd ?? Number.MAX_SAFE_INTEGER;
      return aPrice - bPrice;
    });

  if (selectedPricing.length === 0) {
    return (
      <section className="rounded-xl border border-line bg-panel p-6">
        <h2 className="text-lg font-semibold text-primary">Pricing Details</h2>
        <div className="mt-4">
          <MissingDataBadge label="No pricing data available" />
        </div>
      </section>
    );
  }

  const blendedPrice =
    apiPricing?.inputPrice1m != null && apiPricing.outputPrice1m != null
      ? computeBlendedPrice(apiPricing.inputPrice1m, apiPricing.outputPrice1m)
      : null;

  return (
    <section className="rounded-2xl border border-line bg-panel p-6">
      <h2 className="text-lg font-semibold text-primary">Pricing Details</h2>

      <div className="mt-4 space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted">API Pricing</h3>
          {apiPricing ? (
            <div className="mt-2 overflow-x-auto rounded-[20px] border border-line/70 bg-table">
              <table className="w-full min-w-[380px] bg-table text-left text-sm">
                <thead className="bg-table-header">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Metric
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-line/60">
                    <td className="px-4 py-3 text-primary">Input per 1M tokens</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-primary">
                      {formatPrice(apiPricing.inputPrice1m)}
                    </td>
                  </tr>
                  <tr className="border-t border-line/60">
                    <td className="px-4 py-3 text-primary">Output per 1M tokens</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-primary">
                      {formatPrice(apiPricing.outputPrice1m)}
                    </td>
                  </tr>
                  <tr className="border-t border-line/60">
                    <td className="px-4 py-3 text-primary">Blended per 1M tokens</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-primary">
                      {formatPrice(blendedPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3">
              <MissingDataBadge label="No API pricing" />
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted">Consumer Plans</h3>
          {consumerPlans.length > 0 ? (
            <div className="mt-2 overflow-x-auto rounded-[20px] border border-line/70 bg-table">
              <table className="w-full min-w-[480px] bg-table text-left text-sm">
                <thead className="bg-table-header">
                  <tr>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Plan
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Monthly
                    </th>
                    <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Usage Limits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {consumerPlans.map((plan) => (
                    <tr key={plan.id} className="border-t border-line/60">
                      <td className="px-4 py-3 text-primary">
                        {plan.planName ?? "Unknown Plan"}
                      </td>
                      <td className="px-4 py-3 font-mono tabular-nums text-primary">
                        {formatPrice(plan.monthlyPriceUsd)}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {plan.usageLimits ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-3">
              <MissingDataBadge label="No consumer plans" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
