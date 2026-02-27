import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ─── Policy Records ────────────────────────────────────────────────────────
export const policyRecords = pgTable("policy_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  country: varchar("country", { length: 100 }).notNull(),
  nameEng: text("name_eng").notNull(),
  nameOrig: text("name_orig"),
  year: smallint("year"),
  source: text("source"),
  yearRevised: smallint("year_revised"),
  overview: text("overview"),
  policyGuidanceTier: smallint("policy_guidance_tier"),
  strategyTier: smallint("strategy_tier"),
  comment: text("comment"),
  link: text("link"),
  pages: smallint("pages"),
  tokens: integer("tokens"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Documents ─────────────────────────────────────────────────────────────
// langType: 'ENG' | 'ORI'
// UNIQUE(record_id, lang_type) enforces max 1 English + 1 native per record
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    recordId: uuid("record_id")
      .notNull()
      .references(() => policyRecords.id, { onDelete: "cascade" }),
    langType: varchar("lang_type", { length: 5 }).notNull(), // 'ENG' | 'ORI'
    langCode: varchar("lang_code", { length: 10 }), // ISO 639 e.g. 'lt', 'fr', 'ar'
    langLabel: varchar("lang_label", { length: 100 }), // e.g. 'Lithuanian'
    blobUrl: text("blob_url").notNull(),
    fileName: text("file_name"),
    fileSize: integer("file_size"),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  },
  (t) => [unique("unique_record_lang").on(t.recordId, t.langType)]
);

// ─── TypeScript Types ──────────────────────────────────────────────────────
export type PolicyRecord = typeof policyRecords.$inferSelect;
export type NewPolicyRecord = typeof policyRecords.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;

// Full record with documents joined
export type PolicyRecordWithDocs = PolicyRecord & {
  documents: Document[];
};
