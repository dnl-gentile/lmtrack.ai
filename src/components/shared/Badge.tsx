import type { ReactNode } from "react";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant: BadgeVariant;
  children: ReactNode;
  size?: BadgeSize;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: "bg-good text-emerald-700",
  warning: "bg-mid text-amber-700",
  error: "bg-bad text-red-700",
  info: "bg-blue-500/10 text-blue-600",
  neutral: "bg-chip text-muted",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export default function Badge({ variant, children, size = "md" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
