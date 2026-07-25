import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

let memorySubmissions = [];
let memoryState = null;
let memoryUpdatedAt = null;
const APP_STATE_KEY = "default";

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

function base64UrlDecode(value = "") {
  const padded = String(value).replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

function tokenSecret() {
  return (
    process.env.EMAIL_VERIFICATION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    process.env.RESEND_API_KEY ||
    ""
  );
}

async function signPayload(payload) {
  const secret = tokenSecret();
  if (!secret) throw new Error("Email verification is not configured.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const bytes = new Uint8Array(signature);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function verifyEmailSession(token, email) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) throw new Error("Email verification required.");
  const expected = await signPayload(payload);
  if (!timingSafeEqual(base64UrlDecode(signature), base64UrlDecode(expected))) {
    throw new Error("Email verification required.");
  }
  const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  const sessionEmail = String(data?.email || "").trim().toLowerCase();
  const targetEmail = String(email || "").trim().toLowerCase();
  if (!sessionEmail || sessionEmail !== targetEmail || data?.purpose !== "email-session" || Date.now() > Number(data.exp || 0)) {
    throw new Error("Email verification required.");
  }
  return sessionEmail;
}

function bookingCodeFromId(id = "") {
  const value = String(id || "").trim();
  if (/^B[A-Z0-9]{5}$/.test(value)) return value;
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash * 31) + value.charCodeAt(i)) >>> 0;
  }
  return `B${hash.toString(36).toUpperCase().padStart(5, "0").slice(-5)}`;
}

function recordMatchesBookingId(record = {}, id = "") {
  const value = String(id || "");
  return String(record?.id || "") === value
    || String(record?.bookingCode || "") === value
    || bookingCodeFromId(record?.id || record?.progressNo || "") === value;
}

function recordMatchesEmail(record = {}, email = "") {
  return String(record.client?.email || "").trim().toLowerCase() === String(email || "").trim().toLowerCase();
}

function latestRecordForEmail(records = [], email = "") {
  return (records || [])
    .filter((record) => recordMatchesEmail(record, email))
    .sort((a, b) => new Date(b.progress?.lastActivityAt || b.submittedAt || 0) - new Date(a.progress?.lastActivityAt || a.submittedAt || 0))[0] || null;
}

const ADMIN_EDITABLE_BOOKING_SECTIONS = [
  "client",
  "request",
  "venueCost",
  "layoutRecommendations",
  "answers",
  "answerSummary",
  "costs",
  "emailVerification",
  "stepProgress",
];

function changedBookingFields(before = {}, after = {}) {
  return ADMIN_EDITABLE_BOOKING_SECTIONS.filter((key) =>
    JSON.stringify(before?.[key] ?? null) !== JSON.stringify(after?.[key] ?? null)
  );
}

function applyAdminBookingEdit(existing, proposed, adminUser, auditBefore = null, displayChanges = []) {
  // The admin form supplies the exact record opened for editing. Prefer it for
  // auditing: application state can be refreshed or normalized while the form
  // is open, which otherwise makes unchanged-looking snapshots of its values.
  const before = auditBefore && typeof auditBefore === "object" ? auditBefore : existing;
  const changedFields = changedBookingFields(before, proposed);
  const safeDisplayChanges = Array.isArray(displayChanges) ? displayChanges.slice(0, 500) : [];
  const changes = safeDisplayChanges.map((change) => ({
    field: [change.section, change.label].filter(Boolean).join(" — "),
    before: change.before ?? null,
    after: change.after ?? null,
  }));
  const editedAt = new Date().toISOString();
  const auditId = crypto.randomUUID();
  const next = { ...existing };
  ADMIN_EDITABLE_BOOKING_SECTIONS.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(proposed, key)) next[key] = proposed[key];
  });
  next.progress = { ...(existing.progress || {}), lastActivityAt: editedAt };
  next.adminAudit = [
    {
      action: "booking-form-edit",
      adminUser: adminUser || "admin",
      editedAt,
      auditId,
      changedFields,
      changes,
      displayChanges: safeDisplayChanges,
    },
    ...((existing.adminAudit || []).slice(0, 99)),
  ];
  next.log = [
    { auditId, label: adminUser || "Admin", at: new Date(editedAt).toLocaleString(), action: `Edited booking form${changedFields.length ? ` (${changedFields.join(", ")})` : ""}` },
    ...((existing.log || []).slice(0, 199)),
  ];
  return { record: next, changedFields, editedAt };
}

async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Dedupe key for repeated submits of the same request (double-clicks, retries,
// browser refreshes). Only computed when there is a client email to anchor it.
async function submissionFingerprint(client, requestInfo, total) {
  const email = String(client.email || "").trim().toLowerCase();
  if (!email) return null;
  const source = [
    email,
    String(requestInfo.space || "").trim().toLowerCase(),
    String(requestInfo.bookingDateTime || "").trim().toLowerCase(),
    String(total),
  ].join("|");
  return sha256Hex(source);
}

async function appendProgressRecordToAdminState(sql, record) {
  if (!sql || !record || typeof record !== "object") return;
  const rows = await sql`
    select payload
    from collaburo_app_config
    where key = ${APP_STATE_KEY}
    limit 1
  `;
  const current = rows[0]?.payload && typeof rows[0].payload === "object" ? rows[0].payload : {};
  const progressRecords = Array.isArray(current.progressRecords) ? current.progressRecords : [];
  const submittedAt = String(record.submittedAt || "");
  const email = String(record.client?.email || "").trim().toLowerCase();
  const exists = progressRecords.some((item) => {
    if (String(item?.id || "") === String(record.id || "")) return true;
    return submittedAt
      && String(item?.submittedAt || "") === submittedAt
      && String(item?.client?.email || "").trim().toLowerCase() === email;
  });
  if (exists) return;
  const nextState = {
    ...current,
    savedAt: new Date().toISOString(),
    progressRecords: [record, ...progressRecords].slice(0, 500),
  };
  await sql`
    insert into collaburo_app_config (key, payload, updated_at)
    values (${APP_STATE_KEY}, ${JSON.stringify(nextState)}, now())
    on conflict (key)
    do update set payload = excluded.payload, updated_at = now()
  `;
}

export async function GET() {
  const sql = database();
  if (!sql) return NextResponse.json({ ok: true, submissions: memorySubmissions, source: "memory" });

  const rows = await sql`
    select id, client_name, client_email, event_space, status, total, created_at, payload
    from collaburo_submissions
    order by created_at desc
    limit 250
  `;
  return NextResponse.json({ ok: true, submissions: rows, source: "database" });
}

async function replaceProgressRecordInAdminState(sql, record, loadedState = null) {
  if (!sql || !record?.id) return null;
  let current = loadedState && typeof loadedState === "object" ? loadedState : null;
  if (!current) {
    const rows = await sql`
      select payload
      from collaburo_app_config
      where key = ${APP_STATE_KEY}
      limit 1
    `;
    current = rows[0]?.payload && typeof rows[0].payload === "object" ? rows[0].payload : {};
  }
  const progressRecords = Array.isArray(current.progressRecords) ? current.progressRecords : [];
  const nextRecords = progressRecords.map((item) => String(item?.id || "") === String(record.id) ? record : item);
  if (!nextRecords.some((item) => String(item?.id || "") === String(record.id))) {
    nextRecords.unshift(record);
  }
  const nextState = {
    ...current,
    savedAt: new Date().toISOString(),
    progressRecords: nextRecords.slice(0, 500),
  };
  await sql`
    insert into collaburo_app_config (key, payload, updated_at)
    values (${APP_STATE_KEY}, ${JSON.stringify(nextState)}, now())
    on conflict (key)
    do update set payload = excluded.payload, updated_at = now()
  `;
  return record;
}

async function replaceSubmissionPayload(sql, record) {
  if (!sql || !record?.id) return;
  const total = Number(record.costs?.totalWithDeposit || record.costs?.total || 0);
  const updated = await sql`
    update collaburo_submissions
    set client_name = ${record.client?.name || "New Client"},
        client_email = ${record.client?.email || ""},
        event_space = ${record.request?.space || ""},
        status = ${record.progress?.status || "In Discussion"},
        total = ${total},
        payload = ${JSON.stringify(record)}
    where payload->>'id' = ${String(record.id)}
    returning id
  `;
  if (updated.length) return;
  const fingerprint = await submissionFingerprint(record.client || {}, record.request || {}, total);
  await sql`
    insert into collaburo_submissions (
      client_name,
      client_email,
      event_space,
      status,
      total,
      payload,
      fingerprint
    )
    values (
      ${record.client?.name || "New Client"},
      ${record.client?.email || ""},
      ${record.request?.space || ""},
      ${record.progress?.status || "In Discussion"},
      ${total},
      ${JSON.stringify(record)},
      ${fingerprint}
    )
    on conflict (fingerprint) where fingerprint is not null
    do update set
      client_name = excluded.client_name,
      client_email = excluded.client_email,
      event_space = excluded.event_space,
      status = excluded.status,
      total = excluded.total,
      payload = excluded.payload
  `;
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (body?.action === "admin-update-booking") {
    if (request.headers.get("x-collaburo-admin") !== "1") {
      return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
    }
    const proposed = body.record;
    if (!proposed?.id) return NextResponse.json({ ok: false, error: "Missing booking record." }, { status: 400 });
    const sql = database();
    const state = sql ? (await sql`
      select payload from collaburo_app_config where key = ${APP_STATE_KEY} limit 1
    `)[0]?.payload : memoryState;
    let existing = (state?.progressRecords || []).find((item) => recordMatchesBookingId(item, proposed.id));
    if (!existing && sql) {
      const rows = await sql`select payload from collaburo_submissions where payload->>'id' = ${String(proposed.id)} limit 1`;
      existing = rows[0]?.payload || null;
    } else if (!existing) {
      existing = memorySubmissions.find((item) => recordMatchesBookingId(item.payload, proposed.id))?.payload || null;
    }
    if (!existing) return NextResponse.json({ ok: false, error: "Booking record not found." }, { status: 404 });
    const result = applyAdminBookingEdit(existing, proposed, request.headers.get("x-collaburo-admin-user") || "admin", body.auditBefore, body.auditDisplayChanges);
    if (!sql) {
      await replaceProgressRecordInAdminState(null, result.record);
      const current = memoryState && typeof memoryState === "object" ? memoryState : {};
      const records = Array.isArray(current.progressRecords) ? current.progressRecords : [];
      const nextRecords = records.map((item) => recordMatchesBookingId(item, result.record.id) ? result.record : item);
      if (!nextRecords.some((item) => recordMatchesBookingId(item, result.record.id))) nextRecords.unshift(result.record);
      memoryState = { ...current, savedAt: result.editedAt, progressRecords: nextRecords.slice(0, 500) };
      memoryUpdatedAt = result.editedAt;
      memorySubmissions = memorySubmissions.map((item) => recordMatchesBookingId(item.payload, result.record.id) ? { ...item, payload: result.record } : item);
    } else {
      await Promise.all([
        replaceProgressRecordInAdminState(sql, result.record, state),
        replaceSubmissionPayload(sql, result.record),
      ]);
    }
    return NextResponse.json({ ok: true, ...result, source: sql ? "database" : "memory" });
  }
  if (body?.action === "touch-progress-record") {
    const id = String(body.recordId || "");
    if (!id) return NextResponse.json({ ok: false, error: "Missing record id." }, { status: 400 });
    const touchedAt = new Date().toISOString();
    const sql = database();
    if (!sql) {
      const current = memoryState && typeof memoryState === "object" ? memoryState : {};
      const progressRecords = Array.isArray(current.progressRecords) ? current.progressRecords : [];
      const nextRecords = progressRecords.map((item) => String(item?.id || "") === id
        ? { ...item, progress: { ...(item.progress || {}), lastActivityAt: touchedAt } }
        : item);
      memoryState = { ...current, savedAt: touchedAt, progressRecords: nextRecords.slice(0, 500) };
      memoryUpdatedAt = touchedAt;
      memorySubmissions = memorySubmissions.map((item) => item.payload?.id === id
        ? { ...item, payload: { ...item.payload, progress: { ...(item.payload.progress || {}), lastActivityAt: touchedAt } } }
        : item);
      return NextResponse.json({ ok: true, touchedAt, source: "memory" });
    }
    const rows = await sql`
      select payload
      from collaburo_app_config
      where key = ${APP_STATE_KEY}
      limit 1
    `;
    const current = rows[0]?.payload && typeof rows[0].payload === "object" ? rows[0].payload : {};
    const progressRecords = Array.isArray(current.progressRecords) ? current.progressRecords : [];
    const nextRecords = progressRecords.map((item) => String(item?.id || "") === id
      ? { ...item, progress: { ...(item.progress || {}), lastActivityAt: touchedAt } }
      : item);
    const nextState = { ...current, savedAt: touchedAt, progressRecords: nextRecords.slice(0, 500) };
    await sql`
      insert into collaburo_app_config (key, payload, updated_at)
      values (${APP_STATE_KEY}, ${JSON.stringify(nextState)}, now())
      on conflict (key)
      do update set payload = excluded.payload, updated_at = now()
    `;
    await sql`
      update collaburo_submissions
      set payload = jsonb_set(payload, '{progress,lastActivityAt}', to_jsonb(${touchedAt}::text), true)
      where payload->>'id' = ${id}
    `;
    return NextResponse.json({ ok: true, touchedAt, source: "database" });
  }
  if (body?.action === "get-progress-record") {
    const id = String(body.recordId || "");
    if (!id) return NextResponse.json({ ok: false, error: "Missing record id." }, { status: 400 });
    const sql = database();
    const source = sql ? (await sql`
      select payload
      from collaburo_app_config
      where key = ${APP_STATE_KEY}
      limit 1
    `)[0]?.payload : memoryState;
    const record = (source?.progressRecords || []).find((item) => recordMatchesBookingId(item, id));
    if (!record || record.progress?.accessibleByRecordLink === false) {
      return NextResponse.json({ ok: false, error: "Record not found or not available." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, record, source: sql ? "database" : "memory" });
  }
  if (body?.action === "get-progress-record-by-email") {
    const email = String(body.email || "").trim().toLowerCase();
    if (!email) return NextResponse.json({ ok: false, error: "Missing email." }, { status: 400 });
    try {
      await verifyEmailSession(body.emailSessionToken || body.sessionToken || "", email);
    } catch (error) {
      return NextResponse.json({ ok: false, error: error.message || "Email verification required." }, { status: 401 });
    }
    const sql = database();
    const source = sql ? (await sql`
      select payload
      from collaburo_app_config
      where key = ${APP_STATE_KEY}
      limit 1
    `)[0]?.payload : memoryState;
    let record = latestRecordForEmail(source?.progressRecords || [], email);
    if (!record && sql) {
      const rows = await sql`
        select payload
        from collaburo_submissions
        where lower(client_email) = ${email}
        order by created_at desc
        limit 1
      `;
      record = rows[0]?.payload || null;
    } else if (!record) {
      record = latestRecordForEmail(memorySubmissions.map((item) => item.payload).filter(Boolean), email);
    }
    if (!record || record.progress?.accessibleByRecordLink === false) {
      return NextResponse.json({ ok: false, error: "No saved booking found for this verified email." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, record, source: sql ? "database" : "memory" });
  }
  if (body?.action === "update-progress-record") {
    const record = body.record;
    if (!record?.id) return NextResponse.json({ ok: false, error: "Missing progress record." }, { status: 400 });
    const sql = database();
    if (!sql) {
      const current = memoryState && typeof memoryState === "object" ? memoryState : {};
      const progressRecords = Array.isArray(current.progressRecords) ? current.progressRecords : [];
      const nextRecords = progressRecords.map((item) => String(item?.id || "") === String(record.id) ? record : item);
      if (!nextRecords.some((item) => String(item?.id || "") === String(record.id))) nextRecords.unshift(record);
      memoryState = { ...current, savedAt: new Date().toISOString(), progressRecords: nextRecords.slice(0, 500) };
      memoryUpdatedAt = new Date().toISOString();
      memorySubmissions = memorySubmissions.map((item) => item.payload?.id === record.id ? { ...item, payload: record, client_name: record.client?.name || "New Client", client_email: record.client?.email || "", event_space: record.request?.space || "", status: record.progress?.status || "In Discussion", total: Number(record.costs?.totalWithDeposit || record.costs?.total || 0) } : item);
      return NextResponse.json({ ok: true, record, source: "memory" });
    }
    await replaceProgressRecordInAdminState(sql, record);
    await replaceSubmissionPayload(sql, record);
    return NextResponse.json({ ok: true, record, source: "database" });
  }
  const record = body?.record || body;
  if (!record || typeof record !== "object") {
    return NextResponse.json({ ok: false, error: "Missing submission record." }, { status: 400 });
  }

  const sql = database();
  const client = record.client || {};
  const requestInfo = record.request || {};
  const progress = record.progress || {};
  const costs = record.costs || {};
  const total = Number(costs.totalWithDeposit || costs.total || 0);
  const fingerprint = await submissionFingerprint(client, requestInfo, total);

  if (!sql) {
    const existing = fingerprint ? memorySubmissions.find((item) => item.fingerprint === fingerprint) : null;
    if (existing) {
      return NextResponse.json({ ok: true, submission: existing, duplicate: true, source: "memory" });
    }
    const submission = {
      id: crypto.randomUUID(),
      client_name: client.name || "New Client",
      client_email: client.email || "",
      event_space: requestInfo.space || "",
      status: progress.status || "New inquiry",
      total,
      created_at: new Date().toISOString(),
      payload: record,
      fingerprint,
    };
    memorySubmissions = [submission, ...memorySubmissions].slice(0, 250);
    const current = memoryState && typeof memoryState === "object" ? memoryState : {};
    const progressRecords = Array.isArray(current.progressRecords) ? current.progressRecords : [];
    memoryState = {
      ...current,
      savedAt: new Date().toISOString(),
      progressRecords: [record, ...progressRecords].slice(0, 500),
    };
    memoryUpdatedAt = new Date().toISOString();
    return NextResponse.json({ ok: true, submission, source: "memory" }, { status: 201 });
  }

  const rows = await sql`
    insert into collaburo_submissions (
      client_name,
      client_email,
      event_space,
      status,
      total,
      payload,
      fingerprint
    )
    values (
      ${client.name || "New Client"},
      ${client.email || ""},
      ${requestInfo.space || ""},
      ${progress.status || "New inquiry"},
      ${total},
      ${JSON.stringify(record)},
      ${fingerprint}
    )
    on conflict (fingerprint) where fingerprint is not null
    do nothing
    returning id, client_name, client_email, event_space, status, total, created_at, payload
  `;
  if (!rows.length) {
    const existing = await sql`
      select id, client_name, client_email, event_space, status, total, created_at, payload
      from collaburo_submissions
      where fingerprint = ${fingerprint}
      limit 1
    `;
    return NextResponse.json({ ok: true, submission: existing[0] || null, duplicate: true, source: "database" });
  }
  await appendProgressRecordToAdminState(sql, record);
  return NextResponse.json({ ok: true, submission: rows[0], source: "database" }, { status: 201 });
}
