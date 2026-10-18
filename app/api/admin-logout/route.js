import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/lib/admin-auth";
import {
  clientIpFromRequest,
  createRequestId,
  recordAuditEvent,
} from "@/lib/audit-log";

export async function POST(request) {
  const requestId = createRequestId();
  const actorId = request.headers.get("x-collaburo-admin-user") || "";
  const response = NextResponse.json({ ok: true });
  clearAdminSessionCookie(response);
  await recordAuditEvent({
    actorType: "admin",
    actorId: actorId || "admin",
    action: "session.logout",
    resourceType: "session",
    outcome: "success",
    requestId,
    ip: clientIpFromRequest(request),
    summary: "Admin logged out",
  });
  return response;
}
