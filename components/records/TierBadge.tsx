"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTierLabel, getTierShortLabel, getStrategyLabel, getStrategyShortLabel } from "@/lib/tiers";

interface TierBadgeProps {
  tier: number | null | undefined;
  type: "policy" | "strategy";
}

// Policy Guidance Tier colours (blue family)
const POLICY_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-800 border-blue-200",
  2: "bg-indigo-100 text-indigo-800 border-indigo-200",
  3: "bg-violet-100 text-violet-800 border-violet-200",
  4: "bg-purple-100 text-purple-800 border-purple-200",
};

// Strategy Classification colours (green/teal family)
const STRATEGY_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-800 border-emerald-200",
  2: "bg-teal-100 text-teal-800 border-teal-200",
  3: "bg-cyan-100 text-cyan-800 border-cyan-200",
  4: "bg-sky-100 text-sky-800 border-sky-200",
  5: "bg-lime-100 text-lime-800 border-lime-200",
  6: "bg-green-100 text-green-800 border-green-200",
};

export function TierBadge({ tier, type }: TierBadgeProps) {
  if (tier == null) return null;

  if (type === "policy") {
    const shortLabel = `PG-${getTierShortLabel(tier)}`;
    const fullLabel = getTierLabel(tier) ?? `Policy Guidance Tier ${tier}`;
    return (
      <Badge
        variant="outline"
        className={cn("text-xs font-semibold cursor-default", POLICY_COLORS[tier] ?? "bg-gray-100 text-gray-800")}
        title={fullLabel}
      >
        {shortLabel}
      </Badge>
    );
  }

  // Strategy type badge
  const shortLabel = getStrategyShortLabel(tier) ?? `S${tier}`;
  const fullLabel = getStrategyLabel(tier) ?? `Strategy ${tier}`;
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold cursor-default", STRATEGY_COLORS[tier] ?? "bg-gray-100 text-gray-800")}
      title={fullLabel}
    >
      {shortLabel}
    </Badge>
  );
}
