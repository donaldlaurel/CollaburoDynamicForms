import { NextResponse } from "next/server";
import {
  createAdminAccount,
  deleteAdminAccount,
  listPublicAdminAccounts,
  updateAdminAccount,
} from "@/lib/admin-accounts";

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
  const body = await request.json().catch(() => ({}));
  try {
    const account = await createAdminAccount(body);
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not create admin account." }, { status: 400 });
  }
}

export async function PUT(request) {
  if (!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(() => ({}));
  try {
    const account = await updateAdminAccount(String(body.id || ""), body);
    return NextResponse.json({ ok: true, account });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not update admin account." }, { status: 400 });
  }
}

export async function DELETE(request) {
  if (!isAdminRequest(request)) return unauthorized();
  const body = await request.json().catch(() => ({}));
  try {
    await deleteAdminAccount(String(body.id || ""));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not delete admin account." }, { status: 400 });
  }
}
