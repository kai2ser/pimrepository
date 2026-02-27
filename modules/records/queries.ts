import { db } from "@/lib/db";
import { policyRecords, documents } from "@/drizzle/schema";
import { eq, ilike, or, and, isNotNull, SQL, asc } from "drizzle-orm";
import type { PolicyRecordInput, PolicyRecordUpdateInput } from "./schema";
import type { PolicyRecordWithDocs } from "@/drizzle/schema";

export interface RecordFilters {
  search?: string;
  country?: string;
  policyGuidanceTier?: number;
  strategyTier?: number;
}

// ── List all records (with optional filters) ──────────────────────────────
export async function listRecords(filters: RecordFilters = {}) {
  const conditions: SQL[] = [];

  if (filters.search) {
    conditions.push(
      or(
        ilike(policyRecords.nameEng, `%${filters.search}%`),
        ilike(policyRecords.country, `%${filters.search}%`),
        ilike(policyRecords.overview, `%${filters.search}%`)
      )!
    );
  }

  if (filters.country) {
    conditions.push(ilike(policyRecords.country, filters.country));
  }

  if (filters.policyGuidanceTier !== undefined) {
    conditions.push(eq(policyRecords.policyGuidanceTier, filters.policyGuidanceTier));
  }

  if (filters.strategyTier !== undefined) {
    conditions.push(eq(policyRecords.strategyTier, filters.strategyTier));
  }

  const rows = await db
    .select()
    .from(policyRecords)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(policyRecords.country), asc(policyRecords.nameEng));

  return rows;
}

// ── Get single record with its documents ─────────────────────────────────
export async function getRecordWithDocs(id: string): Promise<PolicyRecordWithDocs | null> {
  const records = await db
    .select()
    .from(policyRecords)
    .where(eq(policyRecords.id, id))
    .limit(1);

  if (records.length === 0) return null;

  const docs = await db
    .select()
    .from(documents)
    .where(eq(documents.recordId, id));

  return { ...records[0], documents: docs };
}

// ── Create ────────────────────────────────────────────────────────────────
export async function createRecord(input: PolicyRecordInput) {
  const [record] = await db
    .insert(policyRecords)
    .values({
      ...input,
      year: input.year ?? null,
      yearRevised: input.yearRevised ?? null,
      policyGuidanceTier: input.policyGuidanceTier ?? null,
      strategyTier: input.strategyTier ?? null,
      pages: input.pages ?? null,
      tokens: input.tokens ?? null,
    })
    .returning();
  return record;
}

// ── Update ────────────────────────────────────────────────────────────────
export async function updateRecord(id: string, input: PolicyRecordUpdateInput) {
  const [record] = await db
    .update(policyRecords)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(policyRecords.id, id))
    .returning();
  return record;
}

// ── Delete ────────────────────────────────────────────────────────────────
export async function deleteRecord(id: string) {
  await db.delete(policyRecords).where(eq(policyRecords.id, id));
}

// ── Distinct countries ────────────────────────────────────────────────────
export async function listCountries(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ country: policyRecords.country })
    .from(policyRecords)
    .orderBy(asc(policyRecords.country));
  return rows.map((r) => r.country);
}
