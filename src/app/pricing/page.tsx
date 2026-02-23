"use client";

import { useState } from "react";
import useSWR from "swr";
import PricingTable from "@/components/pricing/PricingTable";
import PricingInsights from "@/components/pricing/PricingInsights";
import type { PricingResponse } from "@/lib/types";

const fetcher = async (url: string): Promise<PricingResponse> => {
    const res = await fetch(url);
    const payload = (await res.json()) as PricingResponse;
    if (!res.ok || payload.status === "error") {
        throw new Error(payload.message || "Failed to fetch pricing");
    }
    return payload;
};

export default function PricingPage() {
    const [selectedVendor] = useState<string | null>(null);

    // Fetch all pricing data
    const { data, error, isLoading } = useSWR<PricingResponse>(
        `/api/pricing?${selectedVendor ? `vendor=${selectedVendor}` : ""}`,
        fetcher
    );

    return (
        <div className="mx-auto max-w-7xl space-y-6 pt-4 lg:pt-6">
            <header className="flex flex-col gap-2">
                <h1 className="text-2xl font-serif font-normal text-primary tracking-tight">API & Consumer Pricing</h1>
                <p className="text-sm text-muted">
                    Compare costs across different models and vendors. Toggle between API rates and consumer subscription plans.
                </p>
            </header>

            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 rounded-full border-t-2 border-line border-r-2 border-r-primary animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-bad text-red-700 p-4 rounded-lg border border-red-200">
                    Failed to load pricing data. Please try again.
                </div>
            ) : data ? (
                <div className="space-y-6">
                    {data.status === "partial" && (
                        <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:border-yellow-700/60 dark:bg-yellow-900/25 dark:text-yellow-200">
                            {data.message || "Pricing data updated partially in the latest run."}
                        </div>
                    )}
                    <PricingInsights data={data} />
                    <PricingTable data={data} />
                </div>
            ) : null}
        </div>
    );
}
