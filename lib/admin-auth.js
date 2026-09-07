export const ADMIN_REALM = "Collaburo Admin";
export const SESSION_COOKIE = "collaburo_admin_session";
// Companion cookie carrying the same token with `SameSite=None; Secure`, so the
// session survives when the app is rendered inside a cross-site iframe (v0/
// Codespaces previews, tunnels, embeds). A `SameSite=Lax` cookie is never sent
// on those third-party requests, which logs the admin straight back out.
export const EMBEDDED_SESSION_COOKIE = "collaburo_admin_session_embedded";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function hex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(text) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

// Hash both values first so equality checks never compare secret prefixes.
export async function safeEqual(a, b) {
  const [hashA, hashB] = await Promise.all([sha256Hex(`cmp:${a}`), sha256Hex(`cmp:${b}`)]);
  return hashA === hashB;
}

export function adminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || "admin",
    // Must fail closed. A hardcoded fallback here is a backdoor: any runtime that
    // cannot see ADMIN_PASSWORD (notably Edge middleware, which only receives
    // env vars configured on the hosting platform — never a .env file) would
    // silently accept the fallback while the Node route signed sessions with the
    // real secret, producing an endless login redirect *and* an open admin login.
    password: process.env.ADMIN_PASSWORD || "",
  };
}

export function adminDevBypass(password) {
  return !password && process.env.NODE_ENV === "development";
}

export async function sessionToken(username, password) {
  const payloadJson = JSON.stringify({
    v: 2,
    user: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });
  const payload = base64UrlEncode(encoder.encode(payloadJson));
  const signature = await hmacHex(password, `collaburo-admin-session-v2.${payload}`);
  return `${payload}.${signature}`;
}

async function legacySessionToken(username, password) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(`${username}:${password}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode("collaburo-admin-session-v1")));
}

async function hmacHex(secret, text) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
}

function base64UrlEncode(bytes) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(text) {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(text.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export async function isBasicAuthorized(request, username, password) {
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return false;
  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    if (separator === -1) return false;
    const [userOk, passOk] = await Promise.all([
      safeEqual(decoded.slice(0, separator), username),
      safeEqual(decoded.slice(separator + 1), password),
    ]);
    return userOk && passOk;
  } catch {
    return false;
  }
}

export async function hasValidSession(request, username, password) {
  return !!(await adminSession(request, username, password));
}

async function verifySessionCookie(cookie, username, password) {
  const [payload, signature] = cookie.split(".");
  if (payload && signature) {
    const expected = await hmacHex(password, `collaburo-admin-session-v2.${payload}`);
    if (!(await safeEqual(signature, expected))) return null;
    try {
      const data = JSON.parse(decoder.decode(base64UrlDecode(payload)));
      if (data?.v !== 2 || !data.user || !data.exp) return null;
      if (Date.now() / 1000 > Number(data.exp)) return null;
      return { username: String(data.user) };
    } catch {
      return null;
    }
  }

  if (await safeEqual(cookie, await legacySessionToken(username, password))) {
    return { username };
  }
  return null;
}

export async function adminSession(request, username, password) {
  // Either cookie is acceptable: whichever one the browser was willing to send
  // for this context carries the identical signed token.
  for (const name of [SESSION_COOKIE, EMBEDDED_SESSION_COOKIE]) {
    const cookie = request.cookies.get(name)?.value || "";
    if (!cookie) continue;
    const session = await verifySessionCookie(cookie, username, password);
    if (session) return session;
  }
  return null;
}

export async function verifyAdminLogin(usernameInput, passwordInput, username, password) {
  if (!password) return false;
  const [userOk, passOk] = await Promise.all([
    safeEqual(String(usernameInput || ""), username),
    safeEqual(String(passwordInput || ""), password),
  ]);
  return userOk && passOk;
}

// Whether to also issue the cross-site (`SameSite=None`) companion cookie.
// Defaults to on outside production because dev/preview hosts embed the app in a
// third-party iframe. In production it stays off so the admin cookie is not
// attached to cross-site requests (CSRF hardening) — set
// ADMIN_ALLOW_EMBEDDED_SESSION="true" if the deployed admin must be embeddable.
export function allowEmbeddedSession() {
  const flag = String(process.env.ADMIN_ALLOW_EMBEDDED_SESSION || "").trim().toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return process.env.NODE_ENV !== "production";
}

function sessionCookieOptions(name) {
  const embedded = name === EMBEDDED_SESSION_COOKIE;
  return {
    httpOnly: true,
    // `SameSite=None` is only honoured on Secure cookies. Browsers drop this
    // companion cookie on insecure origins, leaving the Lax cookie to work as
    // before on plain-HTTP local dev.
    secure: embedded ? true : process.env.NODE_ENV === "production",
    sameSite: embedded ? "none" : "lax",
    path: "/",
  };
}

export async function setAdminSessionCookie(response, username, password) {
  const token = await sessionToken(username, password);
  const names = allowEmbeddedSession() ? [SESSION_COOKIE, EMBEDDED_SESSION_COOKIE] : [SESSION_COOKIE];
  for (const name of names) {
    response.cookies.set(name, token, {
      ...sessionCookieOptions(name),
      maxAge: SESSION_MAX_AGE_SECONDS,
    });
  }
}

export function clearAdminSessionCookie(response) {
  // Always clear both names so a stale companion cookie can never revive a
  // session after logout.
  for (const name of [SESSION_COOKIE, EMBEDDED_SESSION_COOKIE]) {
    response.cookies.set(name, "", { ...sessionCookieOptions(name), maxAge: 0 });
  }
}
