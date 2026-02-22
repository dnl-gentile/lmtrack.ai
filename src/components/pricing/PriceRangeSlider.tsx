"use client";

import { useState, useEffect, useRef } from "react";

interface PriceRangeSliderProps {
    min: number;
    max: number;
    value: [number, number];
    onChange: (value: [number, number]) => void;
}

export default function PriceRangeSlider({ min, max, value, onChange }: PriceRangeSliderProps) {
    const [localValue, setLocalValue] = useState<[number, number]>(value);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (index: 0 | 1, val: number) => {
        const newValue: [number, number] = [...localValue] as [number, number];
        newValue[index] = val;

        // Ensure min <= max
        if (index === 0 && newValue[0] > newValue[1]) {
            newValue[0] = newValue[1];
        } else if (index === 1 && newValue[1] < newValue[0]) {
            newValue[1] = newValue[0];
        }

        setLocalValue(newValue);
    };

    const handlePointerUp = () => {
        onChange(localValue);
    };

    // Calculate percentages for styling
    const range = max - min;
    const leftPercent = ((localValue[0] - min) / range) * 100;
    const rightPercent = ((localValue[1] - min) / range) * 100;

    return (
        <div className="w-full flex flex-col gap-4">
            <div className="flex justify-between text-xs text-muted font-medium">
                <span>${localValue[0].toFixed(2)}</span>
                <span>${localValue[1].toFixed(2)}{localValue[1] === max ? "+" : ""}</span>
            </div>

            <div className="relative h-6 flex items-center" ref={trackRef}>
                {/* Background Track */}
                <div className="absolute w-full h-1.5 bg-line rounded-full" />

                {/* Active Range */}
                <div
                    className="absolute h-1.5 bg-blue-500/30 rounded-full pointer-events-none"
                    style={{ left: `${leftPercent}%`, right: `${100 - rightPercent}%` }}
                />

                {/* Left Thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={0.01}
                    value={localValue[0]}
                    onChange={(e) => handleChange(0, parseFloat(e.target.value))}
                    onPointerUp={handlePointerUp}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none select-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-line"
                    style={{ zIndex: localValue[0] > max - (max - min) / 2 ? 20 : 10 }}
                />

                {/* Right Thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={0.01}
                    value={localValue[1]}
                    onChange={(e) => handleChange(1, parseFloat(e.target.value))}
                    onPointerUp={handlePointerUp}
                    className="absolute w-full appearance-none bg-transparent pointer-events-none select-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-grab active:[&::-webkit-slider-thumb]:cursor-grabbing [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-line z-20"
                />
            </div>
        </div>
    );
}
