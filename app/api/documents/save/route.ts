export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { upsertDocument } from "@/modules/documents/queries";

// POST /api/documents/save
// Called by the client immediately after @vercel/blob/client upload() resolves.
// Body: { blobUrl, recordId, langType, langCode?, langLabel?, fileName, fileSize }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { blobUrl, recordId, langType, langCode, langLabel, fileName, fileSize } = body;

    if (!blobUrl || !recordId || !langType) {
      return NextResponse.json(
        { error: "blobUrl, recordId, and langType are required" },
        { status: 400 }
      );
    }

    if (!["ENG", "ORI"].includes(langType)) {
      return NextResponse.json(
        { error: "langType must be ENG or ORI" },
        { status: 400 }
      );
    }

    const doc = await upsertDocument({
      recordId,
      langType,
      langCode: langCode ?? undefined,
      langLabel: langLabel ?? undefined,
      blobUrl,
      fileName: fileName ?? undefined,
      fileSize: fileSize ?? undefined,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documents/save]", err);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
