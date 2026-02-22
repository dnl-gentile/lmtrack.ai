import VendorLogo from "../shared/VendorLogo";

interface CompareColumnProps {
    model: {
        slug: string;
        canonicalName: string;
        vendorSlug: string;
        vendorName: string;
    };
    onRemove: () => void;
}

export default function CompareColumn({ model, onRemove }: CompareColumnProps) {
    return (
        <th className="min-w-[180px] p-4 border-b border-line relative group bg-background sticky top-0 z-10">
            <div className="flex flex-col items-center gap-2">
                <VendorLogo vendor={model.vendorSlug} size={32} />
                <div className="text-center">
                    <div className="text-sm font-semibold text-primary mb-1">{model.canonicalName}</div>
                    <div className="text-xs text-muted">{model.vendorName}</div>
                </div>
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-line text-muted hover:text-primary hover:bg-chip opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 outline-none"
                aria-label={`Remove ${model.canonicalName}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
            </button>
        </th>
    );
}
