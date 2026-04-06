/**
 * Validates required environment variables at import time.
 * Import this module early (e.g., from lib/db.ts or auth.ts)
 * to fail fast with a clear error message.
 */

const required = ["DATABASE_URL"] as const;

// These are only required in production or when auth features are used
const authVars = ["AUTH_SECRET"] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Warn about auth vars (don't crash — allows build without them)
if (process.env.NODE_ENV === "production") {
  for (const key of authVars) {
    if (!process.env[key]) {
      console.warn(`⚠ Missing environment variable: ${key} — auth may not work`);
    }
  }
}

export {};
