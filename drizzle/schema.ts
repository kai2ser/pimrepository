import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  numeric,
  timestamp,
  unique,
  char,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ─── Policy Records ────────────────────────────────────────────────────────
export const policyRecords = pgTable(
  "policy_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    country: varchar("country", { length: 100 })
      .notNull()
      .references(() => countries.iso3),
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
  },
  (t) => [
    index("idx_policy_records_country").on(t.country),
    index("idx_policy_records_country_name").on(t.country, t.nameEng),
    index("idx_policy_records_policy_tier").on(t.policyGuidanceTier),
    index("idx_policy_records_strategy_tier").on(t.strategyTier),
  ]
);

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
  (t) => [
    unique("unique_record_lang").on(t.recordId, t.langType),
    index("idx_documents_record_id").on(t.recordId),
  ]
);

// ─── Countries Lookup ──────────────────────────────────────────────────────
// ISO Alpha-3 keyed lookup table for all sovereign states & territories.
// gdpBn / pubInvPctGdp / pubInvBn are 2024 estimates (IMF WEO Oct 2024).
export const countries = pgTable(
  "countries",
  {
    iso3:          char("iso3", { length: 3 }).primaryKey(),
    name:          text("name").notNull(),
    gdpBn:         numeric("gdp_2024_bn",     { precision: 12, scale: 3 }),
    pubInvPctGdp:  numeric("pub_inv_pct_gdp", { precision: 6,  scale: 4 }),
    pubInvBn:      numeric("pub_inv_2024_bn", { precision: 12, scale: 3 }),
  },
  (t) => [
    index("idx_countries_name").on(t.name),
  ]
);

// ─── Auth.js v5 Tables ────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"), // for Credentials provider
});

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("idx_accounts_user_id").on(t.userId),
  ]
);

export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [
    index("idx_sessions_user_id").on(t.userId),
  ]
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// ─── Audit Log ────────────────────────────────────────────────────────────
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"),
    userEmail: text("user_email"),
    action: varchar("action", { length: 20 }).notNull(), // create | update | delete
    entity: varchar("entity", { length: 20 }).notNull(), // record | document
    entityId: uuid("entity_id"),
    detail: text("detail"),
    ip: varchar("ip", { length: 45 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_audit_logs_created").on(t.createdAt),
    index("idx_audit_logs_user_id").on(t.userId),
    index("idx_audit_logs_entity_id").on(t.entityId),
  ]
);

// ─── TypeScript Types ──────────────────────────────────────────────────────
export type PolicyRecord = typeof policyRecords.$inferSelect;
export type NewPolicyRecord = typeof policyRecords.$inferInsert;
export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type Country = typeof countries.$inferSelect;
export type NewCountry = typeof countries.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;

// Full record with documents joined
export type PolicyRecordWithDocs = PolicyRecord & {
  documents: Document[];
};
