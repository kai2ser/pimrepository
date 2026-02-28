export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { upsertDocument } from "@/modules/documents/queries";

// Accepted file types for document attachments
const ACCEPTED_TYPES: Record<string, string> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
};

// POST /api/documents/upload
// multipart form: file, recordId, langType, langCode?, langLabel?
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const file = form.get("file") as File | null;
    const recordId = form.get("recordId") as string | null;
    const langType = form.get("langType") as "ENG" | "ORI" | null;
    const langCode = form.get("langCode") as string | null;
    const langLabel = form.get("langLabel") as string | null;

    if (!file || !recordId || !langType) {
      return NextResponse.json(
        { error: "file, recordId, and langType are required" },
        { status: 400 }
      );
    }

    if (!["ENG", "ORI"].includes(langType)) {
      return NextResponse.json(
        { error: "langType must be ENG or ORI" },
        { status: 400 }
      );
    }

    if (!ACCEPTED_TYPES[file.type]) {
      return NextResponse.json(
        { error: "Only PDF, Word (.doc/.docx), and Text (.txt) files are accepted" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(
      `records/${recordId}/${langType}_${file.name}`,
      file,
      {
        access: "public",
        contentType: file.type,
      }
    );

    // Save reference in DB (upsert: replaces any existing doc of same lang)
    const doc = await upsertDocument({
      recordId,
      langType,
      langCode: langCode ?? undefined,
      langLabel: langLabel ?? undefined,
      blobUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("[POST /api/documents/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
