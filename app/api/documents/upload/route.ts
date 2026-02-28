export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

// Accepted MIME types for document attachments
const ACCEPTED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

// POST /api/documents/upload
// Called twice by @vercel/blob/client:
//   1. { type: "blob.generate-client-token" }  → returns a short-lived upload token
//   2. { type: "blob.upload-completed" }        → fires after the file lands in Blob storage
//      (we do NOT save to DB here; the client calls /api/documents/save instead)
export async function POST(request: NextRequest) {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate metadata sent from the client
        const payload = clientPayload ? JSON.parse(clientPayload) : {};
        const { langType } = payload as { langType?: string };

        if (!langType || !["ENG", "ORI"].includes(langType)) {
          throw new Error("langType must be ENG or ORI");
        }

        return {
          allowedContentTypes: ACCEPTED_TYPES,
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
          // Pass the client payload through so onUploadCompleted receives it
          tokenPayload: clientPayload ?? "",
        };
      },
      // onUploadCompleted is called by Vercel's infrastructure after the blob
      // is stored. We keep it as a no-op here; the client calls /api/documents/save
      // directly after upload() resolves, giving us synchronous DB feedback.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("[POST /api/documents/upload]", err);
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
