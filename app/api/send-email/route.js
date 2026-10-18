import { NextResponse } from "next/server";
import {
  clientIpFromRequest,
  createRequestId,
  logOpsEvent,
  recordAuditEvent,
} from "@/lib/audit-log";

function textToHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function emailList(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request) {
  const requestId = createRequestId();
  const actorId = request.headers.get("x-collaburo-admin-user") || "admin";
  const ip = clientIpFromRequest(request);
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Missing email payload." }, { status: 400 });
  }

  const from = String(body.from || "").trim();
  const to = emailList(body.to);
  const cc = emailList(body.cc);
  const subject = String(body.subject || "").trim();
  const text = String(body.text || "").trim();
  const emailType = String(body.type || "progress");
  const bookingId = String(body.recordId || body.bookingId || "").trim();

  if (!from || !to.length || !subject || !text) {
    return NextResponse.json({ ok: false, error: "From, To, Subject, and Email Content are required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await recordAuditEvent({
      actorType: "admin",
      actorId,
      action: "email.sent",
      resourceType: "email",
      resourceId: bookingId,
      outcome: "failure",
      requestId,
      ip,
      summary: "Email send failed: Resend not configured",
      metadata: { subject, type: emailType },
    });
    logOpsEvent({
      level: "error",
      requestId,
      route: "/api/send-email",
      action: "email.sent",
      actorId,
      message: "RESEND_API_KEY missing",
    });
    return NextResponse.json({ ok: false, error: "Resend is not configured. Add RESEND_API_KEY to the environment." }, { status: 501 });
  }

  const attachments = Array.isArray(body.attachments)
    ? body.attachments
        .filter((item) => item && (item.content || item.path))
        .slice(0, 5)
        .map((item) => ({
          filename: String(item.filename || "attachment").slice(0, 180),
          ...(item.content ? { content: String(item.content) } : {}),
          ...(item.path ? { path: String(item.path) } : {}),
          ...(item.contentType ? { content_type: String(item.contentType) } : {}),
        }))
    : [];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      ...(cc.length ? { cc } : {}),
      ...(body.replyTo ? { reply_to: String(body.replyTo).trim() } : {}),
      subject,
      text,
      html: textToHtml(text),
      ...(attachments.length ? { attachments } : {}),
      tags: [{ name: "collaburo_type", value: emailType }],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || data.error || "Resend rejected the email.";
    await recordAuditEvent({
      actorType: "admin",
      actorId,
      action: "email.sent",
      resourceType: "email",
      resourceId: bookingId,
      outcome: "failure",
      requestId,
      ip,
      summary: "Email send failed",
      metadata: { subject, type: emailType },
    });
    logOpsEvent({
      level: "error",
      requestId,
      route: "/api/send-email",
      action: "email.sent",
      actorId,
      message: String(message),
    });
    return NextResponse.json({ ok: false, error: message }, { status: response.status });
  }

  await recordAuditEvent({
    actorType: "admin",
    actorId,
    action: "email.sent",
    resourceType: "email",
    resourceId: bookingId,
    outcome: "success",
    requestId,
    ip,
    summary: `Email sent: ${subject}`,
    metadata: { subject, type: emailType, toCount: to.length, emailId: data.id || null },
  });
  return NextResponse.json({ ok: true, id: data.id || null });
}
