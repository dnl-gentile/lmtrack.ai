"use client";

interface SortHeaderProps {
  label: string;
  field: string;
  currentSort: string;
  currentDir: "asc" | "desc";
  onSort: (field: string) => void;
}

export default function SortHeader({
  label,
  field,
  currentSort,
  currentDir,
  onSort,
}: SortHeaderProps) {
  const isActive = currentSort === field;
  const dir = isActive ? currentDir : null;

  return (
    <th
      scope="col"
      className="cursor-pointer select-none whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium text-muted hover:text-primary"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
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
