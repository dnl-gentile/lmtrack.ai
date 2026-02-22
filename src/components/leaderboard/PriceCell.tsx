import { formatCurrency } from "@/lib/utils";
import MissingDataBadge from "@/components/shared/MissingDataBadge";

interface PriceCellProps {
  price: number | null;
}

export default function PriceCell({ price }: PriceCellProps) {
  if (price == null) {
    return <MissingDataBadge />;
  }
  return (
    <span className="tabular-nums text-primary">
      {formatCurrency(price)}
    </span>
  );
}
