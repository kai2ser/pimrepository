import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deleteDocument } from "@/modules/documents/queries";
import { requireAuth } from "@/lib/auth";
import { audit } from "@/lib/audit";

// DELETE /api/documents/:id (auth required)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    const { id } = await params;

    // Delete from DB and get the blob URL
    const doc = await deleteDocument(id);

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Delete from Vercel Blob storage
    try {
      await del(doc.blobUrl);
    } catch {
      console.warn("Blob deletion failed (may already be deleted):", doc.blobUrl);
    }

    audit({
      session: authResult.session,
      action: "delete",
      entity: "document",
      entityId: id,
      detail: `Deleted document: ${doc.fileName ?? id}`,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/documents/:id]", err);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
