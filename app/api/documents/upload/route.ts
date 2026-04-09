import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAuth } from "@/lib/auth";

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
  const authResult = await requireAuth();
  if (!authResult.authorized) return authResult.response;

  // Verify blob token is available
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("[POST /api/documents/upload] BLOB_READ_WRITE_TOKEN is not set");
    return NextResponse.json(
      { error: "Server misconfiguration: blob storage token not available" },
      { status: 500 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate metadata sent from the client
        let payload: Record<string, unknown> = {};
        if (clientPayload) {
          try {
            payload = JSON.parse(clientPayload);
          } catch {
            throw new Error("Invalid client payload JSON");
          }
        }
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
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/documents/upload]", message, err);
    // Return 200 with error details so the blob client can surface the actual message
    // (the client throws a generic "Failed to retrieve token" on any non-200)
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
