"use client";

import { useState } from "react";
import useSWR from "swr";
import PricingTable from "@/components/pricing/PricingTable";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function PricingPage() {
    const [selectedVendor] = useState<string | null>(null);

    // Fetch all pricing data
    const { data, error, isLoading } = useSWR(
        `/api/pricing?${selectedVendor ? `vendor=${selectedVendor}` : ""}`,
        fetcher
    );

    return (
        <div className="mx-auto max-w-7xl space-y-6">
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
                <div className="bg-bad text-red-700 p-4 rounded-xl border border-red-200">
                    Failed to load pricing data. Please try again.
                </div>
            ) : data ? (
                <PricingTable data={data} />
            ) : null}
        </div>
    );
}
