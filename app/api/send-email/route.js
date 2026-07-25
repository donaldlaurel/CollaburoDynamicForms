import { NextResponse } from "next/server";

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
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Missing email payload." }, { status: 400 });
  }

  const from = String(body.from || "").trim();
  const to = emailList(body.to);
  const cc = emailList(body.cc);
  const subject = String(body.subject || "").trim();
  const text = String(body.text || "").trim();

  if (!from || !to.length || !subject || !text) {
    return NextResponse.json({ ok: false, error: "From, To, Subject, and Email Content are required." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "Resend is not configured. Add RESEND_API_KEY to the environment." }, { status: 501 });
  }

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
      tags: [{ name: "collaburo_type", value: String(body.type || "progress") }],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ ok: false, error: data.message || data.error || "Resend rejected the email." }, { status: response.status });
  }

  return NextResponse.json({ ok: true, id: data.id || null });
}
