import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const APP_STATE_KEY = "default";
let memoryState = null;

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
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

async function loadState(sql) {
  if (!sql) return memoryState && typeof memoryState === "object" ? memoryState : {};
  const rows = await sql`
    select payload
    from collaburo_app_config
    where key = ${APP_STATE_KEY}
    limit 1
  `;
  return rows[0]?.payload && typeof rows[0].payload === "object" ? rows[0].payload : {};
}

async function saveState(sql, nextState) {
  const savedAt = new Date().toISOString();
  const payload = { ...nextState, savedAt };
  if (!sql) {
    memoryState = payload;
    return payload;
  }
  await sql`
    insert into collaburo_app_config (key, payload, updated_at)
    values (${APP_STATE_KEY}, ${JSON.stringify(payload)}, now())
    on conflict (key)
    do update set payload = excluded.payload, updated_at = now()
  `;
  return payload;
}

function emailList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function sendSignedContractEmails({ record, siteSettings, agreementFile }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: false, reason: "Resend is not configured." };

  const templates = siteSettings?.emailSettings?.templates || {};
  const signTemplate = templates["sign-form"] || {};
  const from = String(signTemplate.from || siteSettings?.emailSettings?.replyTo || "").trim();
  const clientEmail = String(record?.client?.email || "").trim();
  const replyTo = String(siteSettings?.emailSettings?.replyTo || "").trim();
  if (!from || !clientEmail) return { sent: false, reason: "Missing from/to address." };

  const clientName = record?.client?.name || "Client";
  const bookingCode = record?.bookingCode || record?.id || "";
  const fileUrl = typeof agreementFile === "string" ? agreementFile : (agreementFile?.url || "");
  const body = [
    `Hello ${clientName},`,
    "",
    `Your signed contract for booking ${bookingCode} has been received.`,
    fileUrl ? `Download your signed copy: ${fileUrl}` : "A signed copy is on file with the venue.",
    "",
    "Regards,",
    "Collaburo",
  ].join("\n");

  const adminBody = [
    `Hello Admin,`,
    "",
    `${clientName} (booking ${bookingCode}) has signed the agreement form.`,
    fileUrl ? `Signed copy: ${fileUrl}` : "",
    "",
    "Regards,",
    "Collaburo Machine",
  ].join("\n");

  const sendOne = async (to, subject, text) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: emailList(to),
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
        html: text.split("\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join(""),
        tags: [{ name: "collaburo_type", value: "contract-signed" }],
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || data.error || "Resend rejected the email.");
    }
  };

  await sendOne(clientEmail, `${clientName} — signed contract received`, body);
  const adminTo = replyTo || from;
  if (adminTo && adminTo.toLowerCase() !== clientEmail.toLowerCase()) {
    await sendOne(adminTo, `${clientName} signed the agreement form`, adminBody);
  }
  return { sent: true };
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Missing contract sign payload." }, { status: 400 });
  }

  const recordId = String(body.recordId || "").trim();
  const signatures = body.signatures && typeof body.signatures === "object" ? body.signatures : {};
  const agreementFile = body.agreementFile || null;
  const signedHtml = typeof body.signedHtml === "string" ? body.signedHtml : "";

  if (!recordId) {
    return NextResponse.json({ ok: false, error: "Missing booking record id." }, { status: 400 });
  }
  if (!Object.keys(signatures).length) {
    return NextResponse.json({ ok: false, error: "Signatures are required." }, { status: 400 });
  }

  const sql = database();
  const state = await loadState(sql);
  const progressRecords = Array.isArray(state.progressRecords) ? state.progressRecords : [];
  const existingFromState = progressRecords.find((item) => recordMatchesBookingId(item, recordId));
  const baseRecord = body.baseRecord && typeof body.baseRecord === "object" ? body.baseRecord : null;
  const existing = existingFromState || (baseRecord && recordMatchesBookingId(baseRecord, recordId) ? baseRecord : null);
  if (!existing) {
    return NextResponse.json({ ok: false, error: "Booking record not found." }, { status: 404 });
  }
  if (existing.progress?.accessibleByRecordLink === false) {
    return NextResponse.json({ ok: false, error: "This contract link is not available." }, { status: 403 });
  }
  if (existing.progress?.agreement === "Signed") {
    return NextResponse.json({ ok: false, error: "This contract has already been signed." }, { status: 409 });
  }
  const contractStatus = existing.progress?.contract || "Not Generated";
  if (contractStatus !== "Generated" && contractStatus !== "Sent") {
    return NextResponse.json({ ok: false, error: "Contract has not been generated yet." }, { status: 403 });
  }

  const signedAt = new Date().toISOString();
  const nextRecord = {
    ...existing,
    progress: {
      ...(existing.progress || {}),
      agreement: "Signed",
      signed: true,
      agreementFile: agreementFile || existing.progress?.agreementFile || null,
      contract: "Sent",
      contractSignatures: signatures,
      contractSignedAt: signedAt,
      contractSignedHtml: signedHtml || existing.progress?.contractSignedHtml || "",
      lastActivityAt: signedAt,
    },
    log: [
      { label: existing.client?.name || "Client", at: new Date(signedAt).toLocaleString(), action: "Signed contract" },
      ...((existing.log || []).slice(0, 199)),
    ],
  };

  const nextRecords = progressRecords.map((item) => (recordMatchesBookingId(item, existing.id) ? nextRecord : item));
  if (!nextRecords.some((item) => recordMatchesBookingId(item, existing.id))) {
    nextRecords.unshift(nextRecord);
  }
  await saveState(sql, { ...state, progressRecords: nextRecords.slice(0, 500) });

  let emailResult = { sent: false };
  try {
    emailResult = await sendSignedContractEmails({
      record: nextRecord,
      siteSettings: state.siteSettings || state.liveState?.siteSettings || {},
      agreementFile: nextRecord.progress.agreementFile,
    });
  } catch (error) {
    emailResult = { sent: false, reason: error.message || "Email failed." };
  }

  return NextResponse.json({
    ok: true,
    record: nextRecord,
    email: emailResult,
    source: sql ? "database" : "memory",
  });
}
