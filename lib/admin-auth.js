export const ADMIN_REALM = "Collaburo Admin";
export const SESSION_COOKIE = "collaburo_admin_session";
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
    password: process.env.ADMIN_PASSWORD || "499Preston!",
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

export async function adminSession(request, username, password) {
  const cookie = request.cookies.get(SESSION_COOKIE)?.value || "";
  if (!cookie) return null;

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

export async function verifyAdminLogin(usernameInput, passwordInput, username, password) {
  if (!password) return false;
  const [userOk, passOk] = await Promise.all([
    safeEqual(String(usernameInput || ""), username),
    safeEqual(String(passwordInput || ""), password),
  ]);
  return userOk && passOk;
}

export async function setAdminSessionCookie(response, username, password) {
  response.cookies.set(SESSION_COOKIE, await sessionToken(username, password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAdminSessionCookie(response) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
