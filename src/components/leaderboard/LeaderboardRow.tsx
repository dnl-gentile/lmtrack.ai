import type { LeaderboardEntry } from "@/lib/types";
import VendorLogo from "@/components/shared/VendorLogo";
import RankBadge from "./RankBadge";
import ScoreCell from "./ScoreCell";
import PriceCell from "./PriceCell";
import ValueScoreBar from "./ValueScoreBar";
import MissingDataBadge from "@/components/shared/MissingDataBadge";
import Link from "next/link";

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  rank: number;
}

const DOMAIN_COLS: Array<{ key: "coding" | "math" | "creative_writing"; label: string }> = [
  { key: "coding", label: "Coding" },
  { key: "math", label: "Math" },
  { key: "creative_writing", label: "Creative" },
];

export default function LeaderboardRow({ entry, rank }: LeaderboardRowProps) {
  const { model, eloScore, eloCi, votes, blendedPrice1m, valueScore, domainScores } =
    entry;

  return (
    <tr className="border-b border-line/50 transition-colors hover:bg-chip/50">
      <td className="px-3 py-2.5">
        <RankBadge rank={rank} />
      </td>
      <td className="px-3 py-2.5">
        <Link
          href={`/model/${encodeURIComponent(model.slug)}`}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <VendorLogo vendor={model.vendorSlug} size={20} />
          <span className="font-medium">{model.canonicalName}</span>
        </Link>
      </td>
      <td className="px-3 py-2.5">
        <ScoreCell score={eloScore} ci={eloCi} />
      </td>
      <td className="px-3 py-2.5 text-muted tabular-nums">
        {votes != null ? votes.toLocaleString() : <MissingDataBadge />}
      </td>
      <td className="px-3 py-2.5">
        <PriceCell price={entry.blendedPrice1m} />
      </td>
      <td className="w-[120px] px-3 py-2.5">
        {valueScore != null ? (
          <ValueScoreBar score={valueScore} showLabel />
        ) : (
          <MissingDataBadge />
        )}
      </td>
      {DOMAIN_COLS.map(({ key }) => (
        <td key={key} className="px-3 py-2.5 text-muted tabular-nums text-xs">
          {domainScores[key] != null ? Math.round(domainScores[key]!) : <MissingDataBadge />}
        </td>
      ))}
    </tr>
  );
}
