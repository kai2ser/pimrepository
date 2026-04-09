import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/db";
import { documents } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { deleteDocument } from "@/modules/documents/queries";

// DELETE /api/documents/:id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Look up document first to get the blob URL
    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, id))
      .limit(1);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete blob first, then DB record — avoids orphaned blobs
    try {
      await del(doc.blobUrl);
    } catch {
      console.warn("Blob deletion failed (may already be deleted):", doc.blobUrl);
    }

    await deleteDocument(id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/documents/:id]", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
