import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  console.log("Creating auth tables...");

  await sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "name" text,
      "email" text UNIQUE,
      "email_verified" timestamp,
      "image" text,
      "password_hash" text
    )
  `;
  console.log("✓ users");

  await sql`
    CREATE TABLE IF NOT EXISTS "accounts" (
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" text NOT NULL,
      "provider" text NOT NULL,
      "provider_account_id" text NOT NULL,
      "refresh_token" text,
      "access_token" text,
      "expires_at" integer,
      "token_type" text,
      "scope" text,
      "id_token" text,
      "session_state" text,
      PRIMARY KEY ("provider", "provider_account_id")
    )
  `;
  console.log("✓ accounts");

  await sql`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "session_token" text PRIMARY KEY,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "expires" timestamp NOT NULL
    )
  `;
  console.log("✓ sessions");

  await sql`
    CREATE TABLE IF NOT EXISTS "verification_tokens" (
      "identifier" text NOT NULL,
      "token" text NOT NULL,
      "expires" timestamp NOT NULL,
      PRIMARY KEY ("identifier", "token")
    )
  `;
  console.log("✓ verification_tokens");

  await sql`CREATE INDEX IF NOT EXISTS "idx_policy_records_country" ON "policy_records" ("country")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_policy_records_country_name" ON "policy_records" ("country", "name_eng")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_documents_record_id" ON "documents" ("record_id")`;
  console.log("✓ indexes");

  console.log("Done!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
