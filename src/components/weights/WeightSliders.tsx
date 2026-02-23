"use client";

import type { DomainKey } from "@/lib/constants";
import { DOMAINS } from "@/lib/constants";

interface WeightSlidersProps {
    weights: Record<DomainKey, number>;
    onChange: (weights: Record<DomainKey, number>) => void;
}

export default function WeightSliders({ weights, onChange }: WeightSlidersProps) {
    const handleWeightChange = (key: DomainKey, value: number) => {
        onChange({ ...weights, [key]: value });
    };

    return (
        <div className="flex flex-col gap-4 bg-panel2 border border-line p-4 rounded-lg shadow-inner">
            <h3 className="text-sm font-semibold text-primary mb-2">Domain Weights</h3>
            {DOMAINS.map((domain) => (
                <div key={domain.key} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted font-medium">{domain.label}</span>
                        <span className="text-primary font-mono bg-chip px-1.5 py-0.5 rounded text-[10px]">
                            {weights[domain.key]?.toFixed(1) || "1.0"}
                        </span>
                    </div>
                    <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.1}
                        value={weights[domain.key] || 1}
                        onChange={(e) => handleWeightChange(domain.key, parseFloat(e.target.value))}
                        className="w-full accent-blue-500 h-1.5 bg-line rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow"
                    />
                </div>
            ))}
        </div>
    );
}
