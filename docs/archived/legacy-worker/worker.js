import { neon } from "@neondatabase/serverless";

const APP_STATE_KEY = "default";
const CLOUDINARY_FOLDER = "collaburo";
const ADMIN_REALM = "Collaburo Admin";

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers || {}),
    },
  });
}

function requireDatabase(env) {
  if (!env.DATABASE_URL) {
    return null;
  }
  return neon(env.DATABASE_URL);
}

function adminCredentials(env) {
  return {
    username: env.ADMIN_USERNAME || "admin",
    password: env.ADMIN_PASSWORD || "",
  };
}

function unauthorized() {
  return new Response("Admin login required.", {
    status: 401,
    headers: {
      "www-authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

function isAuthorizedAdmin(request, env) {
  const { username, password } = adminCredentials(env);
  if (!password) return true;
  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return false;
  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(":");
    if (separator === -1) return false;
    return decoded.slice(0, separator) === username && decoded.slice(separator + 1) === password;
  } catch (_) {
    return false;
  }
}

function isAdminPath(pathname) {
  return pathname === "/admin" || pathname === "/admin/" || pathname === "/Collaburo-App" || pathname === "/Collaburo-App.html" || pathname.startsWith("/Mock%20UI/") || pathname.startsWith("/Mock UI/");
}

function isPublicFormUrl(url) {
  return url.pathname === "/" || url.pathname === "/book" || url.pathname === "/book/"
    || ((url.pathname === "/Collaburo-App" || url.pathname === "/Collaburo-App.html") && url.searchParams.get("mode") === "public");
}

async function readJson(request) {
  try {
    return await request.json();
  } catch (_) {
    return null;
  }
}

async function sha1Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-1", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

async function submissionFingerprint(record) {
  const stableRecord = {
    client: record.client || {},
    request: record.request || {},
    costs: record.costs || {},
    selections: record.selections || record.answers || {},
  };
  return sha256Hex(stableStringify(stableRecord));
}

function cloudinaryConfig(env) {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    return null;
  }
  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    apiSecret: env.CLOUDINARY_API_SECRET,
  };
}

async function uploadImageToCloudinary(env, file, folder = CLOUDINARY_FOLDER) {
  const config = cloudinaryConfig(env);
  if (!config) {
    throw new Error("Cloudinary is not configured yet. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
  }
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    timestamp,
  };
  const signaturePayload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  const signature = await sha1Hex(signaturePayload + config.apiSecret);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", config.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed.");
  }
  return {
    publicId: data.public_id,
    secureUrl: data.secure_url,
    width: data.width,
    height: data.height,
    bytes: data.bytes,
    format: data.format,
  };
}

async function handleApi(request, env) {
  const url = new URL(request.url);
  const sql = requireDatabase(env);

  if (url.pathname === "/api/health") {
    return json({ ok: true, database: !!sql, cloudinary: !!cloudinaryConfig(env) });
  }

  if (url.pathname === "/api/uploads/images" && request.method === "POST") {
    const body = await readJson(request);
    const file = body?.dataUrl || body?.file;
    if (!file || typeof file !== "string" || !file.startsWith("data:image/")) {
      return json({ ok: false, error: "Missing image upload data." }, { status: 400 });
    }
    if (file.length > 8000000) {
      return json({ ok: false, error: "Image is too large. Please upload an image under 6 MB." }, { status: 413 });
    }
    const uploaded = await uploadImageToCloudinary(env, file, body?.folder || CLOUDINARY_FOLDER);
    return json({ ok: true, image: uploaded });
  }

  if (!sql) {
    return json(
      {
        ok: false,
        error: "Database is not configured yet. Add DATABASE_URL as a Cloudflare Worker secret.",
      },
      { status: 503 },
    );
  }

  if (url.pathname === "/api/admin-state" && request.method === "GET") {
    const rows = await sql`
      select payload, updated_at
      from collaburo_app_config
      where key = ${APP_STATE_KEY}
      limit 1
    `;
    return json({ ok: true, state: rows[0]?.payload || null, updatedAt: rows[0]?.updated_at || null });
  }

  if (url.pathname === "/api/admin-state" && request.method === "PUT") {
    if (!isAuthorizedAdmin(request, env)) return unauthorized();
    const body = await readJson(request);
    if (!body || typeof body !== "object") {
      return json({ ok: false, error: "Missing admin state payload." }, { status: 400 });
    }
    await sql`
      insert into collaburo_app_config (key, payload, updated_at)
      values (${APP_STATE_KEY}, ${JSON.stringify(body)}, now())
      on conflict (key)
      do update set payload = excluded.payload, updated_at = now()
    `;
    return json({ ok: true });
  }

  if (url.pathname === "/api/submissions" && request.method === "GET") {
    if (!isAuthorizedAdmin(request, env)) return unauthorized();
    const rows = await sql`
      select id, client_name, client_email, event_space, status, total, created_at, payload
      from collaburo_submissions
      order by created_at desc
      limit 250
    `;
    return json({ ok: true, submissions: rows });
  }

  if (url.pathname === "/api/submissions" && request.method === "POST") {
    const body = await readJson(request);
    const record = body?.record || body;
    if (!record || typeof record !== "object") {
      return json({ ok: false, error: "Missing submission record." }, { status: 400 });
    }
    const client = record.client || {};
    const requestInfo = record.request || {};
    const progress = record.progress || {};
    const costs = record.costs || {};
    const fingerprint = await submissionFingerprint(record);
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
        ${progress.status || "In Discussion"},
        ${Number(costs.totalWithDeposit || costs.total || 0)},
        ${JSON.stringify(record)},
        ${fingerprint}
      )
      on conflict (fingerprint) do nothing
      returning id, created_at
    `;
    if (rows.length > 0) {
      return json({ ok: true, duplicate: false, id: rows[0]?.id, createdAt: rows[0]?.created_at });
    }
    const existingRows = await sql`
      select id, created_at
      from collaburo_submissions
      where fingerprint = ${fingerprint}
      limit 1
    `;
    return json({ ok: true, duplicate: true, id: existingRows[0]?.id, createdAt: existingRows[0]?.created_at });
  }

  return json({ ok: false, error: "API route not found." }, { status: 404 });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env);
      } catch (error) {
        return json({ ok: false, error: error.message || "Unexpected API error." }, { status: 500 });
      }
    }

    if (isPublicFormUrl(url)) {
      url.pathname = "/Collaburo-App";
      url.searchParams.set("mode", "public");
      return env.ASSETS.fetch(new Request(url, request));
    }

    if (isAdminPath(url.pathname)) {
      if (!isAuthorizedAdmin(request, env)) return unauthorized();
      url.pathname = "/Collaburo-App";
      return env.ASSETS.fetch(new Request(url, request));
    }

    return env.ASSETS.fetch(request);
  },
};
