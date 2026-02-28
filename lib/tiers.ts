// ── Tier definitions ──────────────────────────────────────────────────────────
// Single source of truth for tier numbers and labels used across the app.

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

// Short badge labels  e.g. "T1", "T2"
export function getTierShortLabel(tier: number): string {
  return `T${tier}`;
}
