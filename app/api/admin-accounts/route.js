import { NextResponse } from "next/server";
import {
  createAdminAccount,
  deleteAdminAccount,
  listPublicAdminAccounts,
  updateAdminAccount,
} from "@/lib/admin-accounts";
import {
  clientIpFromRequest,
  createRequestId,
  logOpsEvent,
  recordAuditEvent,
} from "@/lib/audit-log";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function isAdminRequest(request) {
  return request.headers.get("x-collaburo-admin") === "1";
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
}

export async function GET(request) {
  if (!isAdminRequest(request)) return unauthorized();
  return NextResponse.json({
    ok: true,
    accounts: await listPublicAdminAccounts(),
    currentUsername: request.headers.get("x-collaburo-admin-user") || "",
  });
}

export async function POST(request) {
  if (!isAdminRequest(request)) return unauthorized();
  const requestId = createRequestId();
  const actorId = request.headers.get("x-collaburo-admin-user") || "admin";
  const ip = clientIpFromRequest(request);
  const body = await request.json().catch(() => ({}));
  try {
    const account = await createAdminAccount(body);
    await recordAuditEvent({
      actorType: "admin",
      actorId,
      action: "account.created",
      resourceType: "account",
      resourceId: String(account?.id || account?.username || ""),
      outcome: "success",
      requestId,
      ip,
      summary: `Admin account created: ${account?.username || ""}`,
      metadata: { username: account?.username || "" },
    });
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    logOpsEvent({
      level: "error",
      requestId,
      route: "/api/admin-accounts",
      action: "account.created",
      actorId,
      message: error.message || "Could not create admin account",
    });
    return NextResponse.json({ ok: false, error: error.message || "Could not create admin account." }, { status: 400 });
  }
}

export async function PUT(request) {
  if (!isAdminRequest(request)) return unauthorized();
  const requestId = createRequestId();
  const actorId = request.headers.get("x-collaburo-admin-user") || "admin";
  const ip = clientIpFromRequest(request);
  const body = await request.json().catch(() => ({}));
  try {
    const account = await updateAdminAccount(String(body.id || ""), body);
    await recordAuditEvent({
      actorType: "admin",
      actorId,
      action: "account.updated",
      resourceType: "account",
      resourceId: String(account?.id || body.id || ""),
      outcome: "success",
      requestId,
      ip,
      summary: `Admin account updated: ${account?.username || body.id || ""}`,
      metadata: { username: account?.username || "" },
    });
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    logOpsEvent({
      level: "error",
      requestId,
      route: "/api/admin-accounts",
      action: "account.updated",
      actorId,
      message: error.message || "Could not update admin account",
    });
    return NextResponse.json({ ok: false, error: error.message || "Could not update admin account." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) return unauthorized();
  const requestId = createRequestId();
  const actorId = request.headers.get("x-collaburo-admin-user") || "admin";
  const ip = clientIpFromRequest(request);
  const body = await request.json().catch(() => ({}));
  const accountId = String(body.id || "");
  try {
    await deleteAdminAccount(accountId);
    await recordAuditEvent({
      actorType: "admin",
      actorId,
      action: "account.deleted",
      resourceType: "account",
      resourceId: accountId,
      outcome: "success",
      requestId,
      ip,
      summary: `Admin account deleted: ${accountId}`,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    logOpsEvent({
      level: "error",
      requestId,
      route: "/api/admin-accounts",
      action: "account.deleted",
      actorId,
      message: error.message || "Could not delete admin account",
    });
    return NextResponse.json({ ok: false, error: error.message || "Could not delete admin account." }, { status: 400 });
  }
}
