import { db } from "@/lib/db";
import { policyRecords, documents, countries } from "@/drizzle/schema";
import { eq, ilike, or, and, SQL, asc, sql, inArray } from "drizzle-orm";
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
    conditions.push(eq(policyRecords.country, filters.country));
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
  // Run both queries in parallel — the documents query is cheap even if the
  // record turns out not to exist (it just returns []).
  const [records, docs] = await Promise.all([
    db.select().from(policyRecords).where(eq(policyRecords.id, id)).limit(1),
    db.select().from(documents).where(eq(documents.recordId, id)),
  ]);

  if (records.length === 0) return null;

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

// ── Countries in use (distinct from records, joined with lookup names) ───
export async function listCountries(): Promise<{ iso3: string; name: string }[]> {
  const rows = await db
    .selectDistinct({
      iso3: policyRecords.country,
      name: sql<string>`COALESCE(${countries.name}, ${policyRecords.country})`,
    })
    .from(policyRecords)
    .leftJoin(countries, eq(countries.iso3, policyRecords.country))
    .orderBy(sql`COALESCE(${countries.name}, ${policyRecords.country})`);
  return rows;
}

// ── All countries from the lookup table (for form combobox) ───────────────
export async function listAllCountries(): Promise<{ iso3: string; name: string }[]> {
  const rows = await db
    .select({ iso3: countries.iso3, name: countries.name })
    .from(countries)
    .orderBy(asc(countries.name));
  return rows;
}

// ── Records with documents for a given country ────────────────────────────
export async function getRecordsWithDocsByCountry(iso3: string) {
  const records = await db
    .select()
    .from(policyRecords)
    .where(eq(policyRecords.country, iso3))
    .orderBy(asc(policyRecords.nameEng));

  if (records.length === 0) return [];

  const ids = records.map((r) => r.id);
  const docs = await db
    .select()
    .from(documents)
    .where(inArray(documents.recordId, ids));

  // Group docs by recordId
  const docMap = new Map<string, typeof docs>();
  for (const doc of docs) {
    if (!docMap.has(doc.recordId)) docMap.set(doc.recordId, []);
    docMap.get(doc.recordId)!.push(doc);
  }

  return records
    .map((r) => ({ record: r, docs: docMap.get(r.id) ?? [] }))
    .filter((r) => r.docs.length > 0);
}

// ── Policy record counts grouped by country ISO3 ──────────────────────────
export async function listPolicyCounts(): Promise<{ iso3: string; count: number }[]> {
  const rows = await db
    .select({
      iso3: policyRecords.country,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(policyRecords)
    .groupBy(policyRecords.country);
  return rows;
}
