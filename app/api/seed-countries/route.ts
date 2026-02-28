export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { countries } from "@/drizzle/schema";
import { COUNTRIES_DATA } from "@/lib/countries-data";
import { sql } from "drizzle-orm";

// POST /api/seed-countries
// Idempotent — uses INSERT … ON CONFLICT DO NOTHING so it is safe to call
// multiple times. Returns counts of inserted vs skipped rows.
export async function POST() {
  try {
    const existing = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(countries);
    const before = existing[0]?.count ?? 0;

    await db
      .insert(countries)
      .values(
        COUNTRIES_DATA.map((c) => ({
          iso3:         c.iso3,
          name:         c.name,
          gdpBn:        String(c.gdpBn),
          pubInvPctGdp: String(c.pubInvPctGdp),
          pubInvBn:     String(c.pubInvBn),
        }))
      )
      .onConflictDoNothing();

    const after = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(countries);
    const inserted = (after[0]?.count ?? 0) - before;

    return NextResponse.json({
      ok: true,
      total: after[0]?.count ?? 0,
      inserted,
      skipped: COUNTRIES_DATA.length - inserted,
    });
  } catch (err) {
    console.error("[POST /api/seed-countries]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
