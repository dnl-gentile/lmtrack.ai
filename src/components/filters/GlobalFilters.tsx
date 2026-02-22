"use client";

import { usePathname } from "next/navigation";
import FilterPanel from "@/components/filters/FilterPanel";
import DomainFilter from "@/components/filters/DomainFilter";
import VendorFilter from "@/components/filters/VendorFilter";
import PriceFilter from "@/components/filters/PriceFilter";
import ContextFilter from "@/components/filters/ContextFilter";
import ModalityFilter from "@/components/filters/ModalityFilter";
import ArenaToggle from "@/components/filters/ArenaToggle";
import SearchInput from "@/components/shared/SearchInput";
import { useFilters } from "@/hooks/useFilters";
import { DOMAINS, type DomainKey } from "@/lib/constants";

export default function GlobalFilters() {
    const pathname = usePathname();

    // Only render on leaderboard domain pages (e.g. /leaderboard/coding)
    // We do NOT render on the /leaderboard overview page.
    const isLeaderboard = pathname?.startsWith("/leaderboard");
    const isOverview = pathname === "/leaderboard" || pathname === "/leaderboard/";

    if (!isLeaderboard || isOverview) {
        return null;
    }

    // Extract domain from pathname: e.g. /leaderboard/coding -> coding
    const pathParts = pathname?.split("/") || [];
    const domainParam = pathParts[2] || "overall";
    const domain = DOMAINS.find(d => d.key === domainParam)?.key || "overall";

    const { filters, setFilter, resetFilters } = useFilters(domain as DomainKey);

    return (
        <FilterPanel>
            <FilterPanel.Section title="Search">
                <SearchInput
                    value={filters.searchQuery}
                    onChange={(v) => setFilter("searchQuery", v)}
                    placeholder="Model name..."
                />
            </FilterPanel.Section>
            <FilterPanel.Section title="Domain">
                <DomainFilter selected={filters.domains} onToggle={(key) => {
                    const next = filters.domains.includes(key)
                        ? filters.domains.filter((d) => d !== key)
                        : [...filters.domains, key];
                    setFilter("domains", next);
                }} />
            </FilterPanel.Section>
            <FilterPanel.Section title="Vendor">
                <VendorFilter selected={filters.vendors} onToggle={(slug) => {
                    const next = filters.vendors.includes(slug)
                        ? filters.vendors.filter((v) => v !== slug)
                        : [...filters.vendors, slug];
                    setFilter("vendors", next);
                }} />
            </FilterPanel.Section>
            <FilterPanel.Section title="Price">
                <PriceFilter
                    min={filters.priceRange[0]}
                    max={filters.priceRange[1]}
                    onMinChange={(v) => setFilter("priceRange", [v, filters.priceRange[1]])}
                    onMaxChange={(v) => setFilter("priceRange", [filters.priceRange[0], v])}
                />
            </FilterPanel.Section>
            <FilterPanel.Section title="Context">
                <ContextFilter
                    value={filters.contextMin}
                    onChange={(v) => setFilter("contextMin", v)}
                />
            </FilterPanel.Section>
            <FilterPanel.Section title="Modality">
                <ModalityFilter selected={filters.modalities} onToggle={(m: any) => {
                    const next = filters.modalities.includes(m)
                        ? filters.modalities.filter((x: any) => x !== m)
                        : [...filters.modalities, m];
                    setFilter("modalities", next);
                }} />
            </FilterPanel.Section>
            <FilterPanel.Section title="Arena">
                <ArenaToggle
                    checked={filters.onlyWithArena}
                    onChange={(v) => setFilter("onlyWithArena", v)}
                />
            </FilterPanel.Section>
            <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs text-muted hover:text-primary"
            >
                Reset filters
            </button>
        </FilterPanel>
    );
}
