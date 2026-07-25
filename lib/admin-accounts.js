import { neon } from "@neondatabase/serverless";
import { adminCredentials, safeEqual } from "./admin-auth";

const ACCOUNTS_KEY = "admin_accounts";
const encoder = new TextEncoder();
let memoryAccountsState = null;

function database() {
  return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
}

function hex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(byteLength = 16) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function passwordDigest(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(`collaburo-admin-password:${salt}`),
      iterations: 210000,
    },
    key,
    256
  );
  return hex(bits);
}

export async function hashAdminPassword(password) {
  const salt = randomHex();
  return {
    passwordSalt: salt,
    passwordHash: await passwordDigest(password, salt),
  };
}

export async function verifyStoredPassword(account, password) {
  if (!account?.passwordHash || !account?.passwordSalt) return false;
  return safeEqual(await passwordDigest(password, account.passwordSalt), account.passwordHash);
}

function envAdminAccount() {
  const { username } = adminCredentials();
  return {
    id: "env-admin",
    username,
    displayName: "Elena Marquez",
    title: "Venue Manager",
    email: "",
    phone: "",
    notes: "Server-managed bootstrap admin",
    role: "Owner",
    active: true,
    bootstrap: true,
  };
}

function normalizeAccount(account = {}, index = 0) {
  const username = String(account.username || "").trim();
  const displayName = String(account.displayName || account.name || username || `Admin ${index + 1}`).trim();
  return {
    id: String(account.id || `admin_${Date.now()}_${index}`),
    username,
    displayName,
    title: String(account.title || account.role || "Admin").trim(),
    email: String(account.email || "").trim(),
    phone: String(account.phone || "").trim(),
    notes: String(account.notes || "").trim(),
    role: String(account.role || "Admin").trim(),
    active: account.active !== false,
    bootstrap: !!account.bootstrap,
    passwordHash: account.passwordHash || "",
    passwordSalt: account.passwordSalt || "",
    createdAt: account.createdAt || new Date().toISOString(),
    updatedAt: account.updatedAt || account.createdAt || new Date().toISOString(),
  };
}

export function publicAccount(account = {}) {
  const { passwordHash, passwordSalt, ...safe } = account;
  return safe;
}

function normalizeState(state) {
  const accounts = Array.isArray(state?.accounts) ? state.accounts.map(normalizeAccount).filter((account) => account.username) : [];
  const baseEnv = envAdminAccount();
  const storedEnv = accounts.find((account) => account.username === baseEnv.username);
  const env = storedEnv ? {
    ...baseEnv,
    displayName: storedEnv.displayName || baseEnv.displayName,
    title: storedEnv.title || baseEnv.title,
    email: storedEnv.email || "",
    phone: storedEnv.phone || "",
    notes: storedEnv.notes || baseEnv.notes,
    role: storedEnv.role || baseEnv.role,
    updatedAt: storedEnv.updatedAt,
  } : baseEnv;
  const merged = [env, ...accounts.filter((account) => account.username !== env.username)];
  return { version: 1, accounts: merged };
}

export async function loadAdminAccountsState() {
  const sql = database();
  if (!sql) return normalizeState(memoryAccountsState);
  const rows = await sql`
    select payload
    from collaburo_app_config
    where key = ${ACCOUNTS_KEY}
    limit 1
  `;
  return normalizeState(rows[0]?.payload || null);
}

async function saveAdminAccountsState(state) {
  const normalized = normalizeState(state);
  const env = envAdminAccount();
  const envProfile = normalized.accounts.find((account) => account.username === env.username);
  const persisted = {
    version: 1,
    accounts: [
      ...(envProfile ? [{
        id: "env-admin-profile",
        username: env.username,
        displayName: envProfile.displayName,
        title: envProfile.title,
        email: envProfile.email,
        phone: envProfile.phone,
        notes: envProfile.notes,
        role: envProfile.role,
        active: true,
        bootstrap: true,
        updatedAt: envProfile.updatedAt,
      }] : []),
      ...normalized.accounts.filter((account) => !account.bootstrap),
    ],
  };
  const sql = database();
  if (!sql) {
    memoryAccountsState = persisted;
    return normalizeState(memoryAccountsState);
  }
  await sql`
    insert into collaburo_app_config (key, payload, updated_at)
    values (${ACCOUNTS_KEY}, ${JSON.stringify(persisted)}, now())
    on conflict (key)
    do update set payload = excluded.payload, updated_at = now()
  `;
  return normalizeState(persisted);
}

export async function listPublicAdminAccounts() {
  const state = await loadAdminAccountsState();
  return state.accounts.map(publicAccount);
}

export async function findLoginAccount(usernameInput, passwordInput) {
  const { username, password } = adminCredentials();
  if (password && await safeEqual(String(usernameInput || ""), username) && await safeEqual(String(passwordInput || ""), password)) {
    return envAdminAccount();
  }

  const state = await loadAdminAccountsState();
  const account = state.accounts.find((item) => item.active && !item.bootstrap && item.username === String(usernameInput || "").trim());
  if (account && await verifyStoredPassword(account, passwordInput || "")) return publicAccount(account);
  return null;
}

export async function createAdminAccount(input = {}) {
  const username = String(input.username || "").trim();
  const password = String(input.password || "");
  if (!username) throw new Error("Username is required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const state = await loadAdminAccountsState();
  if (state.accounts.some((account) => account.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("An admin with that username already exists.");
  }
  const passwordFields = await hashAdminPassword(password);
  const account = normalizeAccount({
    ...input,
    ...passwordFields,
    id: `admin_${Date.now()}_${randomHex(4)}`,
    username,
    bootstrap: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const next = await saveAdminAccountsState({ accounts: [...state.accounts, account] });
  return publicAccount(next.accounts.find((item) => item.id === account.id));
}

export async function updateAdminAccount(id, input = {}) {
  const state = await loadAdminAccountsState();
  const existing = state.accounts.find((account) => account.id === id);
  if (!existing) throw new Error("Admin account not found.");

  const username = existing.bootstrap ? existing.username : String(input.username ?? existing.username).trim();
  if (!username) throw new Error("Username is required.");
  if (state.accounts.some((account) => account.id !== id && account.username.toLowerCase() === username.toLowerCase())) {
    throw new Error("An admin with that username already exists.");
  }

  const password = String(input.password || "");
  const passwordFields = password && !existing.bootstrap ? await hashAdminPassword(password) : {};
  const updated = normalizeAccount({
    ...existing,
    ...input,
    ...passwordFields,
    username,
    active: existing.bootstrap ? true : input.active,
    bootstrap: existing.bootstrap,
    updatedAt: new Date().toISOString(),
  });
  const next = await saveAdminAccountsState({ accounts: state.accounts.map((account) => account.id === id ? updated : account) });
  return publicAccount(next.accounts.find((item) => item.id === id));
}

export async function deleteAdminAccount(id) {
  const state = await loadAdminAccountsState();
  const existing = state.accounts.find((account) => account.id === id);
  if (!existing) throw new Error("Admin account not found.");
  if (existing.bootstrap) throw new Error("The server-managed bootstrap admin cannot be deleted.");
  await saveAdminAccountsState({ accounts: state.accounts.filter((account) => account.id !== id) });
  return true;
}
