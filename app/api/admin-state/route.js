import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const APP_STATE_KEY = "default";
// Allow for timestamp serialization rounding between Postgres and ISO strings.
const STALE_WRITE_TOLERANCE_MS = 2000;
let memoryState = null;
let memoryUpdatedAt = null;

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

function isAdminRequest(request) {
  // Set by middleware after auth; any client-supplied value is stripped there.
  return request.headers.get("x-collaburo-admin") === "1";
}

function sanitizeForPublic(state) {
  if (!state || typeof state !== "object") return state;
  if (state.liveState && typeof state.liveState === "object") {
    return sanitizeForPublic(state.liveState);
  }
  // The public booking flow only needs form/catalog/pricing/site config.
  // progressRecords hold client PII and must never reach unauthenticated visitors.
  const { progressRecords, ...publicState } = state;
  return publicState;
}

function conflictResponse(currentUpdatedAt) {
  return NextResponse.json(
    {
      ok: false,
      conflict: true,
      updatedAt: currentUpdatedAt,
      error: "The database changed after this page loaded. The app refreshed its save checkpoint; try saving again if this message remains.",
    },
    { status: 409 }
  );
}

export async function GET(request) {
  const admin = isAdminRequest(request);
  const sql = database();
  if (!sql) {
    const state = admin ? memoryState : sanitizeForPublic(memoryState);
    return NextResponse.json({ ok: true, state, updatedAt: memoryUpdatedAt, source: "memory" });
  }

  const rows = await sql`
    select payload, updated_at
    from collaburo_app_config
    where key = ${APP_STATE_KEY}
    limit 1
  `;
  const payload = rows[0]?.payload || null;
  const state = admin ? payload : sanitizeForPublic(payload);
  return NextResponse.json({ ok: true, state, updatedAt: rows[0]?.updated_at || null, source: "database" });
}

export async function PUT(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Missing admin state payload." }, { status: 400 });
  }

  // baseUpdatedAt is the updated_at the client last loaded; it is transport
  // metadata for optimistic concurrency, not part of the stored state.
  const { baseUpdatedAt, ...state } = body;
  const baseMs = baseUpdatedAt ? new Date(baseUpdatedAt).getTime() || 0 : null;

  const sql = database();
  if (!sql) {
    const currentMs = memoryUpdatedAt ? new Date(memoryUpdatedAt).getTime() || 0 : 0;
    if (baseMs !== null && currentMs > baseMs + STALE_WRITE_TOLERANCE_MS) {
      return conflictResponse(memoryUpdatedAt);
    }
    memoryState = state;
    memoryUpdatedAt = new Date().toISOString();
    return NextResponse.json({ ok: true, source: "memory", updatedAt: memoryUpdatedAt });
  }

  let rows;
  if (baseMs !== null) {
    const baseIso = new Date(baseMs + STALE_WRITE_TOLERANCE_MS).toISOString();
    rows = await sql`
      insert into collaburo_app_config (key, payload, updated_at)
      values (${APP_STATE_KEY}, ${JSON.stringify(state)}, now())
      on conflict (key)
      do update set payload = excluded.payload, updated_at = now()
      where collaburo_app_config.updated_at <= ${baseIso}::timestamptz
      returning updated_at
    `;
    if (!rows.length) {
      const current = await sql`
        select updated_at from collaburo_app_config where key = ${APP_STATE_KEY} limit 1
      `;
      return conflictResponse(current[0]?.updated_at || null);
    }
  } else {
    // Legacy clients without baseUpdatedAt: last write wins (pre-existing behavior).
    rows = await sql`
      insert into collaburo_app_config (key, payload, updated_at)
      values (${APP_STATE_KEY}, ${JSON.stringify(state)}, now())
      on conflict (key)
      do update set payload = excluded.payload, updated_at = now()
      returning updated_at
    `;
  }
  return NextResponse.json({ ok: true, source: "database", updatedAt: rows[0]?.updated_at || null });
}
