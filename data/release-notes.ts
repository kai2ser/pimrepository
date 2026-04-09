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
    version: "V0.0.3",
    date: "2026-04-09",
    title: "Open Access & Document Language Tracking",
    description:
      "Removed authentication requirements to make the platform fully open access. " +
      "Improved document language tracking so the Country Overview dashboard accurately " +
      "distinguishes between English and non-English document uploads.",
    changes: [
      {
        type: "feature",
        text: "Platform is now fully open access — all users can create, edit, delete records and upload documents without signing in",
      },
      {
        type: "feature",
        text: "Country Overview dashboard now shows separate English Docs and Non-English Docs columns based on actual uploaded document language",
      },
      {
        type: "feature",
        text: "Stats strip on homepage updated with English Docs and Non-English Docs totals",
      },
      {
        type: "fix",
        text: "Non-English document counts now use actual language code instead of document slot type, fixing incorrect counts for English-only countries like Ireland",
      },
      {
        type: "improvement",
        text: "Removed Sign In button and session provider from navigation header",
      },
    ],
  },
  {
    version: "V0.0.2",
    date: "2026-04-09",
    title: "Performance, Stability & RAG Pipeline",
    description:
      "Major infrastructure improvements covering database performance, API stability, " +
      "and a new export endpoint designed for downstream RAG pipelines such as PIM AI Coach.",
    changes: [
      {
        type: "feature",
        text: "New export endpoint (GET /api/export/documents) for RAG pipeline integration with language filtering (?lang=ENG) and incremental sync (?since=timestamp)",
      },
      {
        type: "feature",
        text: "CORS support for cross-origin access from pim-a-icoach.vercel.app and pim-ai-global.vercel.app",
      },
      {
        type: "feature",
        text: "API pagination with limit/offset support on record listing (default 500, max 500)",
      },
      {
        type: "feature",
        text: "Global error boundary with retry button for graceful error recovery",
      },
      {
        type: "improvement",
        text: "Added database indexes on policy tiers, countries, auth tables, and audit logs for faster queries",
      },
      {
        type: "improvement",
        text: "Added foreign key constraint from policy records to countries table to enforce data integrity",
      },
      {
        type: "improvement",
        text: "Switched record detail and edit pages from force-dynamic to ISR (60s revalidation) for better caching",
      },
      {
        type: "improvement",
        text: "Added Cache-Control headers to single record API endpoint",
      },
      {
        type: "improvement",
        text: "Zod validation schema now enforces max string lengths to reject oversized payloads",
      },
      {
        type: "improvement",
        text: "Rate limiting on export endpoint (10 requests per minute per IP)",
      },
      {
        type: "fix",
        text: "Fixed document upsert race condition by replacing DELETE+INSERT with INSERT ON CONFLICT DO UPDATE",
      },
      {
        type: "fix",
        text: "Added 30-second timeout on blob storage fetch to prevent hanging downloads",
      },
      {
        type: "fix",
        text: "Fixed blob deletion order — now deletes blob before database record to prevent orphaned files",
      },
      {
        type: "fix",
        text: "Added try-catch to JSON.parse in upload route to prevent crashes from malformed client payloads",
      },
      {
        type: "fix",
        text: "Fixed SSR hydration issue with window.history access in record form cancel button",
      },
      {
        type: "fix",
        text: "CountryCombobox now shows error state instead of infinite spinner on network failure",
      },
      {
        type: "fix",
        text: "Strengthened blob URL hostname validation with exact subdomain structure check",
      },
      {
        type: "fix",
        text: "Fixed parseInt NaN handling in query parameter parsing for tier filters",
      },
    ],
  },
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
