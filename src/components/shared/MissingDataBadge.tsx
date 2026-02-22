interface MissingDataBadgeProps {
  label?: string;
}

export default function MissingDataBadge({
  label = "Missing",
}: MissingDataBadgeProps) {
  return (
    <span className="inline-flex items-center bg-chip text-muted/60 text-[10px] px-2 py-0.5 rounded-full">
      {label}
    </span>
  );
}
