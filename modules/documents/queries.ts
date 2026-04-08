import { db } from "@/lib/db";
import { documents } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getDocumentsForRecord(recordId: string) {
  return db.select().from(documents).where(eq(documents.recordId, recordId));
}

export async function upsertDocument(data: {
  recordId: string;
  langType: "ENG" | "ORI";
  langCode?: string;
  langLabel?: string;
  blobUrl: string;
  fileName?: string;
  fileSize?: number;
}) {
  // Use INSERT ... ON CONFLICT to avoid race condition between DELETE + INSERT
  const [doc] = await db
    .insert(documents)
    .values({
      recordId: data.recordId,
      langType: data.langType,
      langCode: data.langCode ?? null,
      langLabel: data.langLabel ?? null,
      blobUrl: data.blobUrl,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
    })
    .onConflictDoUpdate({
      target: [documents.recordId, documents.langType],
      set: {
        langCode: data.langCode ?? null,
        langLabel: data.langLabel ?? null,
        blobUrl: data.blobUrl,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        uploadedAt: new Date(),
      },
    })
    .returning();

  return doc;
}

export async function deleteDocument(id: string) {
  const [doc] = await db
    .delete(documents)
    .where(eq(documents.id, id))
    .returning();
  return doc;
}
