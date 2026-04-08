import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { documents } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

// GET /api/download/:id
// Proxies the Vercel Blob file back to the client with Content-Disposition: attachment
// so the browser triggers a native file download rather than opening in a new tab.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, id))
    .limit(1);

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  try {
    const upstream = await fetch(doc.blobUrl, {
      signal: AbortSignal.timeout(30_000), // 30s timeout
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: 502 });
    }

    // Sanitise filename for Content-Disposition header
    const rawName = doc.fileName ?? "document";
    const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
