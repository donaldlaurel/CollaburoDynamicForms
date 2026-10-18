import { neon } from "@neondatabase/serverless";
import memory from "./memory-store";

const MEMORY_AUDIT_CAP = 500;
const DEFAULT_LIST_LIMIT = 50;
const MAX_LIST_LIMIT = 100;

// One ensure per isolate so the first Activity visit (or first audit write)
// creates the table without paying DDL on every request.
const auditSchemaState = globalThis.__collaburoAuditSchema || (globalThis.__collaburoAuditSchema = {
  promise: null,
});

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

/**
 * Idempotent CREATE TABLE / indexes. Safe to call on every Activity load;
 * after the first success this isolate skips DDL.
 */
export async function ensureAuditEventsTable(sql = database()) {
  if (!sql) return false;
  if (!auditSchemaState.promise) {
    auditSchemaState.promise = (async () => {
      await sql`create extension if not exists pgcrypto`;
      await sql`
        create table if not exists collaburo_audit_events (
          id uuid primary key default gen_random_uuid(),
          created_at timestamptz not null default now(),
          actor_type text not null,
          actor_id text not null default '',
          action text not null,
          resource_type text not null default '',
          resource_id text not null default '',
          outcome text not null default 'success',
          request_id text not null default '',
          ip text not null default '',
          summary text not null default '',
          metadata jsonb not null default '{}'::jsonb
        )
      `;
      await sql`
        create index if not exists collaburo_audit_events_created_at_idx
          on collaburo_audit_events (created_at desc)
      `;
      await sql`
        create index if not exists collaburo_audit_events_action_idx
          on collaburo_audit_events (action)
      `;
      await sql`
        create index if not exists collaburo_audit_events_resource_idx
          on collaburo_audit_events (resource_type, resource_id)
      `;
      return true;
    })().catch((error) => {
      auditSchemaState.promise = null;
      throw error;
    });
  }
  return auditSchemaState.promise;
}

export function createRequestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function clientIpFromRequest(request) {
  if (!request?.headers) return "";
  return (
    request.headers.get("cf-connecting-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    ""
  );
}

export function logOpsEvent({
  level = "error",
  requestId = "",
  route = "",
  action = "",
  actorId = "",
  message = "",
} = {}) {
  const payload = {
    level,
    requestId: String(requestId || ""),
    route: String(route || ""),
    action: String(action || ""),
    actorId: String(actorId || ""),
    message: String(message || ""),
  };
  const line = JSON.stringify(payload);
  if (level === "warn") console.warn(line);
  else console.error(line);
}

function normalizeEvent(input = {}) {
  const metadata =
    input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)
      ? input.metadata
      : {};
  return {
    id: input.id || createRequestId(),
    createdAt: input.createdAt || new Date().toISOString(),
    actorType: String(input.actorType || "system"),
    actorId: String(input.actorId || ""),
    action: String(input.action || ""),
    resourceType: String(input.resourceType || ""),
    resourceId: String(input.resourceId || ""),
    outcome: String(input.outcome || "success"),
    requestId: String(input.requestId || ""),
    ip: String(input.ip || ""),
    summary: String(input.summary || ""),
    metadata,
  };
}

function pushMemoryEvent(event) {
  if (!Array.isArray(memory.auditEvents)) memory.auditEvents = [];
  memory.auditEvents.unshift(event);
  if (memory.auditEvents.length > MEMORY_AUDIT_CAP) {
    memory.auditEvents.length = MEMORY_AUDIT_CAP;
  }
}

/**
 * Best-effort append. Never throws into the caller request path.
 */
export async function recordAuditEvent(input = {}) {
  const event = normalizeEvent(input);
  if (!event.action) return null;

  const sql = database();
  if (!sql) {
    pushMemoryEvent(event);
    return event;
  }

  try {
    await ensureAuditEventsTable(sql);
    const rows = await sql`
      insert into collaburo_audit_events (
        actor_type, actor_id, action, resource_type, resource_id,
        outcome, request_id, ip, summary, metadata
      ) values (
        ${event.actorType},
        ${event.actorId},
        ${event.action},
        ${event.resourceType},
        ${event.resourceId},
        ${event.outcome},
        ${event.requestId},
        ${event.ip},
        ${event.summary},
        ${JSON.stringify(event.metadata)}::jsonb
      )
      returning id, created_at
    `;
    event.id = rows[0]?.id || event.id;
    event.createdAt = rows[0]?.created_at || event.createdAt;
    return event;
  } catch (error) {
    logOpsEvent({
      level: "error",
      requestId: event.requestId,
      route: "lib/audit-log",
      action: "audit.record",
      actorId: event.actorId,
      message: error?.message || "Failed to record audit event",
    });
    return null;
  }
}

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(String(text || ""));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const padded = String(value || "").replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(String(value || "").length / 4) * 4, "=");
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

function encodeCursor(createdAt, id) {
  if (!createdAt || !id) return null;
  return toBase64Url(JSON.stringify({ createdAt, id }));
}

function decodeCursor(cursor) {
  if (!cursor || typeof cursor !== "string") return null;
  try {
    const parsed = JSON.parse(fromBase64Url(cursor));
    if (!parsed?.createdAt || !parsed?.id) return null;
    return { createdAt: String(parsed.createdAt), id: String(parsed.id) };
  } catch {
    return null;
  }
}

function mapRow(row) {
  return {
    id: row.id,
    createdAt: row.created_at || row.createdAt,
    actorType: row.actor_type || row.actorType,
    actorId: row.actor_id || row.actorId,
    action: row.action,
    resourceType: row.resource_type || row.resourceType,
    resourceId: row.resource_id || row.resourceId,
    outcome: row.outcome,
    requestId: row.request_id || row.requestId,
    ip: row.ip,
    summary: row.summary,
    metadata: row.metadata && typeof row.metadata === "object" ? row.metadata : {},
  };
}

function filterMemoryEvents(events, filters) {
  return events.filter((event) => {
    if (filters.action && event.action !== filters.action) return false;
    if (filters.actorId && !String(event.actorId || "").toLowerCase().includes(filters.actorId.toLowerCase())) {
      return false;
    }
    if (filters.resourceType && event.resourceType !== filters.resourceType) return false;
    if (filters.resourceId && event.resourceId !== filters.resourceId) return false;
    if (filters.since) {
      const t = Date.parse(event.createdAt);
      if (!Number.isNaN(t) && t < Date.parse(filters.since)) return false;
    }
    if (filters.until) {
      const t = Date.parse(event.createdAt);
      if (!Number.isNaN(t) && t > Date.parse(filters.until)) return false;
    }
    if (filters.cursor) {
      const cursorTime = Date.parse(filters.cursor.createdAt);
      const eventTime = Date.parse(event.createdAt);
      if (eventTime > cursorTime) return false;
      if (eventTime === cursorTime && String(event.id) >= String(filters.cursor.id)) return false;
    }
    return true;
  });
}

export async function listAuditEvents({
  limit = DEFAULT_LIST_LIMIT,
  cursor = null,
  action = "",
  actorId = "",
  resourceType = "",
  resourceId = "",
  since = "",
  until = "",
} = {}) {
  const safeLimit = Math.min(MAX_LIST_LIMIT, Math.max(1, Number(limit) || DEFAULT_LIST_LIMIT));
  const decodedCursor = typeof cursor === "string" ? decodeCursor(cursor) : cursor;

  const sql = database();
  if (!sql) {
    const filtered = filterMemoryEvents(Array.isArray(memory.auditEvents) ? memory.auditEvents : [], {
      action,
      actorId,
      resourceType,
      resourceId,
      since,
      until,
      cursor: decodedCursor,
    });
    const page = filtered.slice(0, safeLimit).map(mapRow);
    const last = page[page.length - 1];
    return {
      events: page,
      nextCursor: page.length === safeLimit && last ? encodeCursor(last.createdAt, last.id) : null,
      source: "memory",
    };
  }

  // First Activity menu visit (GET /api/audit-log) creates the table if needed.
  await ensureAuditEventsTable(sql);

  // Neon tagged templates do not compose dynamic WHERE easily; use a small set of branches.
  const actorFilter = actorId ? `%${actorId}%` : null;
  let rows;

  if (decodedCursor) {
    rows = await sql`
      select id, created_at, actor_type, actor_id, action, resource_type, resource_id,
             outcome, request_id, ip, summary, metadata
      from collaburo_audit_events
      where (created_at, id) < (${decodedCursor.createdAt}::timestamptz, ${decodedCursor.id}::uuid)
        and (${action || null}::text is null or action = ${action || null})
        and (${actorFilter}::text is null or actor_id ilike ${actorFilter})
        and (${resourceType || null}::text is null or resource_type = ${resourceType || null})
        and (${resourceId || null}::text is null or resource_id = ${resourceId || null})
        and (${since || null}::text is null or created_at >= ${since || null}::timestamptz)
        and (${until || null}::text is null or created_at <= ${until || null}::timestamptz)
      order by created_at desc, id desc
      limit ${safeLimit}
    `;
  } else {
    rows = await sql`
      select id, created_at, actor_type, actor_id, action, resource_type, resource_id,
             outcome, request_id, ip, summary, metadata
      from collaburo_audit_events
      where (${action || null}::text is null or action = ${action || null})
        and (${actorFilter}::text is null or actor_id ilike ${actorFilter})
        and (${resourceType || null}::text is null or resource_type = ${resourceType || null})
        and (${resourceId || null}::text is null or resource_id = ${resourceId || null})
        and (${since || null}::text is null or created_at >= ${since || null}::timestamptz)
        and (${until || null}::text is null or created_at <= ${until || null}::timestamptz)
      order by created_at desc, id desc
      limit ${safeLimit}
    `;
  }

  const events = (rows || []).map(mapRow);
  const last = events[events.length - 1];
  return {
    events,
    nextCursor: events.length === safeLimit && last ? encodeCursor(last.createdAt, last.id) : null,
    source: "database",
  };
}
