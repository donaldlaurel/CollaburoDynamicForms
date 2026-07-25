import { NextResponse } from "next/server";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const SESSION_TTL_MS = 180 * 24 * 60 * 60 * 1000;

function base64UrlEncode(value) {
  const bytes = value instanceof Uint8Array ? value : new TextEncoder().encode(String(value));
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
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

function emailLooksValid(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function emailVerificationTestMode() {
  return process.env.EMAIL_VERIFICATION_TEST_MODE === "true";
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
  if (!secret) throw new Error("Email verification is not configured. Add EMAIL_VERIFICATION_SECRET or ADMIN_PASSWORD.");
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

async function createToken(email, ttlMs = TOKEN_TTL_MS, purpose = "verify") {
  const payload = base64UrlEncode(JSON.stringify({
    email: String(email || "").trim().toLowerCase(),
    purpose,
    exp: Date.now() + ttlMs,
  }));
  return `${payload}.${await signPayload(payload)}`;
}

async function verifyToken(token, expectedPurpose = "verify") {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature) throw new Error("Invalid verification link.");
  const expected = await signPayload(payload);
  if (!timingSafeEqual(base64UrlDecode(signature), base64UrlDecode(expected))) {
    throw new Error("Invalid verification link.");
  }
  const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  if (!data?.email || !data?.exp || Date.now() > Number(data.exp)) {
    throw new Error("This verification link has expired.");
  }
  if ((data.purpose || "verify") !== expectedPurpose) {
    throw new Error("Invalid verification link.");
  }
  return { email: data.email, verifiedAt: new Date().toISOString() };
}

function textToHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function senderSetupError(from = "") {
  const domain = String(from || "").split("@").pop()?.replace(/[>\s]/g, "") || "";
  return [
    "Verification email is not fully configured.",
    domain
      ? `The sender address is using ${domain}. Resend requires Collaburo to verify one sending domain, such as collaburo.com. Visitor email domains do not need verification.`
      : "Set EMAIL_VERIFICATION_FROM to an address on Collaburo's verified sending domain, such as bookings@collaburo.com.",
  ].join(" ");
}

function resendSenderError(message = "", from = "") {
  const text = String(message || "");
  const domain = String(from || "").split("@").pop()?.replace(/[>\s]/g, "") || "";
  if (domain === "resend.dev" || /testing emails to your own email address/i.test(text)) {
    return "Resend test mode can only send verification emails to the email address on your Resend account, or to Resend test addresses like delivered@resend.dev. To send to Gmail/Yahoo/client emails, verify one real sending domain in Resend and update EMAIL_VERIFICATION_FROM.";
  }
  if (/domain is not verified|verify your domain|resend\.com\/domains/i.test(text)) {
    return senderSetupError(from);
  }
  return text || "Resend rejected the verification email.";
}

async function sendVerificationEmail(email, link) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "Resend is not configured. Add RESEND_API_KEY to the environment.", status: 501 };
  }

  const from = String(process.env.EMAIL_VERIFICATION_FROM || process.env.RESEND_FROM_EMAIL || "").trim();
  if (!from) {
    return { ok: false, error: senderSetupError(), status: 501 };
  }
  const subject = "Verify your email to view Collaburo pricing";
  const text = [
    "Hello,",
    "Please verify your email address to continue viewing pricing and estimated costs in the Collaburo booking form.",
    link,
    "This link expires in 24 hours.",
  ].join("\n\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      text,
      html: textToHtml(text),
      tags: [{ name: "collaburo_type", value: "email_verification" }],
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: resendSenderError(data.message || data.error, from), status: response.status };
  }
  return { ok: true, id: data.id || null };
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const action = String(body?.action || "send");

  if (action === "verify") {
    try {
      const result = await verifyToken(body?.token || "");
      const sessionToken = await createToken(result.email, SESSION_TTL_MS, "email-session");
      return NextResponse.json({ ok: true, ...result, sessionToken });
    } catch (error) {
      return NextResponse.json({ ok: false, error: error.message || "Invalid verification link." }, { status: 400 });
    }
  }

  const email = String(body?.email || "").trim().toLowerCase();
  if (!emailLooksValid(email)) {
    return NextResponse.json({ ok: false, error: "Enter a valid email address first." }, { status: 400 });
  }

  try {
    if (emailVerificationTestMode()) {
      return NextResponse.json({
        ok: true,
        email,
        verifiedAt: new Date().toISOString(),
        sessionToken: await createToken(email, SESSION_TTL_MS, "email-session"),
        testMode: true,
      });
    }
    const token = await createToken(email);
    const origin = new URL(request.url).origin;
    const link = `${origin}/book?verify_email=${encodeURIComponent(token)}`;
    const sent = await sendVerificationEmail(email, link);
    if (!sent.ok) {
      return NextResponse.json({ ok: false, error: sent.error }, { status: sent.status || 500 });
    }
    return NextResponse.json({ ok: true, email, id: sent.id || null });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message || "Could not send verification email." }, { status: 500 });
  }
}
