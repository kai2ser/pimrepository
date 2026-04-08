import { NextRequest, NextResponse } from "next/server";
import { exportAllRecordsWithDocs } from "@/modules/records/queries";
import { rateLimit } from "@/lib/rate-limit";

// Allowed origins for cross-origin RAG pipeline access
const ALLOWED_ORIGINS = [
  "https://pim-a-icoach.vercel.app",
  "https://pim-ai-global.vercel.app",
];

function corsHeaders(origin: string | null) {
  const allowedOrigin =
    origin && ALLOWED_ORIGINS.some((o) => origin.startsWith(o))
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// OPTIONS preflight
export function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

// GET /api/export/documents
// Returns all policy records with their document blob URLs in a single call.
// Designed for downstream RAG pipelines (e.g. pim-a-icoach) to efficiently
// fetch the full corpus for embedding / vectorization.
export async function GET(req: NextRequest) {
  // Rate limit: 10 requests per 60s per IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(ip, { limit: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          ...corsHeaders(req.headers.get("origin")),
        },
      }
    );
  }

  try {
    const { searchParams } = req.nextUrl;
    const since = searchParams.get("since");
    const lang = searchParams.get("lang")?.toUpperCase(); // ENG or ORI

    let data = await exportAllRecordsWithDocs();

    // Optional: filter to records updated after a given ISO timestamp.
    // Allows incremental sync — only re-embed what changed.
    if (since) {
      const sinceDate = new Date(since);
      if (!isNaN(sinceDate.getTime())) {
        data = data.filter((r) => new Date(r.updatedAt) > sinceDate);
      }
    }

    // Optional: filter documents to a specific language slot.
    //   ?lang=ENG  → only English documents (for English RAG)
    //   ?lang=ORI  → only original-language documents (for native RAG)
    // Records with no matching documents are excluded from the response.
    if (lang === "ENG" || lang === "ORI") {
      data = data
        .map((r) => ({
          ...r,
          documents: r.documents.filter((d) => d.langType === lang),
        }))
        .filter((r) => r.documents.length > 0);
    }

    return NextResponse.json(
      {
        count: data.length,
        exportedAt: new Date().toISOString(),
        lang: lang ?? "ALL",
        records: data,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          ...corsHeaders(req.headers.get("origin")),
        },
      }
    );
  } catch (err) {
    console.error("[GET /api/export/documents]", err);
    return NextResponse.json(
      { error: "Failed to export documents" },
      {
        status: 500,
        headers: corsHeaders(req.headers.get("origin")),
      }
    );
  }
}
