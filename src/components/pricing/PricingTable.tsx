"use client";

import { useState } from "react";
import type { PricingResponse } from "@/lib/types";
import PricingRow from "./PricingRow";

interface PricingTableProps {
    data: PricingResponse;
}

type SortField = "input" | "output" | "name" | "monthly";
type SortDir = "asc" | "desc";

export default function PricingTable({ data }: PricingTableProps) {
    const [view, setView] = useState<"api" | "consumer">("api");
    const [sortField, setSortField] = useState<SortField>("input");
    const [sortDir, setSortDir] = useState<SortDir>("asc");

    const toggleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDir("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className="opacity-0 group-hover:opacity-50 ml-1">↕</span>;
        return <span className="text-primary ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>;
    };

    let rows = [];

    if (view === "api") {
        rows = data.models
            .filter(m => m.apiPricing)
            .map(m => ({
                model: m.model,
                pricing: m.apiPricing!,
                sourceUrl: m.sourceUrl,
                key: m.model.slug
            }))
            .sort((a, b) => {
                let valA, valB;
                if (sortField === "name") {
                    valA = a.model.canonicalName;
                    valB = b.model.canonicalName;
                } else if (sortField === "input") {
                    valA = a.pricing.input1m;
                    valB = b.pricing.input1m;
                } else if (sortField === "output") {
                    valA = a.pricing.output1m;
                    valB = b.pricing.output1m;
                } else {
                    valA = a.pricing.input1m;
                    valB = b.pricing.input1m;
                }

                if (valA < valB) return sortDir === "asc" ? -1 : 1;
                if (valA > valB) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
    } else {
        rows = data.models
            .flatMap(m => m.consumerPlans.map(plan => ({
                model: m.model,
                plan,
                sourceUrl: m.sourceUrl,
                key: `${m.model.slug}-${plan.planName}`
            })))
            .sort((a, b) => {
                let valA, valB;
                if (sortField === "name") {
                    valA = a.model.canonicalName;
                    valB = b.model.canonicalName;
                } else if (sortField === "monthly") {
                    valA = a.plan.monthlyUsd;
                    valB = b.plan.monthlyUsd;
                } else {
                    valA = a.plan.monthlyUsd;
                    valB = b.plan.monthlyUsd;
                }

                if (valA < valB) return sortDir === "asc" ? -1 : 1;
                if (valA > valB) return sortDir === "asc" ? 1 : -1;
                return 0;
            });
    }

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex bg-chip border border-line p-1 rounded-lg w-fit">
                <button
                    onClick={() => { setView("api"); setSortField("input"); setSortDir("asc"); }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === "api" ? "bg-table text-primary shadow-sm" : "text-muted hover:bg-hover hover:text-primary"
                        }`}
                >
                    API Pricing
                </button>
                <button
                    onClick={() => { setView("consumer"); setSortField("monthly"); setSortDir("asc"); }}
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${view === "consumer" ? "bg-table text-primary shadow-sm" : "text-muted hover:bg-hover hover:text-primary"
                        }`}
                >
                    Consumer Plans
                </button>
            </div>

            <div className="relative w-full overflow-x-auto rounded-[20px] border border-line bg-table">
                <table className="w-full border-collapse bg-table text-left text-sm">
                    <thead className="sticky top-0 z-10 border-b border-line bg-table-header">
                        <tr>
                            <th className="py-3 px-4 font-medium text-xs text-muted text-center w-12 cursor-default">#</th>
                            <th
                                className="group cursor-pointer select-none px-4 py-3 text-xs font-medium text-muted transition-colors hover:bg-hover"
                                onClick={() => toggleSort("name")}
                            >
                                Model <SortIcon field="name" />
                            </th>
                            <th className="py-3 px-4 font-medium text-xs text-muted cursor-default">Vendor</th>

                            {view === "api" ? (
                                <>
                                    <th
                                        className="group cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-muted transition-colors hover:bg-hover"
                                        onClick={() => toggleSort("input")}
                                    >
                                        Input $/1M <SortIcon field="input" />
                                    </th>
                                    <th
                                        className="group cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-muted transition-colors hover:bg-hover"
                                        onClick={() => toggleSort("output")}
                                    >
                                        Output $/1M <SortIcon field="output" />
                                    </th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Cached In</th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Batch In</th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Batch Out</th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Context</th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Source</th>
                                </>
                            ) : (
                                <>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Plan</th>
                                    <th
                                        className="group cursor-pointer select-none px-4 py-3 text-center text-xs font-medium text-muted transition-colors hover:bg-hover"
                                        onClick={() => toggleSort("monthly")}
                                    >
                                        Monthly $ <SortIcon field="monthly" />
                                    </th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted cursor-default">Limits</th>
                                    <th className="py-3 px-4 font-medium text-xs text-muted text-center cursor-default">Source</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r: any, idx) => (
                            view === "api" ? (
                                <PricingRow
                                    key={r.key}
                                    type="api"
                                    model={r.model}
                                    pricing={r.pricing}
                                    sourceUrl={r.sourceUrl}
                                    rank={idx + 1}
                                />
                            ) : (
                                <PricingRow
                                    key={r.key}
                                    type="consumer"
                                    model={r.model}
                                    plan={r.plan}
                                    sourceUrl={r.sourceUrl}
                                    rank={idx + 1}
                                />
                            )
                        ))}
                        {rows.length === 0 && (
                            <tr>
                                <td colSpan={10} className="py-12 text-center text-muted">
                                    No pricing data available.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
