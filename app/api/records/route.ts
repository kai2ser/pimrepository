import { NextRequest, NextResponse } from "next/server";
import { listRecords, createRecord } from "@/modules/records/queries";
import { policyRecordSchema } from "@/modules/records/schema";
import { requireAuth } from "@/lib/auth";
import { audit } from "@/lib/audit";

// GET /api/records?search=&country=&policyGuidanceTier=&strategyTier=
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get("search") ?? undefined;
    const country = searchParams.get("country") ?? undefined;
    const pgt = searchParams.get("policyGuidanceTier");
    const st = searchParams.get("strategyTier");

    const pgtNum = pgt ? parseInt(pgt, 10) : undefined;
    const stNum = st ? parseInt(st, 10) : undefined;
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const offset = offsetParam ? parseInt(offsetParam, 10) : undefined;

    const records = await listRecords({
      search,
      country,
      policyGuidanceTier: pgtNum && !isNaN(pgtNum) ? pgtNum : undefined,
      strategyTier: stNum && !isNaN(stNum) ? stNum : undefined,
      limit: limit && !isNaN(limit) ? Math.min(limit, 500) : undefined,
      offset: offset && !isNaN(offset) ? offset : undefined,
    });

    return NextResponse.json(records, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[GET /api/records]", err);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

// POST /api/records (auth required)
export async function POST(req: NextRequest) {
  const authResult = await requireAuth();
  if (!authResult.authorized) return authResult.response;

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
    audit({
      session: authResult.session,
      action: "create",
      entity: "record",
      entityId: record.id,
      detail: `Created: ${parsed.data.nameEng}`,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[POST /api/records]", err);
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
