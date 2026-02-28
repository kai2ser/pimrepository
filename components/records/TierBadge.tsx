"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getTierLabel, getTierShortLabel } from "@/lib/tiers";

interface TierBadgeProps {
  tier: number | null | undefined;
  type: "policy" | "strategy";
}

const POLICY_COLORS: Record<number, string> = {
  1: "bg-blue-100 text-blue-800 border-blue-200",
  2: "bg-indigo-100 text-indigo-800 border-indigo-200",
  3: "bg-violet-100 text-violet-800 border-violet-200",
  4: "bg-purple-100 text-purple-800 border-purple-200",
};

const STRATEGY_COLORS: Record<number, string> = {
  1: "bg-emerald-100 text-emerald-800 border-emerald-200",
  2: "bg-teal-100 text-teal-800 border-teal-200",
  3: "bg-cyan-100 text-cyan-800 border-cyan-200",
  4: "bg-sky-100 text-sky-800 border-sky-200",
};

export function TierBadge({ tier, type }: TierBadgeProps) {
  if (tier == null) return null;

  const colors = type === "policy" ? POLICY_COLORS : STRATEGY_COLORS;
  const prefix = type === "policy" ? "PG" : "S";
  const shortLabel = `${prefix}-${getTierShortLabel(tier)}`;
  const fullLabel = getTierLabel(tier) ?? `Tier ${tier}`;

  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-semibold cursor-default", colors[tier] ?? "bg-gray-100 text-gray-800")}
      title={fullLabel}
    >
      {shortLabel}
    </Badge>
  );
}
