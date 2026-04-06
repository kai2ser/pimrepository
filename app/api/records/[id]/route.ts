import { NextRequest, NextResponse } from "next/server";
import {
  getRecordWithDocs,
  updateRecord,
  deleteRecord,
} from "@/modules/records/queries";
import { policyRecordUpdateSchema } from "@/modules/records/schema";
import { requireAuth } from "@/lib/auth";
import { audit } from "@/lib/audit";

// GET /api/records/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const record = await getRecordWithDocs(id);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (err) {
    console.error("[GET /api/records/:id]", err);
    return NextResponse.json({ error: "Failed to fetch record" }, { status: 500 });
  }
}

// PATCH /api/records/:id (auth required)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = policyRecordUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const record = await updateRecord(id, parsed.data);
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    audit({
      session: authResult.session,
      action: "update",
      entity: "record",
      entityId: id,
      detail: `Updated record`,
    });
    return NextResponse.json(record);
  } catch (err) {
    console.error("[PATCH /api/records/:id]", err);
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

// DELETE /api/records/:id (auth required)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = await requireAuth();
  if (!authResult.authorized) return authResult.response;

  try {
    const { id } = await params;
    await deleteRecord(id);
    audit({
      session: authResult.session,
      action: "delete",
      entity: "record",
      entityId: id,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/records/:id]", err);
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
