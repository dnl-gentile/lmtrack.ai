import Badge from "@/components/shared/Badge";
import VendorLogo from "@/components/shared/VendorLogo";
import type { Model, Vendor } from "@/lib/types";

interface ModelHeaderProps {
  model: Model;
  vendor: Vendor;
}

function formatReleaseDate(releaseDate: string | null): string {
  if (!releaseDate) return "Unknown";
  const parsed = new Date(releaseDate);
  if (Number.isNaN(parsed.getTime())) return "Unknown";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ModelHeader({ model, vendor }: ModelHeaderProps) {
  return (
    <section className="w-full py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-4">
          <VendorLogo vendor={vendor.slug} size={48} />
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-normal text-primary">
              {model.canonicalName}
            </h1>
            <p className="text-sm text-muted">{model.family ?? "No family set"}</p>
          </div>
        </div>
        <p className="text-sm text-muted">
          <span className="text-primary">Release date:</span>{" "}
          {formatReleaseDate(model.releaseDate)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="info">{model.modality}</Badge>
        {model.isOpenSource ? (
          <Badge variant="success">Open Source</Badge>
        ) : (
          <Badge variant="neutral">Closed Source</Badge>
        )}
        <Badge variant={model.isActive ? "success" : "warning"}>
          {model.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>
    </section>
  );
}
