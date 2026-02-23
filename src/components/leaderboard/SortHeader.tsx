"use client";

interface SortHeaderProps {
  label: string;
  field: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  onSort: (field: string) => void;
  align?: "left" | "center" | "right";
}

export default function SortHeader({
  label,
  field,
  currentSort,
  currentDir,
  onSort,
  align = "left",
}: SortHeaderProps) {
  const isActive = currentSort === field;
  const dir = isActive ? currentDir : null;
  const headerAlignClass =
    align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const contentAlignClass =
    align === "center"
      ? "justify-center w-full"
      : align === "right"
      ? "justify-end w-full"
      : "";

  return (
    <th
      scope="col"
      className={`cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-xs font-medium text-muted hover:text-primary ${headerAlignClass}`}
      onClick={() => onSort(field)}
    >
      <span className={`inline-flex items-center gap-1 ${contentAlignClass}`}>
        {label}
        {dir === "asc" ? (
          <span className="text-primary" aria-hidden>
            ↑
          </span>
        ) : dir === "desc" ? (
          <span className="text-primary" aria-hidden>
            ↓
          </span>
        ) : null}
      </span>
    </th>
  );
}
