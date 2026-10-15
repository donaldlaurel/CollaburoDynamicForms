import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";
import memory from "../../../lib/memory-store";
import { MAX_PROGRESS_RECORDS } from "../../../lib/progress-records";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const APP_STATE_KEY = "default";
const MAX_RECORDS_PER_REQUEST = 100;
const NO_STATE_ERROR = "No saved admin state found. Click Save in the admin dashboard once, then import again.";
// skip: keep existing bookings with the same id. overwrite: replace them with the
// imported version. replace: delete every booking first (both tables), then import.
const IMPORT_MODES = ["skip", "overwrite", "replace"];

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

function parseBody(body) {
  const mode = IMPORT_MODES.includes(body?.mode) ? body.mode : "skip";
  const records = Array.isArray(body?.records) ? body.records : null;
  if (!records?.length) return { error: "No records to import." };
  if (records.length > MAX_RECORDS_PER_REQUEST) return { error: `Send at most ${MAX_RECORDS_PER_REQUEST} records per request.` };
  const invalid = records.find((record) => !record || typeof record !== "object" || !/^legacy_\d+$/.test(String(record.id || "")));
  if (invalid) return { error: "Every imported record needs a legacy_<number> id." };
  const unique = Array.from(new Map(records.map((record) => [String(record.id), record])).values());
  return { mode, records: unique };
}

function capError(total) {
  return `Importing would make ${total} bookings, over the limit of ${MAX_PROGRESS_RECORDS}.`;
}

function submissionRow(record, fallbackDate) {
  return {
    id: crypto.randomUUID(),
    client_name: record.client?.name || "New Client",
    client_email: record.client?.email || "",
    event_space: record.request?.space || "",
    status: record.progress?.status || "In Discussion",
    total: Number(record.costs?.totalWithDeposit || 0),
    created_at: record.submittedAt || fallbackDate,
    payload: record,
    fingerprint: null,
  };
}

function importIntoMemory(mode, records) {
  const current = memory.state && typeof memory.state === "object" ? memory.state : null;
  if (!current) return NextResponse.json({ ok: false, error: NO_STATE_ERROR }, { status: 409 });
  const existing = mode === "replace" ? [] : Array.isArray(current.progressRecords) ? current.progressRecords : [];
  const incomingById = new Map(records.map((record) => [String(record.id), record]));
  const existingIds = new Set(existing.map((record) => String(record?.id || "")));
  const fresh = records.filter((record) => !existingIds.has(String(record.id)));
  const kept = mode === "overwrite"
    ? existing.map((record) => incomingById.get(String(record?.id || "")) || record)
    : existing;
  const nextRecords = [...kept, ...fresh];
  if (nextRecords.length > MAX_PROGRESS_RECORDS) {
    return NextResponse.json({ ok: false, error: capError(nextRecords.length) }, { status: 409 });
  }
  const savedAt = new Date().toISOString();
  memory.state = { ...current, savedAt, progressRecords: nextRecords };
  memory.updatedAt = savedAt;

  let submissions = mode === "replace" ? [] : memory.submissions;
  if (mode === "overwrite") {
    submissions = submissions.map((item) => {
      const record = incomingById.get(String(item.payload?.id || ""));
      return record ? { ...submissionRow(record, savedAt), id: item.id, created_at: item.created_at } : item;
    });
  }
  const submissionIds = new Set(submissions.map((item) => String(item.payload?.id || "")));
  memory.submissions = [
    ...submissions,
    ...records.filter((record) => !submissionIds.has(String(record.id))).map((record) => submissionRow(record, savedAt)),
  ];

  return NextResponse.json({
    ok: true,
    mode,
    added: fresh.length,
    overwritten: mode === "overwrite" ? records.length - fresh.length : 0,
    skipped: mode === "skip" ? records.length - fresh.length : 0,
    updatedAt: memory.updatedAt,
    source: "memory",
  });
}

export async function POST(request) {
  if (request.headers.get("x-collaburo-admin") !== "1") {
    return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
  }
  const { mode, records, error } = parseBody(await request.json().catch(() => null));
  if (error) return NextResponse.json({ ok: false, error }, { status: 400 });

  const sql = database();
  if (!sql) return importIntoMemory(mode, records);

  const incoming = JSON.stringify(records);
  const savedAt = new Date().toISOString();
  const keepExisting = mode !== "replace";
  const overwrite = mode === "overwrite";

  // Within one transaction now() is constant, so the "updated_at = now()" checks below
  // tell the later statements whether the admin-state update (and its cap check) went through.
  const [updated] = await sql.transaction([
    sql`
      with incoming as (
        select t.rec, t.ord
        from jsonb_array_elements(${incoming}::jsonb) with ordinality as t(rec, ord)
      ),
      current_state as (
        select case
          when ${keepExisting} and jsonb_typeof(payload->'progressRecords') = 'array' then payload->'progressRecords'
          else '[]'::jsonb
        end as records
        from collaburo_app_config
        where key = ${APP_STATE_KEY}
      ),
      kept as (
        select coalesce(case when ${overwrite} then i.rec end, e.elem) as rec, e.ord
        from current_state c
        cross join lateral jsonb_array_elements(c.records) with ordinality as e(elem, ord)
        left join lateral (select rec from incoming where rec->>'id' = e.elem->>'id' limit 1) i on true
      ),
      fresh as (
        select i.rec, i.ord
        from incoming i, current_state c
        where not exists (select 1 from jsonb_array_elements(c.records) e where e->>'id' = i.rec->>'id')
      ),
      next_state as (
        select coalesce((select jsonb_agg(rec order by ord) from kept), '[]'::jsonb)
          || coalesce((select jsonb_agg(rec order by ord) from fresh), '[]'::jsonb) as records
      )
      update collaburo_app_config c
      set payload = jsonb_set(c.payload, '{progressRecords}', (select records from next_state), true)
            || jsonb_build_object('savedAt', ${savedAt}::text),
          updated_at = now()
      where c.key = ${APP_STATE_KEY}
        and jsonb_array_length((select records from next_state)) <= ${MAX_PROGRESS_RECORDS}
      returning c.updated_at, (select count(*) from fresh)::int as added
    `,
    sql`
      delete from collaburo_submissions
      where ${mode === "replace"} and exists (select 1 from collaburo_app_config where key = ${APP_STATE_KEY} and updated_at = now())
    `,
    sql`
      update collaburo_submissions s
      set client_name = coalesce(nullif(t.rec->'client'->>'name', ''), 'New Client'),
          client_email = coalesce(t.rec->'client'->>'email', ''),
          event_space = coalesce(t.rec->'request'->>'space', ''),
          status = coalesce(t.rec->'progress'->>'status', 'In Discussion'),
          total = coalesce((t.rec->'costs'->>'totalWithDeposit')::numeric, 0),
          payload = t.rec
      from jsonb_array_elements(${incoming}::jsonb) as t(rec)
      where ${overwrite} and exists (select 1 from collaburo_app_config where key = ${APP_STATE_KEY} and updated_at = now()) and s.payload->>'id' = t.rec->>'id'
    `,
    sql`
      insert into collaburo_submissions (client_name, client_email, event_space, status, total, payload, fingerprint, created_at)
      select
        coalesce(nullif(t.rec->'client'->>'name', ''), 'New Client'),
        coalesce(t.rec->'client'->>'email', ''),
        coalesce(t.rec->'request'->>'space', ''),
        coalesce(t.rec->'progress'->>'status', 'In Discussion'),
        coalesce((t.rec->'costs'->>'totalWithDeposit')::numeric, 0),
        t.rec,
        null,
        coalesce(nullif(t.rec->>'submittedAt', '')::timestamp, now())
      from jsonb_array_elements(${incoming}::jsonb) as t(rec)
      where exists (select 1 from collaburo_app_config where key = ${APP_STATE_KEY} and updated_at = now())
        and not exists (select 1 from collaburo_submissions s where s.payload->>'id' = t.rec->>'id')
    `,
  ]);

  if (!updated.length) {
    const rows = await sql`
      select case when jsonb_typeof(payload->'progressRecords') = 'array' then jsonb_array_length(payload->'progressRecords') else 0 end as count
      from collaburo_app_config
      where key = ${APP_STATE_KEY}
    `;
    const message = rows.length ? capError((keepExisting ? Number(rows[0].count) : 0) + records.length) : NO_STATE_ERROR;
    return NextResponse.json({ ok: false, error: message }, { status: 409 });
  }

  const added = updated[0].added;
  return NextResponse.json({
    ok: true,
    mode,
    added,
    overwritten: overwrite ? records.length - added : 0,
    skipped: mode === "skip" ? records.length - added : 0,
    updatedAt: updated[0].updated_at,
    source: "database",
  });
}
