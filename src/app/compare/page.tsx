"use client";

import { Suspense } from "react";
import { useCompare } from "@/hooks/useCompare";
import ModelSelector from "@/components/compare/ModelSelector";
import CompareMatrix from "@/components/compare/CompareMatrix";

function ComparePageContent() {
    const { selectedSlugs, updateSlugs, models, isLoading, isError } = useCompare();

    const handleRemove = (slug: string) => {
        updateSlugs(selectedSlugs.filter((s) => s !== slug));
    };

    return (
        <div className="flex-1 overflow-auto bg-background">
            <main className="min-h-full p-6 lg:p-10 max-w-7xl mx-auto flex flex-col gap-8">
                <header className="flex flex-col gap-2">
                    <h1 className="text-2xl font-serif font-normal text-primary tracking-tight">Compare Models</h1>
                    <p className="text-sm text-muted">
                        Select up to 8 models to compare their capabilities, pricing, and value metrics side-by-side.
                    </p>
                </header>

                <section className="flex flex-col items-center max-w-2xl w-full">
                    <ModelSelector
                        selectedSlugs={selectedSlugs}
                        onChange={updateSlugs}
                    />
                </section>

                {selectedSlugs.length > 0 ? (
                    <section className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="w-8 h-8 rounded-full border-t-2 border-primary animate-spin"></div>
                            </div>
                        ) : isError ? (
                            <div className="bg-bad/10 text-red-700 p-4 rounded-lg border border-bad/20">
                                Failed to load comparison data. Please try again.
                            </div>
                        ) : (
                            <CompareMatrix
                                models={models}
                                onRemove={handleRemove}
                            />
                        )}
                    </section>
                ) : (
                    <section className="mt-12 flex flex-col items-center justify-center p-12 border border-dashed border-line rounded-xl bg-chip/30">
                        <div className="text-muted mb-4 text-center">
                            <span className="block text-4xl mb-2">📊</span>
                            <h2 className="text-xl font-semibold text-primary mb-1">Select models to compare</h2>
                            <p className="text-sm">Search for models above to start building your comparison matrix.</p>
                        </div>
                        <div className="flex gap-2 text-sm mt-4">
                            <span className="text-muted">Suggestions:</span>
                            <button onClick={() => updateSlugs(["gpt-4o", "claude-3-5-sonnet", "gemini-1-5-pro"])} className="text-accent hover:underline">
                                Flagship Models
                            </button>
                            <span className="text-muted">•</span>
                            <button onClick={() => updateSlugs(["gpt-4o-mini", "claude-3-haiku", "gemini-1-5-flash"])} className="text-accent hover:underline">
                                Fast & Cheap
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-muted">Loading compare page...</div>}>
            <ComparePageContent />
        </Suspense>
    );
}
