import { db } from "@/lib/db";
import { documents } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

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
  // Delete existing doc of this lang type for this record (replace strategy)
  await db
    .delete(documents)
    .where(
      and(
        eq(documents.recordId, data.recordId),
        eq(documents.langType, data.langType)
      )
    );

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
