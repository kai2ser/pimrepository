import { db } from "@/lib/db";
import { auditLogs } from "@/drizzle/schema";
import { headers } from "next/headers";
import type { Session } from "next-auth";

export type AuditAction = "create" | "update" | "delete";
export type AuditEntity = "record" | "document";

interface AuditEntry {
  session: Session;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  detail?: string;
}

/**
 * Log an audit event. Fire-and-forget — errors are logged
 * to console but never block the request.
 */
export function audit(entry: AuditEntry): void {
  // Run async but don't await — caller isn't blocked
  writeAuditLog(entry).catch((err) =>
    console.error("[audit] Failed to write audit log:", err)
  );
}

async function writeAuditLog(entry: AuditEntry) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    hdrs.get("x-real-ip") ??
    null;

  await db.insert(auditLogs).values({
    userId: entry.session.user.id ?? null,
    userEmail: entry.session.user.email ?? null,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId ?? null,
    detail: entry.detail ?? null,
    ip,
  });
}
