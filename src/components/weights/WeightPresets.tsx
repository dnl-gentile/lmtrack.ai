"use client";

import type { DomainKey } from "@/lib/constants";
import Chip from "../shared/Chip";

interface WeightPresetsProps {
    onSelect: (weights: Record<DomainKey, number>) => void;
}

const PRESETS: Record<string, Partial<Record<DomainKey, number>>> = {
    Balanced: {}, // all 1s (default)
    "Coding Focus": { coding: 5 },
    "Creative Focus": { creative_writing: 5 },
    "Math Focus": { math: 5 },
};

export default function WeightPresets({ onSelect }: WeightPresetsProps) {
    const handleSelect = (name: string, partialWeights: Partial<Record<DomainKey, number>>) => {
        // Default is 1 for everything
        const newWeights: Record<DomainKey, number> = {
            overall: 1,
            coding: 1,
            math: 1,
            creative_writing: 1,
            hard_prompts: 1,
            instruction_following: 1,
            vision: 1,
            longer_query: 1,
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
