export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { listRecords, createRecord } from "@/modules/records/queries";
import { policyRecordSchema } from "@/modules/records/schema";

// GET /api/records?search=&country=&policyGuidanceTier=&strategyTier=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const country = searchParams.get("country") ?? undefined;
    const pgt = searchParams.get("policyGuidanceTier");
    const st = searchParams.get("strategyTier");

    const records = await listRecords({
      search,
      country,
      policyGuidanceTier: pgt ? parseInt(pgt) : undefined,
      strategyTier: st ? parseInt(st) : undefined,
    });

    return NextResponse.json(records);
  } catch (err) {
    console.error("[GET /api/records]", err);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

// POST /api/records
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = policyRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const record = await createRecord(parsed.data);
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[POST /api/records]", err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
