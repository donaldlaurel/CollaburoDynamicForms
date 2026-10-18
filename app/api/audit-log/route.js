import { NextResponse } from "next/server";
import { listAuditEvents } from "../../../lib/audit-log";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

function isAdminRequest(request) {
  return request.headers.get("x-collaburo-admin") === "1";
}

export async function GET(request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = url.searchParams.get("limit");
  const cursor = url.searchParams.get("cursor") || "";
  const action = url.searchParams.get("action") || "";
  const actor = url.searchParams.get("actor") || "";
  const resourceType = url.searchParams.get("resourceType") || "";
  const resourceId = url.searchParams.get("resourceId") || "";
  const since = url.searchParams.get("since") || "";
  const until = url.searchParams.get("until") || "";

  try {
    const result = await listAuditEvents({
      limit,
      cursor,
      action,
      actorId: actor,
      resourceType,
      resourceId,
      since,
      until,
    });
    return NextResponse.json({
      ok: true,
      events: result.events,
      nextCursor: result.nextCursor,
      source: result.source,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to load audit events." },
      { status: 500 }
    );
  }
}
