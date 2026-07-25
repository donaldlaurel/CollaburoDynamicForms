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

export async function POST(request) {
  const body = await request.json().catch(() => null);
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
    "text/plain", "text/csv",
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
