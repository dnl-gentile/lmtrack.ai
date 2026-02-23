"use client";

import { useEffect, useState } from "react";
import FilterPanel from "@/components/filters/FilterPanel";
import DomainFilter from "@/components/filters/DomainFilter";
import VendorFilter from "@/components/filters/VendorFilter";
import PriceFilter from "@/components/filters/PriceFilter";
import ContextFilter from "@/components/filters/ContextFilter";
import ModalityFilter from "@/components/filters/ModalityFilter";
import ArenaToggle from "@/components/filters/ArenaToggle";
import SearchInput from "@/components/shared/SearchInput";
import type { FilterState } from "@/lib/types";
import { DOMAIN_MAP } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface FilterColumnProps {
    domain: DomainKey;
    filters: FilterState;
    setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
    resetFilters: () => void;
}

const LICENSE_OPTIONS = ["All", "Proprietary", "Open Source"] as const;

export default function FilterColumn({
    domain,
    filters,
    setFilter,
    resetFilters,
}: FilterColumnProps) {
    const domainDef = DOMAIN_MAP[domain];
    const categories = domainDef.categories;
    const showStyleControl = domainDef.showStyleControl ?? true;
    const showContextFilter = domainDef.showContextFilter ?? true;
    const showModalityFilter = domainDef.showModalityFilter ?? true;

    const [license, setLicense] = useState<typeof LICENSE_OPTIONS[number]>("All");
    const [selectedCategory, setSelectedCategory] = useState<string>(
        categories[0]?.key ?? ""
    );

    useEffect(() => {
        setSelectedCategory(categories[0]?.key ?? "");
    }, [categories, domain]);

    return (
        <div className="px-2 py-2">
        <FilterPanel>
            <FilterPanel.Section title="Rank by" iconKey="rank" defaultExpanded={true}>
                <div className="inline-flex w-full rounded-lg border border-line bg-chip p-0.5">
                    <button
                        type="button"
                        onClick={() => setFilter("rankBy", "models")}
                        className={`flex-1 rounded-md px-3 py-2 text-[14px] transition-colors ${
                            filters.rankBy === "models"
                                ? "bg-chip-active-bg text-primary shadow-sm"
                                : "text-muted hover:bg-hover hover:text-primary"
                        }`}
                    >
                        Models
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilter("rankBy", "labs")}
                        className={`flex-1 rounded-md px-3 py-2 text-[14px] transition-colors ${
                            filters.rankBy === "labs"
                                ? "bg-chip-active-bg text-primary shadow-sm"
                                : "text-muted hover:bg-hover hover:text-primary"
                        }`}
                    >
                        Labs
                    </button>
                </div>
            </FilterPanel.Section>
            
            {categories.length > 0 && (
                <FilterPanel.Section
                    title={`Categories (${categories.length})`}
                    iconKey="categories"
                    defaultExpanded={true}
                >
                    <DomainFilter
                        options={categories}
                        selected={selectedCategory}
                        onSelect={setSelectedCategory}
                    />
                </FilterPanel.Section>
            )}

            <FilterPanel.Section title="License Type" iconKey="license" defaultExpanded={true}>
                <div className="flex flex-col gap-1">
                    {LICENSE_OPTIONS.map((opt) => {
                        const isSelected = license === opt;
                        return (
                            <label
                                key={opt}
                                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[14px] cursor-pointer transition-colors ${
                                    isSelected ? "bg-chip-active-bg text-primary" : "text-muted hover:text-primary hover:bg-chip/50"
                                }`}
                            >
                                <div className="w-4 h-4 rounded-full border border-line flex items-center justify-center shrink-0">
                                    {isSelected ? <div className="w-2 h-2 rounded-full bg-primary" /> : null}
                                </div>
                                <span>{opt}</span>
                                <input
                                    type="radio"
                                    name="licenseType"
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() => setLicense(opt)}
                                />
                            </label>
                        );
                    })}
                </div>
            </FilterPanel.Section>
            
            <FilterPanel.Section title="Search" iconKey="search">
                <SearchInput
                    value={filters.searchQuery}
                    onChange={(v) => setFilter("searchQuery", v)}
                    placeholder="Model name..."
                />
            </FilterPanel.Section>
            
            <FilterPanel.Section title="Vendor" iconKey="vendor">
                <VendorFilter selected={filters.vendors} onToggle={(slug) => {
                    const next = filters.vendors.includes(slug)
                        ? filters.vendors.filter((v) => v !== slug)
                        : [...filters.vendors, slug];
                    setFilter("vendors", next);
                }} />
            </FilterPanel.Section>
            
            <FilterPanel.Section title="Price Range" iconKey="slider">
                <PriceFilter
                    min={filters.priceRange[0]}
                    max={filters.priceRange[1]}
                    onMinChange={(v) => setFilter("priceRange", [v, filters.priceRange[1]])}
                    onMaxChange={(v) => setFilter("priceRange", [filters.priceRange[0], v])}
                />
            </FilterPanel.Section>
            
            {showContextFilter && (
                <FilterPanel.Section title="Context Window" iconKey="context">
                    <ContextFilter
                        value={filters.contextMin}
                        onChange={(v) => setFilter("contextMin", v)}
                    />
                </FilterPanel.Section>
            )}
            
            {showModalityFilter && (
                <FilterPanel.Section title="Modality" iconKey="modality">
                    <ModalityFilter selected={filters.modalities} onToggle={(m: any) => {
                        const next = filters.modalities.includes(m)
                            ? filters.modalities.filter((x: any) => x !== m)
                            : [...filters.modalities, m];
                        setFilter("modalities", next);
                    }} />
                </FilterPanel.Section>
            )}
            
            {showStyleControl && (
                <FilterPanel.Section title="Style Control" iconKey="style" defaultExpanded={true}>
                    <ArenaToggle
                        checked={filters.onlyWithArena}
                        onChange={(v) => setFilter("onlyWithArena", v)}
                    />
                </FilterPanel.Section>
            )}
            
            <button
                type="button"
                onClick={resetFilters}
                className="mt-6 text-[13px] font-medium text-muted hover:text-primary w-full text-center"
            >
                Reset all filters
            </button>
        </FilterPanel>
        </div>
    );
}
