/**
 * Seed a credential-based user into the database.
 *
 * Usage:
 *   npx tsx scripts/create-user.ts <email> <password> [name]
 *
 * Example:
 *   npx tsx scripts/create-user.ts admin@example.com s3cret "Admin User"
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
  const [, , email, password, name] = process.argv;

  if (!email || !password) {
    console.error("Usage: npx tsx scripts/create-user.ts <email> <password> [name]");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name ?? null})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}, name = COALESCE(${name ?? null}, users.name)
  `;

  console.log(`✓ User created/updated: ${email}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
