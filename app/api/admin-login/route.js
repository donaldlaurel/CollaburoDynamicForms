import { NextResponse } from "next/server";
import {
  adminCredentials,
  setAdminSessionCookie,
} from "@/lib/admin-auth";
import { findLoginAccount } from "@/lib/admin-accounts";

export async function POST(request) {
  const { username, password } = adminCredentials();
  if (!password) {
    return NextResponse.json(
      { ok: false, error: "Admin is locked: ADMIN_PASSWORD is not configured on the server." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const account = await findLoginAccount(body.username, body.password);
  if (!account) {
    return NextResponse.json({ ok: false, error: "Invalid admin username or password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, account });
  await setAdminSessionCookie(response, account.username || username, password);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Pragma", "no-cache");
  return response;
}
