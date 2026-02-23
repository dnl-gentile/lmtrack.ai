"use client";

import type { CompareModel } from "@/lib/types";
import CompareColumn from "./CompareColumn";
import MetricRow from "./MetricRow";

interface CompareMatrixProps {
    models: CompareModel[];
    onRemove: (slug: string) => void;
}

export default function CompareMatrix({ models, onRemove }: CompareMatrixProps) {
    if (models.length === 0) return null;

    return (
        <div className="relative w-full overflow-x-auto rounded-[20px] border border-line bg-table pb-8 shadow-2xl">
            <table className="w-full border-collapse bg-table text-sm">
                <thead>
                    <tr>
                        <th className="sticky left-0 top-0 z-20 min-w-[200px] border-b border-line bg-table shadow-[1px_0_0_0_var(--line)] p-4">
                            <span className="sr-only">Metrics</span>
                        </th>
                        {models.map(m => (
                            <CompareColumn
                                key={m.model.slug}
                                model={m.model}
                                onRemove={() => onRemove(m.model.slug)}
                            />
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {/* QUALITY SCORES SECTION */}
                    <tr>
                        <th colSpan={models.length + 1} className="sticky left-0 border-b border-line bg-table-header px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted shadow-[1px_0_0_0_var(--line)]">
                            Quality Scores
                        </th>
                    </tr>
                    <MetricRow
                        label="Arena Elo (Overall)"
                        values={models.map(m => m.arenaScores?.overall?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Text)"
                        values={models.map(m => m.arenaScores?.text?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Code)"
                        values={models.map(m => m.arenaScores?.code?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Text-to-Image)"
                        values={models.map(m => m.arenaScores?.["text-to-image"]?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Image Edit)"
                        values={models.map(m => m.arenaScores?.["image-edit"]?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Text-to-Video)"
                        values={models.map(m => m.arenaScores?.["text-to-video"]?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Image-to-Video)"
                        values={models.map(m => m.arenaScores?.["image-to-video"]?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Vision)"
                        values={models.map(m => m.arenaScores?.vision?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Arena Elo (Search)"
                        values={models.map(m => m.arenaScores?.search?.elo ?? null)}
                        format="score"
                        higherIsBetter={true}
                    />

                    {/* PRICING SECTION */}
                    <tr>
                        <th colSpan={models.length + 1} className="sticky left-0 border-b border-line bg-table-header px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted shadow-[1px_0_0_0_var(--line)]">
                            Pricing (API)
                        </th>
                    </tr>
                    <MetricRow
                        label="Input $/1M"
                        values={models.map(m => m.pricing?.api?.input1m ?? null)}
                        format="currency"
                        higherIsBetter={false}
                    />
                    <MetricRow
                        label="Output $/1M"
                        values={models.map(m => m.pricing?.api?.output1m ?? null)}
                        format="currency"
                        higherIsBetter={false}
                    />
                    <MetricRow
                        label="Blended $/1M"
                        values={models.map(m => m.pricing?.api?.blended1m ?? null)}
                        format="currency"
                        higherIsBetter={false}
                    />

                    {/* VALUE METRICS SECTION */}
                    <tr>
                        <th colSpan={models.length + 1} className="sticky left-0 border-b border-line bg-table-header px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted shadow-[1px_0_0_0_var(--line)]">
                            Value Metrics
                        </th>
                    </tr>
                    <MetricRow
                        label="Elo per Dollar"
                        values={models.map(m => m.valueMetrics?.overall?.eloPerDollar ?? null)}
                        format="number"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Value Score"
                        values={models.map(m => m.valueMetrics?.overall?.valueScore ?? null)}
                        format="number"
                        higherIsBetter={true}
                    />

                    {/* SPECIFICATIONS SECTION */}
                    <tr>
                        <th colSpan={models.length + 1} className="sticky left-0 border-b border-line bg-table-header px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted shadow-[1px_0_0_0_var(--line)]">
                            Specifications
                        </th>
                    </tr>
                    <MetricRow
                        label="Context Window"
                        values={models.map(m => m.model.contextWindow ?? null)}
                        format="context"
                        higherIsBetter={true}
                    />
                    <MetricRow
                        label="Modality"
                        values={models.map(m => m.model.modality ?? null)}
                        format="text"
                        higherIsBetter={false} // doesn't matter for text
                    />
                    <MetricRow
                        label="Release Date"
                        values={models.map(m => m.model.releaseDate ?? null)}
                        format="text"
                        higherIsBetter={false}
                    />
                </tbody>
            </table>
        </div>
    );
}
