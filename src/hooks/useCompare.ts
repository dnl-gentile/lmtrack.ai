"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import useSWR from "swr";
import type { CompareResponse } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useCompare() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const modelsParam = searchParams.get("models");
    const selectedSlugs = modelsParam ? modelsParam.split(",").filter(Boolean) : [];

    const updateSlugs = (slugs: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (slugs.length > 0) {
            params.set("models", slugs.join(","));
        } else {
            params.delete("models");
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const { data, error, isLoading } = useSWR<CompareResponse>(
        modelsParam ? `/api/compare?models=${modelsParam}` : null,
        fetcher
    );

    return {
        selectedSlugs,
        updateSlugs,
        models: data?.models || [],
        isLoading,
        isError: error,
    };
}
