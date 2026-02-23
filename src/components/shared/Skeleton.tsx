interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  rows?: number;
}

function SkeletonBlock({ width, height, className }: Omit<SkeletonProps, "rows">) {
  return (
    <div
      className={`animate-pulse bg-line/40 rounded-lg ${className ?? ""}`.trim()}
      style={{ width: width ?? "100%", height: height ?? "1rem" }}
    />
  );
}

export default function Skeleton({
  width,
  height,
  className,
  rows = 1,
}: SkeletonProps) {
  if (rows > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonBlock
            key={index}
            width={width}
            height={height}
            className={className}
          />
        ))}
      </div>
    );
  }

  return <SkeletonBlock width={width} height={height} className={className} />;
}
