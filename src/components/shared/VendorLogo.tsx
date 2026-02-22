import Image from "next/image";

interface VendorLogoProps {
  vendor: string;
  size?: number;
  showName?: boolean;
  className?: string;
}

export default function VendorLogo({
  vendor,
  size = 24,
  showName = false,
  className,
}: VendorLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      <Image
        src={`/vendor-logos/${vendor}.svg`}
        alt={`${vendor} logo`}
        width={size}
        height={size}
        className="shrink-0 object-contain"
      />
      {showName ? <span className="text-sm text-primary">{vendor}</span> : null}
    </div>
  );
}
