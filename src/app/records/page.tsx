import Link from "next/link";
import SpeedRecordsTable from "@/components/pricing/SpeedRecordsTable";

export default function RecordsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 pt-4 lg:pt-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-serif font-normal text-primary tracking-tight">Records</h1>
        <p className="text-sm text-muted">
          Global best model latency records from completed benchmark runs.
        </p>
        <Link
          href="/speed-test"
          className="inline-flex rounded-md border border-line bg-chip px-3 py-1.5 text-sm text-primary transition-colors hover:bg-hover"
        >
          Run a new speed test
        </Link>
      </header>

      <SpeedRecordsTable />
    </div>
  );
}
