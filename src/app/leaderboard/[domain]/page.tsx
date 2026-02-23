import type { Metadata } from "next";
import LeaderboardClient from "../LeaderboardClient";
import { DOMAIN_MAP } from "@/lib/constants";
import type { DomainKey } from "@/lib/constants";

interface PageProps {
  params: Promise<{ domain: string }>;
}

const TAB_TITLE_MAP: Record<DomainKey, string> = {
  overall: "LLM Leaderboard - Best Value",
  text: "LLM Leaderboard - Best Text",
  code: "Code AI Leaderboard - Best Value",
  "text-to-image": "Text-to-Image Leaderboard - Best Value",
  "image-edit": "Image Edit AI Leaderboard - Best Value",
  "text-to-video": "Text-to-Video Leaderboard - Best Value",
  "image-to-video": "Image-to-Video Leaderboard - Best Value",
  vision: "Vision AI Leaderboard - Best Value",
  search: "Search AI Leaderboard - Best Value",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain: domainParam } = await params;
  const domain: DomainKey =
    domainParam in DOMAIN_MAP ? (domainParam as DomainKey) : "overall";
  return {
    title: {
      absolute: `${TAB_TITLE_MAP[domain]} | Track`,
    },
  };
}

export default async function LeaderboardDomainPage({ params }: PageProps) {
  const { domain: domainParam } = await params;
  const domain: DomainKey =
    domainParam in DOMAIN_MAP ? (domainParam as DomainKey) : "overall";
  return <LeaderboardClient domain={domain} />;
}
