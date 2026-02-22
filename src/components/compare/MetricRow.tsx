import MissingDataBadge from "../shared/MissingDataBadge";
import { formatCurrency, formatNumber, formatElo, formatContextWindow } from "@/lib/utils";

type FormatType = "number" | "currency" | "score" | "text" | "context";

interface MetricRowProps {
    label: string;
    values: (number | string | null)[];
    format: FormatType;
    higherIsBetter: boolean;
}

export default function MetricRow({ label, values, format, higherIsBetter }: MetricRowProps) {
    // Extract non-null numeric values to compute best/worst
    const numValues = values
        .map(v => (typeof v === "number" ? v : parseFloat(v as string)))
        .filter(v => !isNaN(v) && v !== null);

    let bestVal = -Infinity;
    let worstVal = Infinity;

    if (numValues.length > 0) {
        const max = Math.max(...numValues);
        const min = Math.min(...numValues);
        bestVal = higherIsBetter ? max : min;
        worstVal = higherIsBetter ? min : max;
    }

    const formatValue = (val: number | string | null) => {
        if (val === null) return <MissingDataBadge />;
        if (typeof val === "string" && format !== "number" && format !== "currency" && format !== "score" && format !== "context") {
            return val;
        }

        // For numeric formatting
        const num = typeof val === "number" ? val : parseFloat(val);
        if (isNaN(num)) return val;

        switch (format) {
            case "currency":
                // Usually these are fractions of a cent, so more decimals
                return formatCurrency(num, "USD", num < 0.01 ? 4 : 2);
            case "score":
                return formatElo(num);
            case "context":
                return formatContextWindow(num);
            case "number":
                return formatNumber(num);
            default:
                return String(val);
        }
    };

    const getCellClasses = (val: number | string | null) => {
        if (val === null) return "text-center py-4 px-2 border-b border-line";
        const num = typeof val === "number" ? val : parseFloat(val);
        if (isNaN(num)) return "text-primary text-center py-4 px-2 border-b border-line";

        // If all values are the same, don't highlight best/worst
        if (bestVal === worstVal) {
            return "text-primary text-center py-4 px-2 border-b border-line font-medium";
        }

        if (num === bestVal) {
            return "text-emerald-700 bg-good font-bold text-center py-4 px-2 border-b border-line rounded-md m-1";
        }
        if (num === worstVal) {
            return "text-muted/50 text-center py-4 px-2 border-b border-line";
        }
        return "text-primary text-center py-4 px-2 border-b border-line font-medium";
    };

    return (
        <tr className="hover:bg-chip/50 transition-colors group">
            <td className="sticky left-0 bg-background group-hover:bg-chip/50 p-4 text-sm font-medium text-muted border-b border-line min-w-[200px] shadow-[1px_0_0_0_var(--line)]">
                {label}
            </td>
            {values.map((val, idx) => (
                <td key={idx} className={getCellClasses(val)}>
                    {formatValue(val)}
                </td>
            ))}
        </tr>
    );
}
