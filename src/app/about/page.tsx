import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn how lmtrack.ai benchmarks AI model speed and publishes global latency records.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8 pt-4 lg:pt-6">
      <header className="flex items-center gap-3">
        <Image src="/brand/track.svg" alt="Track logo" width={36} height={36} />
        <div>
          <h1 className="text-3xl font-serif text-primary tracking-tight">About Track</h1>
          <p className="text-sm text-muted">lmtrack.ai</p>
        </div>
      </header>

      <section className="space-y-4 text-[15px] leading-relaxed text-primary">
        <p>
          Track is an independent benchmark platform focused on real model speed. We run
          repeatable short, medium, and long prompt tests, store median latency results,
          and publish global speed records by model.
        </p>
        <p>
          The goal is simple: help teams choose models with clear latency data, not guesswork.
          You can run manual speed tests in the Speed Test page and compare records in Records.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-line bg-table p-5">
          <h2 className="text-lg font-serif text-primary">How results are computed</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Three benchmark profiles: short, medium, long.</li>
            <li>Each model/test runs three attempts.</li>
            <li>Median latency is used as the stable score.</li>
            <li>Best median is stored as the public speed record.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-table p-5">
          <h2 className="text-lg font-serif text-primary">Data and privacy</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>Benchmarks require authenticated users.</li>
            <li>Rate limits are enforced to protect provider quotas.</li>
            <li>No raw IP addresses are stored.</li>
            <li>Only coarse country/region context is retained.</li>
          </ul>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-table p-5 text-sm text-muted">
        <p>
          Questions or feedback: use the Speed Test page and open an issue in the project
          repository. We continuously improve model routing, test profiles, and reporting.
        </p>
      </section>

      <div className="pb-8">
        <Link href="/leaderboard" className="text-sm text-accent hover:underline">
          ← Back to leaderboard
        </Link>
      </div>
    </div>
  );
}
