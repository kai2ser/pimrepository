// ── Policy Guidance Tiers ─────────────────────────────────────────────────────
// Classification by legal/regulatory level of the document.

export const TIERS = [
  { value: 1, label: "Tier 1 — Primary Legislation" },
  { value: 2, label: "Tier 2 — Secondary Regulations" },
  { value: 3, label: "Tier 3 — Procedural Guidelines and Methodological Guidance" },
  { value: 4, label: "Tier 4 — Strategies for Project Prioritization & Alignment" },
] as const;

export type TierValue = (typeof TIERS)[number]["value"];

export function getTierLabel(tier: number | null | undefined): string | null {
  if (tier == null) return null;
  return TIERS.find((t) => t.value === tier)?.label ?? `Tier ${tier}`;
}

export function getTierShortLabel(tier: number): string {
  return `T${tier}`;
}

// ── Strategy Classification ───────────────────────────────────────────────────
// Classification by scope and time horizon of the strategy document.

export const STRATEGY_TYPES = [
  { value: 1, label: "National (Longer Term, 5 Years+)", short: "NAT" },
  { value: 2, label: "Medium Term (3-5 Years)",          short: "MED" },
  { value: 3, label: "Sectoral",                         short: "SEC" },
  { value: 4, label: "Cross-Cutting (Climate)",          short: "CC-CL" },
  { value: 5, label: "Cross-Cutting (Other)",            short: "CC-OT" },
  { value: 6, label: "Sub-National Strategy",            short: "SUB" },
] as const;

export type StrategyTypeValue = (typeof STRATEGY_TYPES)[number]["value"];

export function getStrategyLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  return STRATEGY_TYPES.find((s) => s.value === value)?.label ?? `Strategy ${value}`;
}

export function getStrategyShortLabel(value: number | null | undefined): string | null {
  if (value == null) return null;
  return STRATEGY_TYPES.find((s) => s.value === value)?.short ?? `S${value}`;
}
