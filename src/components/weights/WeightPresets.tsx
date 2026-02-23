"use client";

import type { DomainKey } from "@/lib/constants";
import Chip from "../shared/Chip";

interface WeightPresetsProps {
    onSelect: (weights: Record<DomainKey, number>) => void;
}

const PRESETS: Record<string, Partial<Record<DomainKey, number>>> = {
    Balanced: {}, // all 1s (default)
    "Text Focus": { text: 5 },
    "Code Focus": { code: 5 },
    "Vision Focus": { vision: 5 },
    "Search Focus": { search: 5 },
};

export default function WeightPresets({ onSelect }: WeightPresetsProps) {
    const handleSelect = (name: string, partialWeights: Partial<Record<DomainKey, number>>) => {
        // Default is 1 for everything
        const newWeights: Record<DomainKey, number> = {
            overall: 1,
            text: 1,
            code: 1,
            "text-to-image": 1,
            "image-edit": 1,
            "text-to-video": 1,
            "image-to-video": 1,
            vision: 1,
            search: 1,
        };

        // Apply preset boost
        for (const [key, val] of Object.entries(partialWeights)) {
            newWeights[key as DomainKey] = val;
        }

        onSelect(newWeights);
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider">Presets</h3>
            <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([name, weights]) => (
                    <Chip
                        key={name}
                        label={name}
                        onClick={() => handleSelect(name, weights)}
                        active={false} // Would be nice to show active preset, but keeping simple
                    />
                ))}
            </div>
        </div>
    );
}
