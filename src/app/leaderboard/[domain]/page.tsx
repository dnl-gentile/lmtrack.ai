import LeaderboardClient from "../LeaderboardClient";
import { DOMAIN_MAP } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface PageProps {
  params: Promise<{ domain: string }>;
}

export default async function LeaderboardDomainPage({ params }: PageProps) {
  const { domain: domainParam } = await params;
  const domain: DomainKey =
    domainParam in DOMAIN_MAP ? (domainParam as DomainKey) : "overall";
  return <LeaderboardClient domain={domain} />;
}
