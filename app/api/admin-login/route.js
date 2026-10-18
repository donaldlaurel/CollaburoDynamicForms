import { NextResponse } from "next/server";
import {
  adminCredentials,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { findLoginAccount } from "@/lib/admin-accounts";
import {
  clientIpFromRequest,
  createRequestId,
  logOpsEvent,
  recordAuditEvent,
} from "@/lib/audit-log";

export async function POST(request) {
  const requestId = createRequestId();
  const ip = clientIpFromRequest(request);
  const { username, password } = adminCredentials();
  if (!password) {
    logOpsEvent({
      level: "error",
      requestId,
      route: "/api/admin-login",
      action: "session.login",
      message: "ADMIN_PASSWORD is not configured",
    });
    return NextResponse.json(
      { ok: false, error: "Admin is locked: ADMIN_PASSWORD is not configured on the server." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const attemptedUser = String(body.username || "").trim();
  const account = await findLoginAccount(body.username, body.password);
  if (!account) {
    await recordAuditEvent({
      actorType: "admin",
      actorId: attemptedUser || "unknown",
      action: "session.login",
      resourceType: "session",
      outcome: "failure",
      requestId,
      ip,
      summary: "Admin login failed",
    });
    logOpsEvent({
      level: "warn",
      requestId,
      route: "/api/admin-login",
      action: "session.login",
      actorId: attemptedUser,
      message: "Invalid admin username or password",
    });
    return NextResponse.json({ ok: false, error: "Invalid admin username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, account });
  await setAdminSessionCookie(response, account.username || username, password);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  await recordAuditEvent({
    actorType: "admin",
    actorId: account.username || username,
    action: "session.login",
    resourceType: "session",
    outcome: "success",
    requestId,
    ip,
    summary: "Admin logged in",
  });
  return response;
}
