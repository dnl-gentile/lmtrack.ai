"use client";

import { useState, useEffect } from "react";
import SearchInput from "../shared/SearchInput";
import Chip from "../shared/Chip";

interface ModelSelectorProps {
    selectedSlugs: string[];
    onChange: (slugs: string[]) => void;
}

interface MiniModel {
    slug: string;
    canonicalName: string;
    vendorName: string;
}

export default function ModelSelector({ selectedSlugs, onChange }: ModelSelectorProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<MiniModel[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        if (!query) {
            setResults([]);
            setDropdownOpen(false);
            return;
        }
        const fetchModels = async () => {
            // In a real app we'd call an api like /api/models?search=query
            // Let's assume we do that, but since we didn't define it explicitly,
            // we can call a pricing/compare with no filters and filter locally for now,
            // actually let's just make the fetch request.
            try {
                const res = await fetch(`/api/pricing?type=api`);
                const json = await res.json();
                const models = json.models.map((m: any) => m.model) as MiniModel[];
                const matched = models.filter(
                    m => m.canonicalName.toLowerCase().includes(query.toLowerCase()) ||
                        m.vendorName.toLowerCase().includes(query.toLowerCase())
                );
                setResults(matched.slice(0, 10)); // max 10 results
                setDropdownOpen(true);
            } catch (e) {
                console.error(e);
            }
        };
        fetchModels();
    }, [query]);

    const addModel = (slug: string) => {
        if (selectedSlugs.length >= 8) return;
        if (!selectedSlugs.includes(slug)) {
            onChange([...selectedSlugs, slug]);
        }
        setQuery("");
        setDropdownOpen(false);
    };

    const removeModel = (slug: string) => {
        onChange(selectedSlugs.filter(s => s !== slug));
    };

    return (
        <div className="w-full max-w-2xl relative">
            <div className="relative">
                <SearchInput
                    value={query}
                    onChange={setQuery}
                    placeholder="Search models to compare..."
                    debounceMs={200}
                />
                {dropdownOpen && results.length > 0 && (
                    <div className="absolute top-12 left-0 w-full z-50 bg-panel border border-line rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                        <ul>
                            {results.map((mdl) => (
                                <li key={mdl.slug}>
                                    <button
                                        onClick={() => addModel(mdl.slug)}
                                        disabled={selectedSlugs.includes(mdl.slug) || selectedSlugs.length >= 8}
                                        className="w-full text-left px-4 py-3 text-sm hover:bg-chip/50 disabled:opacity-50 disabled:cursor-not-allowed flex justify-between items-center transition-colors"
                                    >
                                        <span className="text-primary font-medium">{mdl.canonicalName}</span>
                                        <span className="text-muted text-xs">{mdl.vendorName}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {selectedSlugs.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {selectedSlugs.map((slug) => (
                        <Chip
                            key={slug}
                            label={slug} // We can show the actual name if we resolve it, but slug works for now
                            active
                            removable
                            onRemove={() => removeModel(slug)}
                        />
                    ))}
                </div>
            )}

            {selectedSlugs.length >= 8 && (
                <p className="text-xs text-amber-500 mt-2 ml-1">Maximum 8 models reached.</p>
            )}
        </div>
    );
}
