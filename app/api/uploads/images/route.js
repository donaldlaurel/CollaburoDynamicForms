import { NextResponse } from "next/server";

function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

async function sha1Hex(text) {
  const digest = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const MAX_REMOTE_URLS_PER_REQUEST = 20;
const REMOTE_IMAGE_FOLDER = "collaburo/imported";

function remoteImageUrl(value) {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (/(^|\.)cloudinary\.com$/i.test(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

// Same source URL always maps to the same public_id, so repeat copies reuse the existing asset.
async function copyRemoteImage(config, url) {
  const baseName = decodeURIComponent(url.pathname.split("/").pop() || "image")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .slice(0, 60) || "image";
  const publicId = `${baseName}-${(await sha1Hex(url.href)).slice(0, 10)}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sha1Hex(
    `folder=${REMOTE_IMAGE_FOLDER}&overwrite=false&public_id=${publicId}&timestamp=${timestamp}${config.apiSecret}`
  );
  const form = new FormData();
  form.append("file", url.href);
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", REMOTE_IMAGE_FOLDER);
  form.append("public_id", publicId);
  form.append("overwrite", "false");
  form.append("signature", signature);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url) {
    throw new Error(result?.error?.message || `Cloudinary upload failed: ${response.status}`);
  }
  return result.secure_url;
}

async function copyRemoteImages(request, remoteUrls) {
  if (request.headers.get("x-collaburo-admin") !== "1") {
    return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 401 });
  }
  if (!Array.isArray(remoteUrls) || !remoteUrls.length || remoteUrls.length > MAX_REMOTE_URLS_PER_REQUEST) {
    return NextResponse.json(
      { ok: false, error: `Send between 1 and ${MAX_REMOTE_URLS_PER_REQUEST} image URLs.` },
      { status: 400 }
    );
  }
  const config = cloudinaryConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: "Cloudinary is not configured." }, { status: 503 });
  }
  const copies = {};
  const failed = {};
  await Promise.all(
    remoteUrls.map(async (value) => {
      const url = remoteImageUrl(value);
      if (!url) {
        failed[value] = "Not a copyable image URL.";
        return;
      }
      try {
        copies[value] = await copyRemoteImage(config, url);
      } catch (error) {
        failed[value] = error.message || "Copy failed.";
      }
    })
  );
  return NextResponse.json({ ok: true, copies, failed });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (body && Array.isArray(body.remoteUrls)) return copyRemoteImages(request, body.remoteUrls);
  const dataUrl = body?.dataUrl;
  const match = typeof dataUrl === "string" ? dataUrl.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=]+)$/) : null;
  if (!match) {
    return NextResponse.json({ ok: false, error: "Missing file data." }, { status: 400 });
  }
  const mimeType = String(match[1] || "").toLowerCase();
  const filename = String(body?.filename || "upload").slice(0, 180);
  const allowedMimeTypes = new Set([
    "image/jpeg", "image/png", "image/gif", "image/webp", "image/avif", "image/heic", "image/heif",
    "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain", "text/csv", "text/html",
  ]);
  if (!allowedMimeTypes.has(mimeType)) {
    return NextResponse.json({ ok: false, error: "This file type is not supported." }, { status: 415 });
  }
  const estimatedBytes = Math.floor((match[2].replace(/=+$/, "").length * 3) / 4);
  if (estimatedBytes > 10 * 1024 * 1024) {
    return NextResponse.json({ ok: false, error: "Files must be 10 MB or smaller." }, { status: 413 });
  }

  const config = cloudinaryConfig();
  if (!config) {
    return NextResponse.json({ ok: false, error: "Cloudinary is not configured." }, { status: 503 });
  }

  const folder = typeof body?.folder === "string" && body.folder ? body.folder : "collaburo";
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = await sha1Hex(`folder=${folder}&timestamp=${timestamp}${config.apiSecret}`);

  const form = new FormData();
  form.append("file", dataUrl);
  form.append("api_key", config.apiKey);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.secure_url) {
    return NextResponse.json(
      { ok: false, error: result?.error?.message || `Cloudinary upload failed: ${response.status}` },
      { status: 502 }
    );
  }

  const file = {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    originalFilename: filename,
    resourceType: result.resource_type,
    format: result.format || mimeType,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
  };
  return NextResponse.json({
    ok: true,
    file,
    image: file,
  });
}
