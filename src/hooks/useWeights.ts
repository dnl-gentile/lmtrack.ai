"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import type { MetricsResponse } from "@/lib/types";
import { DEFAULT_WEIGHTS, DOMAINS, type DomainKey } from "@/lib/constants";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useWeights(modelSlug?: string) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const getWeightsFromUrl = (): Record<DomainKey, number> => {
        const weightsParam = searchParams.get("weights");
        if (!weightsParam) return { ...DEFAULT_WEIGHTS };

        const weights: Partial<Record<DomainKey, number>> = {};
        weightsParam.split(",").forEach(pair => {
            const [k, v] = pair.split(":");
            // Make sure it's a valid domain
            if (DOMAINS.some(d => d.key === k)) {
                weights[k as DomainKey] = parseFloat(v);
            }
        });

        // Merge with defaults for missing ones
        return { ...DEFAULT_WEIGHTS, ...weights };
    };

    const activeWeights = getWeightsFromUrl();

    const updateWeights = (newWeights: Record<DomainKey, number>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Check if defaults
        const isDefault = Object.entries(newWeights).every(
            ([k, v]) => DEFAULT_WEIGHTS[k as DomainKey] === v
        );

        if (isDefault) {
            params.delete("weights");
        } else {
            const weightString = Object.entries(newWeights)
                .filter(([_, v]) => v !== 1) // Only store non-default to keep URL short
                .map(([k, v]) => `${k}:${v}`)
                .join(",");
            if (weightString) {
                params.set("weights", weightString);
            } else {
                params.delete("weights");
            }
        }

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // If a model is provided, fetch its weighted metrics
    const weightsQueryParam = searchParams.get("weights");
    const { data, error, isLoading } = useSWR<MetricsResponse>(
        modelSlug ? `/api/metrics?model=${modelSlug}&domain=overall${weightsQueryParam ? `&weights=${weightsQueryParam}` : ''}` : null,
        fetcher
    );

    return {
        weights: activeWeights,
        updateWeights,
        weightedMetrics: data,
        isLoading,
        isError: error,
    };
}
