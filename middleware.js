import { NextResponse } from "next/server";
import {
  adminSession,
  adminCredentials,
  adminDevBypass,
  hasValidSession,
  isBasicAuthorized,
} from "./lib/admin-auth";

function unauthorizedApi() {
  // No www-authenticate header: avoids the browser Basic-auth popup on fetch().
  return NextResponse.json({ ok: false, error: "Admin authentication required." }, { status: 401 });
}

function adminLocked() {
  return new NextResponse("Admin is locked: ADMIN_PASSWORD is not configured on the server.", {
    status: 503,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

function redirectToLogin(request) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(url);
}

// ----- best-effort in-memory rate limiting -----
// Per-isolate fixed windows. On Cloudflare Workers this is per-PoP and resets on
// isolate recycle, so it is a speed bump, not a guarantee — real limits belong in
// Cloudflare WAF rules (see docs/LAUNCH-CHECKLIST.md).
const RATE_RULES = [
  { name: "login", limit: 12, windowMs: 5 * 60_000, match: (path, method) => path === "/api/admin-login" && method === "POST" },
  { name: "email", limit: 30, windowMs: 5 * 60_000, match: (path) => path.startsWith("/api/send-email") },
  { name: "email-verification", limit: 10, windowMs: 5 * 60_000, match: (path, method) => path === "/api/email-verification" && method === "POST" },
  { name: "uploads", limit: 120, windowMs: 5 * 60_000, match: (path) => path.startsWith("/api/uploads") },
  { name: "state-read", limit: 120, windowMs: 60_000, match: (path, method) => path === "/api/admin-state" && method === "GET" },
];

const rateBuckets = new Map();

function clientIp(request) {
  return (
    request.headers.get("cf-connecting-ip") ||
    (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

function rateLimitResponse(pathname, method, ip) {
  const rule = RATE_RULES.find((candidate) => candidate.match(pathname, method));
  if (!rule) return null;

  const now = Date.now();
  if (rateBuckets.size > 5000) rateBuckets.clear();

  const bucketKey = `${rule.name}:${ip}`;
  const bucket = rateBuckets.get(bucketKey);
  if (!bucket || now - bucket.windowStart >= rule.windowMs) {
    rateBuckets.set(bucketKey, { windowStart: now, count: 1 });
    return null;
  }
  bucket.count += 1;
  if (bucket.count <= rule.limit) return null;

  const retryAfterSeconds = Math.max(1, Math.ceil((bucket.windowStart + rule.windowMs - now) / 1000));
  return NextResponse.json(
    { ok: false, error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "retry-after": String(retryAfterSeconds) } }
  );
}

function isPublicApi(pathname, method) {
  if (pathname === "/api/admin-login" && method === "POST") return true;
  if (pathname === "/api/admin-logout" && method === "POST") return true;
  // The public booking flow needs the (sanitized) app config and submits requests.
  if (pathname === "/api/admin-state" && method === "GET") return true;
  if (pathname === "/api/submissions" && method === "POST") return true;
  if (pathname === "/api/email-verification" && method === "POST") return true;
  if (pathname === "/api/uploads/images" && method === "POST") return true;
  return false;
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const method = request.method;
  const { username, password } = adminCredentials();
  // Plain `next dev` has no .dev.vars; keep local development usable while
  // failing closed everywhere else.
  const devBypass = adminDevBypass(password);

  if (pathname.startsWith("/admin")) {
    if (devBypass) return NextResponse.next();
    if (!password) return adminLocked();
    if (!(await hasValidSession(request, username, password))) return redirectToLogin(request);
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    const limited = rateLimitResponse(pathname, method, clientIp(request));
    if (limited) return limited;

    let isAdmin = devBypass;
    if (!isAdmin && password) {
      isAdmin =
        (await isBasicAuthorized(request, username, password)) ||
        (await hasValidSession(request, username, password));
    }

    // Default-deny: every API endpoint not explicitly public requires admin.
    if (!isPublicApi(pathname, method) && !isAdmin) return unauthorizedApi();

    // Forward a trusted admin flag to route handlers; never trust the client's copy.
    const headers = new Headers(request.headers);
    headers.delete("x-collaburo-admin");
    headers.delete("x-collaburo-admin-user");
    if (isAdmin) {
      headers.set("x-collaburo-admin", "1");
      const session = await adminSession(request, username, password);
      if (session?.username) headers.set("x-collaburo-admin-user", session.username);
    }
    return NextResponse.next({ request: { headers } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
