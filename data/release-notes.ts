// ─────────────────────────────────────────────────────────────────────────────
// Release Notes
// To add a new release: prepend a new entry to the top of the RELEASES array.
// date format: "YYYY-MM-DD"
// ─────────────────────────────────────────────────────────────────────────────

export interface ReleaseNote {
  version: string;
  date: string;
  title: string;
  description: string;
  changes: {
    type: "feature" | "fix" | "improvement" | "breaking";
    text: string;
  }[];
}

export const RELEASES: ReleaseNote[] = [
  {
    version: "V0.0.1",
    date: "2026-02-28",
    title: "Initial Release",
    description:
      "First public release of the PIM Country Policy Profile Repository. " +
      "Establishes the core platform for managing and referencing Public Investment " +
      "Management policy and strategy documents across countries.",
    changes: [
      {
        type: "feature",
        text: "Repository browse page with search, country filter, and tier filter",
      },
      {
        type: "feature",
        text: "Policy record management: create, view, edit, and delete records",
      },
      {
        type: "feature",
        text: "Per-record document attachments: one English file and one native-language file (PDF, Word, or Text)",
      },
      {
        type: "feature",
        text: "Tier classification system: Policy Guidance Tier and Strategy Tier (1–5)",
      },
      {
        type: "feature",
        text: "Metadata fields: country, source, year, year revised, overview, pages, tokens, external link",
      },
      {
        type: "feature",
        text: "10 seed records across 8 countries covering foundational PIM legislation and strategies",
      },
      {
        type: "feature",
        text: "Deployed on Vercel with Neon serverless Postgres and Vercel Blob storage",
      },
    ],
  },
];
