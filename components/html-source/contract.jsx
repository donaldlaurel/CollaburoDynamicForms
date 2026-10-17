"use client";

import React from "react";
import { createLegacyContractSettings } from "./contract-legacy-default";
import { createLegacyBusinessContractSettings } from "./contract-legacy-business-default";

const CONTRACT_BLOCK_TYPES = [
  { id: "header", label: "Header" },
  { id: "paragraph", label: "Paragraph" },
  { id: "image", label: "Image" },
  { id: "signature", label: "Signature" },
];

export const DEFAULT_BUSINESS_EVENT_TYPES = [
  "Business / Board Meeting",
  "Conference",
  "Workshop / Training",
  "Other - Business and non-alcoholic events",
];

export const DEFAULT_SOCIAL_EVENT_TYPES = [
  "Lecture / Theater / Movie",
  "Social Event with dancing / Party",
  "Social Event without dancing / Banquet",
  "Reception / Cocktail Party",
  "Wedding & Reception",
  "Ceremony / Graduation",
  "Memorial / End of Life Celebration",
  "Festival / Market / Show",
  "Other - Social and/or alcoholic events",
];

function contractUid(prefix = "blk") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeContractTemplate(template = {}, fallback = null) {
  const sample = fallback || createLegacyContractSettings();
  const source = template && typeof template === "object" ? template : {};
  const blocks = Array.isArray(source.blocks) && source.blocks.length
    ? source.blocks.map((block) => normalizeContractBlock(block))
    : (sample.blocks || []).map((block) => normalizeContractBlock(block));
  return {
    title: String(source.title || sample.title || "Contract"),
    blocks,
  };
}

function isLegacyPlaceholderTemplate(template = {}) {
  const blocks = Array.isArray(template.blocks) ? template.blocks : [];
  if (!blocks.length) return true;
  const ids = new Set(blocks.map((block) => block.id));
  if (ids.has("blk_agreement")) return false;
  if (!ids.has("blk_rental")) return false;
  const rental = blocks.find((block) => block.id === "blk_rental");
  return String(rental?.body || "").includes("This agreement is entered into between the venue owner");
}

function isDualContractSettings(settings = {}) {
  return !!(settings && settings.templates && (settings.templates.social || settings.templates.business));
}

function isFlatContractTemplate(settings = {}) {
  return !!(settings && Array.isArray(settings.blocks) && !settings.templates);
}

export function createDefaultContractSettings() {
  return {
    version: 3,
    activeTab: "social",
    businessEventTypes: [...DEFAULT_BUSINESS_EVENT_TYPES],
    templates: {
      social: createLegacyContractSettings(),
      business: createLegacyBusinessContractSettings(),
    },
  };
}

export function normalizeContractSettings(settings = {}) {
  const sample = createDefaultContractSettings();
  const source = settings && typeof settings === "object" ? settings : {};

  let socialSource = source.templates?.social;
  let businessSource = source.templates?.business;

  // Migrate single-template shape into dual templates.
  if (!socialSource && isFlatContractTemplate(source)) {
    socialSource = isLegacyPlaceholderTemplate(source) ? sample.templates.social : source;
  }
  if (!socialSource) socialSource = sample.templates.social;
  if (!businessSource) businessSource = sample.templates.business;

  if (isLegacyPlaceholderTemplate(socialSource)) {
    socialSource = sample.templates.social;
  }

  const businessEventTypes = Array.isArray(source.businessEventTypes) && source.businessEventTypes.length
    ? source.businessEventTypes.map((item) => String(item || "").trim()).filter(Boolean)
    : [...DEFAULT_BUSINESS_EVENT_TYPES];

  return {
    version: 3,
    activeTab: source.activeTab === "business" ? "business" : "social",
    businessEventTypes,
    templates: {
      social: normalizeContractTemplate(socialSource, sample.templates.social),
      business: normalizeContractTemplate(businessSource, sample.templates.business),
    },
  };
}

/** Accept dual site settings or a flat snapshot template and return { title, blocks }. */
export function coerceContractTemplate(settingsOrTemplate = {}, variant = "social") {
  if (isDualContractSettings(settingsOrTemplate)) {
    return getContractTemplate(settingsOrTemplate, variant);
  }
  return normalizeContractTemplate(settingsOrTemplate);
}

export function resolveContractVariant(eventType = "", settings = {}) {
  const normalized = normalizeContractSettings(settings);
  const types = normalized.businessEventTypes || DEFAULT_BUSINESS_EVENT_TYPES;
  const value = String(eventType || "").trim().toLowerCase();
  if (!value) return "social";
  const aliases = {
    "other (b)": "other - business and non-alcoholic events",
    "other - business": "other - business and non-alcoholic events",
  };
  const canonical = aliases[value] || value;
  const isBusiness = types.some((type) => {
    const t = String(type || "").trim().toLowerCase();
    return t === canonical || t === value || canonical.includes(t) || t.includes(canonical);
  });
  return isBusiness ? "business" : "social";
}

export function getContractTemplate(settings = {}, variant = "social") {
  const normalized = normalizeContractSettings(settings);
  if (isFlatContractTemplate(settings) && !settings.templates) {
    return normalizeContractTemplate(settings);
  }
  const key = variant === "business" ? "business" : "social";
  return normalizeContractTemplate(normalized.templates?.[key], createDefaultContractSettings().templates[key]);
}

export function buildContractSnapshot(settings, tokenMap = {}, generatedAt = new Date().toISOString(), eventType = "") {
  const tokens = {};
  Object.entries(tokenMap || {}).forEach(([token, value]) => {
    tokens[token] = value == null ? "" : String(value);
  });
  const eventFromToken = eventType || tokens["{{Event_Type}}"] || "";
  const variant = resolveContractVariant(eventFromToken, settings);
  const template = getContractTemplate(settings, variant);
  return {
    generatedAt,
    variant,
    settings: template,
    tokenMap: tokens,
  };
}

function normalizeContractBlock(block = {}) {
  const type = CONTRACT_BLOCK_TYPES.some((item) => item.id === block.type) ? block.type : "paragraph";
  const id = block.id || contractUid("blk");
  if (type === "header") {
    const fields = Array.isArray(block.fields) && block.fields.length
      ? block.fields.map((field) => ({
          id: field.id || contractUid("fld"),
          label: String(field.label || "Field"),
          value: String(field.value || ""),
        }))
      : [{ id: contractUid("fld"), label: "Title", value: "" }];
    return { id, type, fields };
  }
  if (type === "image") {
    return {
      id,
      type,
      label: String(block.label || "Image"),
      url: String(block.url || ""),
      alt: String(block.alt || ""),
    };
  }
  if (type === "signature") {
    const role = block.role === "owner" ? "owner" : "client";
    return {
      id,
      type,
      role,
      label: String(block.label || (role === "owner" ? "Owner Signature" : "Client Signature")),
      required: block.required !== false,
      ownerImageUrl: String(block.ownerImageUrl || ""),
      ownerName: String(block.ownerName || ""),
    };
  }
  return {
    id,
    type: "paragraph",
    title: String(block.title || ""),
    body: repairContractCenterBleed(repairContractWaiverMarkup(repairContractSection3(String(block.body || "")))),
    allowTokens: block.allowTokens !== false,
  };
}

/** Close center-aligned wrappers that incorrectly swallow following left-aligned sections (e.g. 4.2+). */
function repairContractCenterBleed(body = "") {
  let s = String(body || "");
  // Floor-plan stack: close each centered image before the next section heading.
  s = s.replace(
    /(<div[^>]*text-align\s*:\s*center[^>]*>\s*)(?:<div[^>]*text-align\s*:\s*center[^>]*>\s*)*<img\b([^>]*)>\s*(?:<div[^>]*text-align\s*:\s*center[^>]*>\s*)*(<(?:strong|b)>\s*\d+\.)/gi,
    '<div style="text-align:center"><img$2></div><br/><br/>$3'
  );
  s = s.replace(
    /(<div[^>]*text-align\s*:\s*center[^>]*>\s*<img\b[^>]*>)\s*(?:<br\s*\/?>\s*)*(<(?:strong|b)>\s*\d+\.(?:\d+)?)/gi,
    "$1</div><br/><br/>$2"
  );
  s = s.replace(
    /(<div[^>]*text-align\s*:\s*center[^>]*>\s*<img\b[^>]*>)\s*(?:<br\s*\/?>\s*)+(?=[A-Za-z0-9])/g,
    "$1</div><br/><br/>"
  );
  // Extractor duplicated section 4.3 (raw URL version + "Event Insurance Policy" link version).
  s = s.replace(
    /(<strong\b[^>]*>\s*4\.3\s*<\/strong>[\s\S]*?clarify\.\s*)(?:<br\s*\/?>\s*)*<strong\b[^>]*>\s*4\.3\s*<\/strong>[\s\S]*?clarify\.\s*/gi,
    "$1<br/><br/>"
  );
  // Fallback: if two 4.3 headings remain, drop from the second through the next 4.4/5. heading.
  s = s.replace(
    /(<strong\b[^>]*>\s*4\.3\s*<\/strong>[\s\S]*?)(<strong\b[^>]*>\s*4\.3\s*<\/strong>[\s\S]*?)(?=<strong\b[^>]*>\s*(?:4\.4|5\.)\s*)/i,
    "$1"
  );
  return s;
}

/** Close broken waiver underline markup that otherwise underlines the whole section. */
function repairContractWaiverMarkup(body = "") {
  let s = String(body || "");
  // Extractor left: <b><u><u>{{Client_Display_Name}}</u></b>  (missing </u> + often missing </div>)
  s = s.replace(
    /<b>\s*<u>\s*<u>\s*(\{\{Client_Display_Name\}\}|[^<{]{0,200}?)\s*<\/u>\s*<\/b>/gi,
    "<b><u>$1</u></b>"
  );
  // Same pattern after tokens were already filled
  s = s.replace(
    /(<div[^>]*>\s*)<b>\s*<u>\s*<u>\s*([^<]{1,200}?)\s*<\/u>\s*<\/b>(\s*<div)/gi,
    "$1<b><u>$2</u></b></div>$3"
  );
  s = s.replace(
    /<b>\s*<u>\s*<u>\s*([^<]{1,200}?)\s*<\/u>\s*<\/b>/gi,
    "<b><u>$1</u></b>"
  );
  return s;
}

/** Correct section-3 layout from collaburo.space/contract_s.php (separated option groups). */
const LEGACY_SECTION3_HTML = [
  '3. <strong>Detail of Space Rental</strong> – The Organisation will provide the Client with the facilities, equipment and/or services during the period starting <strong><u>{{Booking_Start_Date}}</u></strong> from <strong><u>{{Booking_Start_Time}}</u></strong> to <strong><u>{{Booking_End_DateTime}}</u></strong> .<br/>',
  " This will be a:<br/>",
  ' <table> <tr> <td> <div style="margin-left:50px">☐ One-time event</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Mutli-Day Event</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">{{Multi_Day_Details}}</div> </td> </tr> </table><br/>',
  " Space Rental will include the following space(s):",
  ' <table> <tr> <td> <div style="margin-left:50px">☐ Main Hall</div> </td> <td> <div style="margin-left:50px">☐ Lounge Area</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Large Room</div> </td> <td> <div style="margin-left:50px">☐ Small Room</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Elevated Area</div> </td> <td> <div style="margin-left:50px">☐ Back Patio</div> </td> </tr>',
  ' <tr> <td colspan="2"> <div style="margin-left:50px">☐ Other: __________________________________________ </div> </td> </tr> </table><br/>',
  " The Event is classed as:",
  ' <table> <tr> <td> <div style="margin-left:50px">☐ Private - Invitation list to those known to Client such as family, friends, coworkers, etc.</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Semi Private - Invitation list to those mostly known to Client.</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Public - Events that are advertised publicly, tickets sold/given in advance or at the door.</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Other: __________________________________________ </div> </td> </tr> </table><br/>',
  " Alcohol for the Event:",
  ' <table> <tr> <td> <div style="margin-left:50px">☐ No Alcohol on the premises</div> </td> </tr>',
  ' <tr> <td> <div style="margin-left:50px">☐ Guests will be served alcohol / allowed to bring their own alcohol / will pay for alcohol</div> </td> </tr> </table><br/>',
  " Add-Ons required: ",
].join("");

function repairContractSection3(body = "") {
  let s = String(body || "");
  if (!/Detail of Space Rental/i.test(s)) return s;

  const mangledTogether = /☐ One-time event/i.test(s)
    && /☐ Private -/i.test(s)
    && !/Space Rental will include the following space/i.test(s);
  const emptyFromToken = /from <strong><u><\/u><\/strong>\s*to/i.test(s)
    || /starting <strong><u>\{\{Booking_Start_datetime\}\}<\/u><\/strong> from <strong><u><\/u><\/strong>/i.test(s);

  if (mangledTogether || emptyFromToken) {
    const replaced = s.replace(
      /3\.\s*<strong>Detail of Space Rental<\/strong>[\s\S]*?Add-Ons required:\s*/i,
      LEGACY_SECTION3_HTML
    );
    if (replaced !== s) return replaced;
  }

  // Mild fix: map old start/end tokens into the three-part legacy wording.
  return s
    .replace(
      /starting <strong><u>\{\{Booking_Start_datetime\}\}<\/u><\/strong> from <strong><u>(?:\{\{Booking_Start_Time\}\})?<\/u><\/strong> to <strong><u>\{\{Booking_end_datetime\}\}<\/u><\/strong>/gi,
      "starting <strong><u>{{Booking_Start_Date}}</u></strong> from <strong><u>{{Booking_Start_Time}}</u></strong> to <strong><u>{{Booking_End_DateTime}}</u></strong>"
    )
    .replace(
      /starting <strong><u>\{\{Booking_Start_datetime\}\}<\/u><\/strong> from <strong><u><\/u><\/strong> to <strong><u>\{\{Booking_end_datetime\}\}<\/u><\/strong>/gi,
      "starting <strong><u>{{Booking_Start_Date}}</u></strong> from <strong><u>{{Booking_Start_Time}}</u></strong> to <strong><u>{{Booking_End_DateTime}}</u></strong>"
    );
}

function resolveContractTokenValue(name, value) {
  if (value == null) return null;
  let text = String(value);
  if (String(name || "") === "Special_Notes") text = cleanContractSpecialNotes(text);
  return text;
}

function fillContractTokens(text, tokenMap = {}) {
  return String(text || "").replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}?/g, (token, name) => {
    const canonical = `{{${name}}}`;
    const resolved = resolveContractTokenValue(name, tokenMap[canonical]);
    return resolved == null ? token : resolved;
  });
}

function escapeHtmlText(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function looksLikeHtml(value = "") {
  return /<\/?[a-z][!a-z0-9:-]*\b[^>]*>/i.test(String(value || "")) || /<!--/.test(String(value || ""));
}

/** Normalize legacy PHP / import markup before it is parsed into the contract DOM. */
function normalizeLegacyContractHtml(html = "") {
  let s = String(html || "");
  s = s.replace(/<\/br>/gi, "<br/>");
  s = s.replace(/<!--[\s\S]*?-->/g, "");
  // Protect existing lists, then wrap orphan <li> rows (common in old add-on dumps).
  const protectedLists = [];
  s = s.replace(/<(ul|ol)\b[^>]*>[\s\S]*?<\/\1>/gi, (block) => {
    const key = `%%CONTRACT_LIST_${protectedLists.length}%%`;
    protectedLists.push(block);
    return key;
  });
  s = s.replace(/(?:<li\b[^>]*>[\s\S]*?<\/li>\s*)+/gi, (block) => `<ul>${block}</ul>`);
  protectedLists.forEach((block, index) => {
    s = s.replace(`%%CONTRACT_LIST_${index}%%`, block);
  });
  return s;
}

function fillContractTokensHtml(html, tokenMap = {}) {
  return String(html || "").replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}?/g, (token, name) => {
    const canonical = `{{${name}}}`;
    const text = resolveContractTokenValue(name, tokenMap[canonical]);
    if (text == null) return token;
    // Legacy notes / cost dumps often contain real HTML — inject, then sanitize.
    if (looksLikeHtml(text)) return normalizeLegacyContractHtml(text);
    return escapeHtmlText(text).replace(/\n/g, "<br/>");
  });
}

/** Turn text nodes that still contain raw/legacy HTML tags into real elements. */
function rehydrateHtmlTextNodes(root) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const pending = [];
  let node;
  while ((node = walker.nextNode())) {
    const text = node.nodeValue || "";
    if (looksLikeHtml(text)) pending.push(node);
  }
  pending.forEach((textNode) => {
    const parent = textNode.parentNode;
    if (!parent) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = normalizeLegacyContractHtml(textNode.nodeValue || "");
    const frag = document.createDocumentFragment();
    while (wrap.firstChild) frag.appendChild(wrap.firstChild);
    parent.replaceChild(frag, textNode);
  });
}

const CONTRACT_RICH_TAGS = new Set([
  "P", "BR", "DIV", "SPAN", "B", "STRONG", "I", "EM", "U", "FONT",
  "UL", "OL", "LI", "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TH", "TD",
  "H1", "H2", "H3", "H4", "H5", "H6", "IMG", "A",
]);

function sanitizeContractHref(value = "") {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v) || v.startsWith("mailto:") || v.startsWith("#")) return v;
  return "";
}

function sanitizeContractImageSrc(value = "") {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^data:image\/(png|jpeg|jpg|gif|webp);base64,/i.test(v)) return v;
  return "";
}

function sanitizeCssColor(value = "") {
  const v = String(value || "").trim();
  if (!v) return "";
  if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v)) return v;
  if (/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/i.test(v)) return v;
  if (/^rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)$/i.test(v)) return v;
  if (/^[a-z]{1,20}$/i.test(v)) return v.toLowerCase();
  return "";
}

function sanitizeFontSizeValue(value = "") {
  const v = String(value || "").trim();
  if (/^\d+(\.\d+)?(px|pt|em|rem|%)$/i.test(v)) return v;
  return "";
}

function sanitizeContractStyleAttr(styleValue = "") {
  const raw = String(styleValue || "");
  const parts = [];
  const align = /text-align\s*:\s*(left|center|right|justify)/i.exec(raw);
  if (align) parts.push(`text-align:${align[1].toLowerCase()}`);

  const colorMatch = /(?:^|;)\s*color\s*:\s*([^;]+)/i.exec(raw);
  if (colorMatch) {
    const color = sanitizeCssColor(colorMatch[1]);
    if (color) parts.push(`color:${color}`);
  }

  const bgMatch = /background(?:-color)?\s*:\s*([^;]+)/i.exec(raw);
  if (bgMatch) {
    const bg = sanitizeCssColor(bgMatch[1]);
    if (bg) parts.push(`background-color:${bg}`);
  }

  const sizeMatch = /font-size\s*:\s*([^;]+)/i.exec(raw);
  if (sizeMatch) {
    const size = sanitizeFontSizeValue(sizeMatch[1]);
    if (size) parts.push(`font-size:${size}`);
  }

  const marginMatch = /margin(?:-left|-right|-top|-bottom)?\s*:\s*([^;]+)/i.exec(raw);
  if (marginMatch) {
    const margin = String(marginMatch[1] || "").trim();
    if (/^\d+(\.\d+)?(px|em|rem|%)$/i.test(margin)) {
      const prop = /margin-[a-z]+/i.exec(raw)?.[0]?.toLowerCase() || "margin";
      parts.push(`${prop}:${margin}`);
    }
  }

  ["width", "height", "max-width"].forEach((prop) => {
    const re = new RegExp(`${prop}\\s*:\\s*([^;]+)`, "i");
    const match = re.exec(raw);
    if (!match) return;
    const val = String(match[1] || "").trim();
    if (/^\d+(\.\d+)?(px|em|rem|%|auto)$/i.test(val)) parts.push(`${prop}:${val}`);
  });

  return parts.join(";");
}

function sanitizeContractHtml(html = "") {
  if (typeof document === "undefined") {
    return String(html || "").replace(/<script[\s\S]*?<\/script>/gi, "");
  }
  const root = document.createElement("div");
  root.innerHTML = normalizeLegacyContractHtml(repairContractWaiverMarkup(html));

  // Preserve legacy <center> alignment (not in allow-list; would otherwise unwrap left-aligned).
  root.querySelectorAll("center").forEach((el) => {
    const div = document.createElement("div");
    div.setAttribute("style", "text-align:center");
    while (el.firstChild) div.appendChild(el.firstChild);
    el.parentNode?.replaceChild(div, el);
  });

  // If a center div still contains body copy after an image (broken extractor markup),
  // keep only the leading media centered and move the rest out as left-aligned siblings.
  root.querySelectorAll('div[style*="text-align:center"], div[style*="text-align: center"]').forEach((div) => {
    const html = div.innerHTML || "";
    if (!/<img\b/i.test(html)) return;
    // Match "4.2 ..." and also top-level "7. On site ..."
    const headingIdx = html.search(/<(?:strong|b)>\s*\d+\.(?:\d+)?(?:\s|&nbsp;|[A-Za-z])/i);
    const cut = headingIdx >= 0 ? headingIdx : -1;
    if (cut <= 0) return;
    if (html.slice(cut).length < 20) return;
    const kept = html.slice(0, cut).replace(/(?:<br\s*\/?>\s*)+$/i, "");
    const rest = html.slice(cut);
    div.innerHTML = kept;
    const holder = document.createElement("div");
    holder.innerHTML = rest;
    let insertAfter = div;
    while (holder.firstChild) {
      const node = holder.firstChild;
      insertAfter.parentNode?.insertBefore(node, insertAfter.nextSibling);
      insertAfter = node;
    }
  });

  const scrubNode = (node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    if (!CONTRACT_RICH_TAGS.has(node.tagName)) {
      const parent = node.parentNode;
      if (!parent) return;
      const moved = Array.from(node.childNodes);
      moved.forEach((child) => parent.insertBefore(child, node));
      parent.removeChild(node);
      moved.forEach(scrubNode);
      return;
    }

    Array.from(node.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name === "style") {
        const cleaned = sanitizeContractStyleAttr(attr.value || "");
        if (cleaned) node.setAttribute("style", cleaned);
        else node.removeAttribute("style");
        return;
      }
      if (node.tagName === "FONT") {
        if (name === "color") {
          const color = sanitizeCssColor(attr.value || "");
          if (color) node.setAttribute("color", color);
          else node.removeAttribute("color");
          return;
        }
        if (name === "size") {
          if (/^[1-7]$/.test(attr.value || "")) return;
          node.removeAttribute("size");
          return;
        }
      }
      if (node.tagName === "IMG") {
        if (name === "src") {
          const src = sanitizeContractImageSrc(attr.value || "");
          if (src) node.setAttribute("src", src);
          else node.removeAttribute("src");
          return;
        }
        if (name === "alt") return;
        if ((name === "width" || name === "height") && /^\d{1,4}%?$/.test(attr.value || "")) return;
      }
      if (node.tagName === "A" && name === "href") {
        const href = sanitizeContractHref(attr.value || "");
        if (href) {
          node.setAttribute("href", href);
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        } else node.removeAttribute("href");
        return;
      }
      if (name === "target" || name === "rel") {
        if (node.tagName === "A") return;
      }
      if ((name === "colspan" || name === "rowspan") && (node.tagName === "TD" || node.tagName === "TH")) {
        if (!/^\d{1,2}$/.test(attr.value || "")) node.removeAttribute(attr.name);
        return;
      }
      if (name === "class" && node.tagName === "TABLE") {
        const cls = String(attr.value || "").toLowerCase();
        if (/\bborder|\btable-bordered\b/.test(cls)) {
          node.setAttribute("data-bordered", "1");
        }
        node.removeAttribute("class");
        return;
      }
      if (name === "border" && node.tagName === "TABLE") {
        const borderVal = String(attr.value || "").trim();
        if (borderVal && borderVal !== "0") node.setAttribute("data-bordered", "1");
        node.removeAttribute("border");
        return;
      }
      if (name === "data-bordered" && node.tagName === "TABLE") return;
      if (name === "type" && (node.tagName === "OL" || node.tagName === "UL")) return;
      node.removeAttribute(attr.name);
    });

    Array.from(node.childNodes).forEach(scrubNode);
  };

  // Mark addendum-style bordered tables before attribute scrub drops Bootstrap classes.
  root.querySelectorAll("table").forEach((table) => {
    const cls = String(table.getAttribute("class") || "").toLowerCase();
    const border = String(table.getAttribute("border") || "").trim();
    const style = String(table.getAttribute("style") || "");
    const looksBordered = /\bborder|\btable-bordered\b/.test(cls) || (border && border !== "0");
    const looksRateTable = /Private Event|Semi Event|Public Event/i.test(table.textContent || "");
    if (looksBordered || looksRateTable) {
      table.setAttribute("data-bordered", "1");
      // Legacy deposit matrix used width:40% and looked cramped on the sign page.
      const nextStyle = style
        .replace(/width\s*:\s*[^;]+;?/gi, "")
        .replace(/;{2,}/g, ";")
        .replace(/^;|;$/g, "")
        .trim();
      table.setAttribute("style", nextStyle ? `${nextStyle};width:100%` : "width:100%");
    }
  });

  // First pass: scrub known markup
  Array.from(root.childNodes).forEach(scrubNode);
  // Second pass: legacy/import dumps often leave raw tags as text (e.g. Special Notes)
  rehydrateHtmlTextNodes(root);
  Array.from(root.childNodes).forEach(scrubNode);
  return root.innerHTML;
}

/** Strip legacy-import dump blocks that collaburo.space never shows in Special Notes. */
export function cleanContractSpecialNotes(notes = "") {
  let s = String(notes || "");
  const cutMarkers = [
    /\n?Old booking details:\s*/i,
    /\n?Contract Space Rental Items:\s*/i,
    /\n?Contract Space Contents:\s*/i,
  ];
  cutMarkers.forEach((re) => {
    const match = re.exec(s);
    if (match && match.index != null) s = s.slice(0, match.index);
  });
  return s.replace(/\s+$/g, "").trim();
}

function contractBodyDisplayHtml(body = "", tokenMap = {}) {
  const raw = String(body || "");
  if (!raw.trim()) return "";
  if (looksLikeHtml(raw)) {
    return sanitizeContractHtml(fillContractTokensHtml(raw, tokenMap));
  }
  const filled = fillContractTokens(raw, tokenMap);
  // Plain-text bodies can still receive HTML-bearing token values from legacy imports.
  if (looksLikeHtml(filled)) {
    return sanitizeContractHtml(normalizeLegacyContractHtml(filled).replace(/\n/g, "<br/>"));
  }
  return escapeHtmlText(filled).replace(/\n/g, "<br/>");
}

const CONTRACT_FONT_SIZE_PX = [10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48];

const CONTRACT_SWATCH_COLORS = [
  "#111111", "#444444", "#c62828", "#ad1457", "#6a1b9a",
  "#1565c0", "#00838f", "#2e7d32", "#ef6c00", "#ffffff",
];

const CONTRACT_HIGHLIGHT_COLORS = [
  "#fff59d", "#ffcc80", "#ffab91", "#ce93d8", "#90caf9",
  "#a5d6a7", "#e0e0e0", "#ffffff",
];

function ContractRichTextEditor({ value = "", onChange, placeholder = "Write paragraph content…", rows = 7 }) {
  const ref = React.useRef(null);
  const [fontColor, setFontColor] = React.useState("#111111");
  const [highlightColor, setHighlightColor] = React.useState("#fff59d");
  const [fontSizePx, setFontSizePx] = React.useState("14");

  React.useEffect(() => {
    if (ref.current && ref.current.innerHTML !== (value || "")) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  const emit = () => onChange && onChange(ref.current?.innerHTML || "");

  const run = (command, commandValue = null) => {
    ref.current?.focus();
    try {
      document.execCommand("styleWithCSS", false, true);
    } catch {
      // Some browsers may not support styleWithCSS.
    }
    document.execCommand(command, false, commandValue);
    emit();
  };

  const applyTextColor = (color) => {
    setFontColor(color);
    run("foreColor", color);
  };

  const applyHighlight = (color) => {
    setHighlightColor(color);
    ref.current?.focus();
    try {
      document.execCommand("styleWithCSS", false, true);
    } catch {
      // ignore
    }
    const applied = document.execCommand("hiliteColor", false, color);
    if (!applied) document.execCommand("backColor", false, color);
    emit();
  };

  const applyFontSize = (sizePx) => {
    const numeric = Number.parseInt(String(sizePx).replace(/px$/i, ""), 10);
    if (!Number.isFinite(numeric) || numeric < 8 || numeric > 96 || !ref.current) return;
    const sizeValue = `${numeric}px`;
    setFontSizePx(String(numeric));
    ref.current.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!ref.current.contains(range.commonAncestorContainer)) return;

    const span = document.createElement("span");
    span.style.fontSize = sizeValue;
    try {
      range.surroundContents(span);
    } catch {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
    }
    selection.removeAllRanges();
    const next = document.createRange();
    next.selectNodeContents(span);
    selection.addRange(next);
    emit();
  };

  const insertTable = () => {
    ref.current?.focus();
    const tableHtml = [
      "<table><thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>",
      "<tbody><tr><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p><br/></p>",
    ].join("");
    document.execCommand("insertHTML", false, tableHtml);
    emit();
  };

  return (
    <div className="rich-editor">
      <div className="rich-editor-toolbar" onMouseDown={(e) => e.preventDefault()}>
        <button type="button" title="Bold" onClick={() => run("bold")}><b>B</b></button>
        <button type="button" title="Italic" onClick={() => run("italic")}><i>I</i></button>
        <button type="button" title="Underline" onClick={() => run("underline")}><u>U</u></button>
        <span className="rich-editor-toolbar-sep" aria-hidden="true" />
        <button type="button" title="Align left" onClick={() => run("justifyLeft")}>Left</button>
        <button type="button" title="Align center" onClick={() => run("justifyCenter")}>Center</button>
        <button type="button" title="Align right" onClick={() => run("justifyRight")}>Right</button>
        <span className="rich-editor-toolbar-sep" aria-hidden="true" />
        <label className="rich-editor-color" title="Font color">
          <span className="rich-editor-color-label" style={{ color: fontColor }}>A</span>
          <input
            type="color"
            value={fontColor}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => applyTextColor(e.target.value)}
          />
        </label>
        <div className="rich-editor-swatches" title="Font color presets">
          {CONTRACT_SWATCH_COLORS.map((color) => (
            <button
              key={`fg-${color}`}
              type="button"
              className="rich-editor-swatch"
              style={{ background: color }}
              title={color}
              onClick={() => applyTextColor(color)}
            />
          ))}
        </div>
        <label className="rich-editor-color rich-editor-highlight" title="Highlight color">
          <span className="rich-editor-color-label" style={{ background: highlightColor }}>H</span>
          <input
            type="color"
            value={highlightColor}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => applyHighlight(e.target.value)}
          />
        </label>
        <div className="rich-editor-swatches" title="Highlight presets">
          {CONTRACT_HIGHLIGHT_COLORS.map((color) => (
            <button
              key={`bg-${color}`}
              type="button"
              className="rich-editor-swatch"
              style={{ background: color }}
              title={color}
              onClick={() => applyHighlight(color)}
            />
          ))}
        </div>
        <div className="rich-editor-size-group" title="Font size in px">
          <select
            className="rich-editor-size"
            value={CONTRACT_FONT_SIZE_PX.includes(Number(fontSizePx)) ? fontSizePx : ""}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              if (!e.target.value) return;
              applyFontSize(e.target.value);
            }}
          >
            <option value="" disabled>
              px
            </option>
            {CONTRACT_FONT_SIZE_PX.map((px) => (
              <option key={px} value={String(px)}>
                {px}px
              </option>
            ))}
          </select>
          <input
            className="rich-editor-size-input"
            type="number"
            min={8}
            max={96}
            step={1}
            value={fontSizePx}
            aria-label="Custom font size in pixels"
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => setFontSizePx(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyFontSize(fontSizePx);
              }
            }}
          />
          <span className="rich-editor-size-unit">px</span>
          <button type="button" title="Apply font size" onClick={() => applyFontSize(fontSizePx)}>
            Apply
          </button>
        </div>
        <span className="rich-editor-toolbar-sep" aria-hidden="true" />
        <button type="button" title="Bulleted list" onClick={() => run("insertUnorderedList")}>• List</button>
        <button type="button" title="Numbered list" onClick={() => run("insertOrderedList")}>1. List</button>
        <button type="button" title="Insert table" onClick={insertTable}>Table</button>
        <button type="button" title="Clear formatting" onClick={() => run("removeFormat")}>Clear</button>
      </div>
      <div
        ref={ref}
        className="rich-editor-input contract-rich-editor-input"
        contentEditable
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        style={{ minHeight: rows * 24 }}
        suppressContentEditableWarning
      />
    </div>
  );
}

function ContractRichTextDisplay({ value = "", tokenMap = {}, className = "" }) {
  const html = contractBodyDisplayHtml(value, tokenMap);
  if (!html) return null;
  return (
    <div
      className={className || "contract-rich-text"}
      style={{ fontSize: 13.5, lineHeight: 1.55 }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function SignaturePad({ value, onChange, height = 160, disabled = false }) {
  const canvasRef = React.useRef(null);
  const drawing = React.useRef(false);
  const last = React.useRef(null);

  const syncEmpty = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return true;
    const ctx = canvas.getContext("2d");
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] !== 0) return false;
    }
    return true;
  }, []);

  const drawnValue = React.useRef(null);

  const emit = React.useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onChange) return;
    const next = syncEmpty() ? "" : canvas.toDataURL("image/png");
    drawnValue.current = next;
    onChange(next);
  }, [onChange, syncEmpty]);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawnValue.current = "";
    onChange && onChange("");
  };

  const paintValue = React.useCallback((nextValue) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.clientWidth || 450;
    drawnValue.current = nextValue || "";
    ctx.clearRect(0, 0, width, height);
    if (nextValue && nextValue.startsWith("data:")) {
      const img = new Image();
      img.onload = () => {
        if (drawnValue.current !== nextValue) return;
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
      };
      img.src = nextValue;
    }
  }, [height]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const width = canvas.clientWidth || 450;
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111";
    paintValue(value);
  }, [height]); // eslint-disable-line react-hooks/exhaustive-deps -- resize on mount/size only

  React.useEffect(() => {
    if ((value || "") !== drawnValue.current) paintValue(value);
  }, [value, paintValue]);

  const pointFromEvent = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const source = event.touches?.[0] || event;
    return { x: source.clientX - rect.left, y: source.clientY - rect.top };
  };

  const start = (event) => {
    if (disabled) return;
    event.preventDefault();
    drawing.current = true;
    last.current = pointFromEvent(event);
  };

  const move = (event) => {
    if (!drawing.current || disabled) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const next = pointFromEvent(event);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(next.x, next.y);
    ctx.stroke();
    last.current = next;
  };

  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    emit();
  };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 8, background: "#fff", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height, display: "block", touchAction: "none", cursor: disabled ? "not-allowed" : "crosshair", background: "#fafafa" }}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, padding: "8px 10px", borderTop: "1px solid var(--line)", background: "var(--surface-2)" }}>
        <button type="button" className="btn-gray sm" onClick={clear} disabled={disabled}>Clear</button>
      </div>
    </div>
  );
}

function ContractBlockPreview({ block, tokenMap = {}, signatures = {}, interactive = false, onSignatureChange, onDuplicateSignature, firstClientSignature = "" }) {
  if (block.type === "header") {
    return (
      <div style={{ marginBottom: 18, borderBottom: "1px solid var(--line)", paddingBottom: 12 }}>
        {(block.fields || []).map((field) => (
          <div key={field.id} style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: 0.04 }}>{field.label}</div>
            <div style={{ fontSize: field.label?.toLowerCase() === "title" ? 22 : 14, fontWeight: field.label?.toLowerCase() === "title" ? 700 : 500, whiteSpace: "pre-wrap" }}>
              {fillContractTokens(field.value, tokenMap)}
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (block.type === "paragraph") {
    return (
      <div className="contract-block contract-block-paragraph" style={{ marginBottom: 16 }}>
        {block.title ? <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>{fillContractTokens(block.title, tokenMap)}</h3> : null}
        <ContractRichTextDisplay value={block.body} tokenMap={tokenMap} />
      </div>
    );
  }
  if (block.type === "image") {
    return (
      <div className="contract-block contract-block-image" style={{ marginBottom: 16 }}>
        {block.label ? <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{block.label}</div> : null}
        {block.url
          ? <img src={block.url} alt={block.alt || ""} style={{ maxWidth: "100%", borderRadius: 8, border: "1px solid var(--line)" }} />
          : <div style={{ border: "1px dashed var(--line-strong)", borderRadius: 8, padding: 24, color: "var(--ink-3)", textAlign: "center" }}>No image</div>}
      </div>
    );
  }
  if (block.type === "signature") {
    const signedUrl = signatures[block.id] || (block.role === "owner" ? block.ownerImageUrl : "");
    return (
      <div className="contract-block contract-block-signature" style={{ marginTop: 12, marginBottom: 18, border: "1px solid #ced4da", borderRadius: 4, padding: "12px 14px", background: "#fff" }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 13 }}>{block.label}{block.required ? <span style={{ color: "var(--danger)" }}> *</span> : null}</div>
        {block.role === "owner" ? (
          signedUrl
            ? <img src={signedUrl} alt="Owner signature" style={{ maxWidth: 280, maxHeight: 120, objectFit: "contain" }} />
            : <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Owner signature image not uploaded yet.</div>
        ) : interactive ? (
          <div style={{ display: "grid", gap: 8 }}>
            {firstClientSignature && !signatures[block.id] ? (
              <button type="button" className="btn dark sm" onClick={() => onDuplicateSignature && onDuplicateSignature(block.id, firstClientSignature)}>
                Insert Same Signature
              </button>
            ) : null}
            <SignaturePad value={signatures[block.id] || ""} onChange={(dataUrl) => onSignatureChange && onSignatureChange(block.id, dataUrl)} />
          </div>
        ) : (
          signedUrl
            ? <img src={signedUrl} alt="Client signature" style={{ maxWidth: 280, maxHeight: 120, objectFit: "contain" }} />
            : <div style={{ color: "var(--ink-3)", fontSize: 13 }}>Awaiting client signature</div>
        )}
        {block.role === "owner" && block.ownerName ? <div style={{ marginTop: 6, fontSize: 12, color: "var(--ink-3)" }}>{block.ownerName}</div> : null}
      </div>
    );
  }
  return null;
}

export function ContractDocumentView({
  settings,
  tokenMap = {},
  signatures = {},
  interactive = false,
  onSignatureChange,
  title,
  showTitle = true,
  variant = "social",
}) {
  const contract = coerceContractTemplate(settings, variant);
  const clientBlocks = (contract.blocks || []).filter((block) => block.type === "signature" && block.role === "client");
  const firstClientId = clientBlocks[0]?.id;
  const firstClientSignature = firstClientId ? signatures[firstClientId] || "" : "";
  const heading = title || contract.title;
  return (
    <div className={"contract-document" + (interactive ? " contract-document-interactive" : "")} style={{ background: "#fff", border: interactive ? "none" : "1px solid var(--line)", borderRadius: interactive ? 0 : 12, padding: interactive ? "12px 9px 28px" : 22, maxHeight: interactive ? undefined : 420, overflow: interactive ? "visible" : "auto", minWidth: 0, maxWidth: interactive ? 720 : undefined, margin: interactive ? "0 auto" : undefined }}>
      <style>{`.contract-document img{max-width:100%;height:auto;display:block;margin:10px auto}.contract-document table{width:100%;border-collapse:collapse;margin:4px 0 8px;border:none}.contract-document th,.contract-document td{border:none;background:transparent;padding:1px 4px 1px 0;vertical-align:top;text-align:left}.contract-document table[data-bordered="1"]{width:100%!important;table-layout:fixed;margin:12px 0 16px}.contract-document table[data-bordered="1"] th,.contract-document table[data-bordered="1"] td{border:1px solid #212529!important;padding:8px 10px;vertical-align:middle;text-align:center;white-space:normal}.contract-document table[data-bordered="1"] td:first-child,.contract-document table[data-bordered="1"] th:first-child{text-align:left;font-weight:700;width:18%}.contract-document ul,.contract-document ol{margin:4px 0 8px 1.4em;padding:0}.contract-document li{margin:2px 0;line-height:1.5}.contract-rich-text{font-size:12px;line-height:1.5;color:#212529;font-family:system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}.contract-document-interactive .contract-block-paragraph{margin-bottom:16px}`}</style>
      {showTitle && heading ? <h2 style={{ margin: "0 0 16px", fontSize: 22 }}>{heading}</h2> : null}
      {(contract.blocks || []).map((block) => (
        <ContractBlockPreview
          key={block.id}
          block={block}
          tokenMap={tokenMap}
          signatures={signatures}
          interactive={interactive}
          firstClientSignature={firstClientSignature}
          onSignatureChange={onSignatureChange}
          onDuplicateSignature={(blockId, dataUrl) => onSignatureChange && onSignatureChange(blockId, dataUrl)}
        />
      ))}
    </div>
  );
}

async function uploadDataUrlImage(dataUrl, filename, folder = "collaburo/contracts") {
  if (!dataUrl || !String(dataUrl).startsWith("data:")) return dataUrl || "";
  const response = await fetch("/api/uploads/images", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ dataUrl, filename, folder }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !(data.file?.secureUrl || data.image?.secureUrl)) {
    throw new Error(data.error || "Upload failed.");
  }
  return data.file?.secureUrl || data.image?.secureUrl;
}

function ContractImageUpload({ value, onChange, label = "Upload image" }) {
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.readAsDataURL(file);
      });
      const url = await uploadDataUrlImage(dataUrl, file.name || "contract-image.png");
      onChange(url);
    } catch (uploadError) {
      setError(uploadError.message || "Upload failed.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {value ? <img src={value} alt="" style={{ maxWidth: 240, maxHeight: 100, objectFit: "contain", border: "1px solid var(--line)", borderRadius: 8, background: "#fff" }} /> : null}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <label className="btn dark sm" style={{ cursor: "pointer" }}>
          {busy ? "Uploading…" : label}
          <input type="file" accept="image/*" hidden disabled={busy} onChange={onFile} />
        </label>
        {value ? <button type="button" className="btn-gray sm" onClick={() => onChange("")}>Remove</button> : null}
      </div>
      {error ? <div style={{ color: "var(--danger)", fontSize: 12 }}>{error}</div> : null}
    </div>
  );
}

export function ContractSettingsView({ settings, onChange, dynamicFields = [] }) {
  const Ic = window.Icons || {};
  const site = settings || {};
  const contract = normalizeContractSettings(site.contractSettings);
  const activeTab = contract.activeTab === "business" ? "business" : "social";
  const activeTemplate = getContractTemplate(contract, activeTab);
  const businessTypes = contract.businessEventTypes || DEFAULT_BUSINESS_EVENT_TYPES;
  const socialTypes = DEFAULT_SOCIAL_EVENT_TYPES;
  const previewTokenMap = {
    "{{Client_Name}}": "Alex Client",
    "{{Client_Display_Name}}": "Alex Client (Acme Co)",
    "{{Organization}}": "Acme Co",
    "{{Organization_Suffix}}": " (Acme Co)",
    "{{Email}}": "alex@example.com",
    "{{Phone}}": "613-555-0100",
    "{{Booking_ID}}": "B12ABC",
    "{{Space}}": "Large Room",
    "{{Event_Type}}": activeTab === "business" ? "Workshop / Training" : "Social Event without dancing / Banquet",
    "{{Event_Description}}": activeTab === "business" ? "Team training workshop" : "Birthday dinner",
    "{{Event_Privacy}}": "Private",
    "{{Alcohol_On_Site}}": "No",
    "{{Expected_Number_of_Attendees}}": "40",
    "{{Booking_Start_datetime}}": "June 18, 2026 04:00 pm",
    "{{Booking_end_datetime}}": "June 18, 2026 08:00 pm",
    "{{Booking_DateTime}}": "June 18, 2026 04:00 pm - June 18, 2026 08:00 pm",
    "{{Agreement_Day}}": "18th",
    "{{Agreement_Month}}": "June",
    "{{Agreement_Year}}": "2026",
    "{{Agreement_Month_Year}}": "June, 2026",
    "{{Agreement_Time}}": "12:00 pm",
    "{{Layout_Selections}}": "Theater",
    "{{Floor_Layout_Instructions}}": "Rows facing the screen",
    "{{Stage_Layout_Instructions}}": "Podium center stage",
    "{{Buffet_Layout_Instructions}}": "",
    "{{Blackboard_Sign_Message}}": "",
    "{{Space_Lines}}": "Large Room: $450.00",
    "{{Space_Rental_Rooms_Label}}": "(Large Room)",
    "{{Space_Extra_Total}}": "$0.00",
    "{{Space_Rental_Total}}": "$450.00",
    "{{Space_Content_Total}}": "$80.00",
    "{{Catering_Total}}": "$0.00",
    "{{Setup_Total}}": "$0.00",
    "{{Event_Service_Total}}": "$0.00",
    "{{Cleanup_Total}}": "$0.00",
    "{{Discount_Total}}": "$0.00",
    "{{Additional_Discount}}": "$0.00",
    "{{Subtotal}}": "$530.00",
    "{{Fees_Total}}": "$68.90",
    "{{Total}}": "$598.90",
    "{{Total_With_Deposit}}": "$1,098.90",
    "{{Security_Deposit}}": "$500.00",
    "{{Security_Deposit_Note}}": "Refundable after inspection",
    "{{Cost_Breakdown}}": "Space Rental ($450.00)\nLarge Room — 4 hrs: $450.00\n\nSpace Content / Rentals ($80.00)\nChairs x 40: $80.00\n\nSubtotal: $530.00\nTotal: $598.90\nSecurity Deposit: $500.00\nTotal with Deposit: $1,098.90",
    "{{Item_Details}}": "Chairs x 40: $80.00",
    "{{Catering_Specifics}}": "",
    "{{Special_Notes}}": "",
    "{{Tech_Questions}}": "",
    "{{Discount_Notes}}": "",
    "{{Multi_Day_Details}}": "",
    "{{Today_Date}}": "September 6, 2026",
  };

  const commit = (nextSettings) => {
    onChange({
      ...site,
      contractSettings: normalizeContractSettings(nextSettings),
    });
  };

  const update = (patch) => commit({ ...contract, ...patch });

  const updateActiveTemplate = (templatePatch) => {
    const nextTemplate = normalizeContractTemplate({ ...activeTemplate, ...templatePatch }, activeTemplate);
    update({
      templates: {
        ...contract.templates,
        [activeTab]: nextTemplate,
      },
    });
  };

  const setActiveTab = (tab) => update({ activeTab: tab === "business" ? "business" : "social" });

  const loadLegacyTemplate = () => {
    const label = activeTab === "business" ? "Business (contract_b)" : "Social (contract_s)";
    if (typeof window !== "undefined" && !window.confirm(`Replace the ${label} template with the legacy Collabüro wording?`)) {
      return;
    }
    const legacy = activeTab === "business"
      ? createLegacyBusinessContractSettings()
      : createLegacyContractSettings();
    updateActiveTemplate(legacy);
  };

  const updateBlock = (id, patch) => {
    updateActiveTemplate({
      blocks: activeTemplate.blocks.map((block) => (block.id === id ? normalizeContractBlock({ ...block, ...patch }) : block)),
    });
  };
  const moveBlock = (id, direction) => {
    const index = activeTemplate.blocks.findIndex((block) => block.id === id);
    if (index < 0) return;
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= activeTemplate.blocks.length) return;
    const blocks = activeTemplate.blocks.slice();
    const [item] = blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, item);
    updateActiveTemplate({ blocks });
  };
  const removeBlock = (id) => updateActiveTemplate({ blocks: activeTemplate.blocks.filter((block) => block.id !== id) });
  const addBlock = (type) => {
    let block;
    if (type === "header") {
      block = { id: contractUid("blk"), type: "header", fields: [{ id: contractUid("fld"), label: "Title", value: "" }, { id: contractUid("fld"), label: "Address", value: "" }] };
    } else if (type === "image") {
      block = { id: contractUid("blk"), type: "image", label: "Image", url: "", alt: "" };
    } else if (type === "signature") {
      block = { id: contractUid("blk"), type: "signature", role: "client", label: "Client Signature", required: true };
    } else {
      block = { id: contractUid("blk"), type: "paragraph", title: "Section", body: "", allowTokens: true };
    }
    updateActiveTemplate({ blocks: [...activeTemplate.blocks, normalizeContractBlock(block)] });
  };

  const chipStyle = {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: 99,
    background: "var(--surface-3)",
    fontSize: 11,
    margin: "0 4px 4px 0",
  };

  return (
    <div className="editor-col" style={{ flex: 1 }}>
      <div className="editor-inner contract-settings-page">
        <div className="editor-head">
          <div>
            <span className="editor-head-tag">{Ic.File ? <Ic.File size={11} /> : null} Contract</span>
            <h1>Contract</h1>
            <p>
              Edit separate Social and Business templates (legacy contract_s / contract_b). When a contract is generated, the booking&apos;s event type picks which template is used.
            </p>
          </div>
          <button
            type="button"
            className="btn dark sm"
            onClick={loadLegacyTemplate}
            title={`Replace the ${activeTab} template with legacy wording`}
          >
            Load legacy {activeTab === "business" ? "Business" : "Social"} template
          </button>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[
            { id: "social", label: "Social" },
            { id: "business", label: "Business" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={activeTab === tab.id ? "btn dark sm" : "btn-gray sm"}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="contract-settings-block-card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Used when the booking event type is:</div>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)", marginBottom: 4 }}>
              {activeTab === "business" ? "Business template" : "Social template"}
            </div>
            <div>
              {(activeTab === "business" ? businessTypes : socialTypes).map((type) => (
                <span key={type} style={chipStyle}>{type}</span>
              ))}
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--ink-3)" }}>
            Routing matches the legacy site: business types use the Business template; all other event types use Social.
          </p>
        </div>

        <div className="contract-settings-block-card" style={{ marginBottom: 16 }}>
          <label className="lbl">{activeTab === "business" ? "Business" : "Social"} contract title</label>
          <input className="input" value={activeTemplate.title || ""} onChange={(e) => updateActiveTemplate({ title: e.target.value })} />
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {CONTRACT_BLOCK_TYPES.map((type) => (
            <button key={type.id} type="button" className="btn dark sm" onClick={() => addBlock(type.id)}>
              {Ic.Plus ? <Ic.Plus size={12} /> : "+"} Add {type.label}
            </button>
          ))}
        </div>

        <div className="contract-settings-layout">
          <div className="contract-settings-blocks" style={{ display: "grid", gap: 14 }}>
            {activeTemplate.blocks.map((block, index) => (
              <div key={block.id} className="contract-settings-block-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 12, alignItems: "center" }}>
                  <strong style={{ textTransform: "capitalize" }}>{block.type} block</strong>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" className="btn icon sm ghost" title="Move up" disabled={index === 0} onClick={() => moveBlock(block.id, -1)}>↑</button>
                    <button type="button" className="btn icon sm ghost" title="Move down" disabled={index === activeTemplate.blocks.length - 1} onClick={() => moveBlock(block.id, 1)}>↓</button>
                    <button type="button" className="btn icon sm ghost danger-ghost" title="Delete" onClick={() => removeBlock(block.id)}>{Ic.Trash ? <Ic.Trash size={13} /> : "×"}</button>
                  </div>
                </div>

                {block.type === "header" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    {(block.fields || []).map((field) => (
                      <div key={field.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr auto", gap: 8 }}>
                        <input className="input" value={field.label} onChange={(e) => updateBlock(block.id, { fields: block.fields.map((item) => item.id === field.id ? { ...item, label: e.target.value } : item) })} placeholder="Label" />
                        <textarea className="textarea" rows={2} value={field.value} onChange={(e) => updateBlock(block.id, { fields: block.fields.map((item) => item.id === field.id ? { ...item, value: e.target.value } : item) })} placeholder="Value" />
                        <button type="button" className="btn-gray sm" onClick={() => updateBlock(block.id, { fields: block.fields.filter((item) => item.id !== field.id) })}>Remove</button>
                      </div>
                    ))}
                    <button type="button" className="btn-gray sm" onClick={() => updateBlock(block.id, { fields: [...(block.fields || []), { id: contractUid("fld"), label: "Field", value: "" }] })}>Add field</button>
                  </div>
                )}

                {block.type === "paragraph" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label className="lbl">Section title</label>
                      <input className="input" value={block.title || ""} onChange={(e) => updateBlock(block.id, { title: e.target.value })} />
                    </div>
                    <div>
                      <label className="lbl">Paragraph content</label>
                      <ContractRichTextEditor
                        value={block.body || ""}
                        onChange={(body) => updateBlock(block.id, { body })}
                        placeholder="Write paragraph content. Use the toolbar for bold, color, highlight, size, alignment, and tables."
                        rows={8}
                      />
                      <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--ink-3)" }}>
                        Select text first, then choose a size in px from the dropdown or type a custom value (8–96) and click Apply. Dynamic tokens like {"{{Client_Name}}"} still work when typed in the content.
                      </p>
                    </div>
                  </div>
                )}

                {block.type === "image" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label className="lbl">Label</label>
                      <input className="input" value={block.label || ""} onChange={(e) => updateBlock(block.id, { label: e.target.value })} />
                    </div>
                    <ContractImageUpload value={block.url || ""} onChange={(url) => updateBlock(block.id, { url })} label="Attach image" />
                  </div>
                )}

                {block.type === "signature" && (
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label className="lbl">Label</label>
                      <input className="input" value={block.label || ""} onChange={(e) => updateBlock(block.id, { label: e.target.value })} />
                    </div>
                    <div>
                      <label className="lbl">Role</label>
                      <select className="select" value={block.role || "client"} onChange={(e) => updateBlock(block.id, { role: e.target.value })}>
                        <option value="owner">Owner</option>
                        <option value="client">Client</option>
                      </select>
                    </div>
                    <label className="chk">
                      <input type="checkbox" checked={block.required !== false} onChange={(e) => updateBlock(block.id, { required: e.target.checked })} />
                      Required
                    </label>
                    {block.role === "owner" && (
                      <>
                        <div>
                          <label className="lbl">Owner name / title</label>
                          <input className="input" value={block.ownerName || ""} onChange={(e) => updateBlock(block.id, { ownerName: e.target.value })} />
                        </div>
                        <ContractImageUpload value={block.ownerImageUrl || ""} onChange={(url) => updateBlock(block.id, { ownerImageUrl: url })} label="Attach owner signature" />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {activeTemplate.blocks.length === 0 && (
              <div style={{ border: "1px dashed var(--line-strong)", borderRadius: 10, padding: 24, textAlign: "center", color: "var(--ink-3)" }}>
                No blocks yet. Add a header, paragraph, image, or signature block.
              </div>
            )}
          </div>

          <div className="contract-settings-aside">
            <div className="contract-settings-aside-sticky">
              <div>
                <h3 style={{ margin: "0 0 10px", fontSize: 14 }}>Live preview ({activeTab === "business" ? "Business" : "Social"})</h3>
                <ContractDocumentView settings={activeTemplate} tokenMap={previewTokenMap} variant={activeTab} />
              </div>
              <div className="contract-settings-block-card">
                <h3 style={{ margin: "0 0 8px", fontSize: 14 }}>Dynamic Fields List</h3>
                <p style={{ margin: "0 0 10px", fontSize: 12, color: "var(--ink-3)" }}>
                  Type these tokens in header fields or paragraph content (including inside formatted text and tables). They are replaced from the Progress List record when the contract is generated / signed.
                </p>
                <div style={{ columns: 1, fontSize: 12, lineHeight: 1.55, maxHeight: 280, overflow: "auto" }}>
                  {(dynamicFields.length ? dynamicFields : [
                    ["{{Client_Name}}", "Name of Client"],
                    ["{{Space}}", "Selected space"],
                    ["{{Booking_Start_datetime}}", "Starting date/time"],
                    ["{{Cost_Breakdown}}", "Full cost breakdown"],
                    ["{{Item_Details}}", "Selected item lines"],
                    ["{{Total}}", "Contract total"],
                  ]).map(([token, desc]) => (
                    <div key={token}><b>{token}</b> = {desc}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function buildSignedContractHtml(settings, tokenMap, signatures) {
  const contract = coerceContractTemplate(settings);
  const escape = escapeHtmlText;
  const tableStyles = [
    "body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;font-size:12px;line-height:1.5;color:#212529}",
    "table{width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:12px;border:none}",
    "th,td{border:none;padding:1px 4px 1px 0;vertical-align:top;text-align:left;background:transparent}",
    "table[data-bordered='1']{width:100%!important;table-layout:fixed;margin:12px 0 16px}",
    "table[data-bordered='1'] th,table[data-bordered='1'] td{border:1px solid #212529;padding:8px 10px;vertical-align:middle;text-align:center}",
    "table[data-bordered='1'] td:first-child,table[data-bordered='1'] th:first-child{text-align:left;font-weight:700;width:18%}",
    "th{font-weight:700}",
    "p{margin:0 0 8px;line-height:1.5}",
    "ul,ol{margin:4px 0 8px 1.4em;padding:0}",
    "li{margin:2px 0}",
  ].join("");
  const parts = [`<h1>${escape(contract.title)}</h1>`];
  (contract.blocks || []).forEach((block) => {
    if (block.type === "header") {
      (block.fields || []).forEach((field) => {
        parts.push(`<p><strong>${escape(field.label)}:</strong> ${escape(fillContractTokens(field.value, tokenMap))}</p>`);
      });
    } else if (block.type === "paragraph") {
      if (block.title) parts.push(`<h2>${escape(fillContractTokens(block.title, tokenMap))}</h2>`);
      parts.push(`<div>${contractBodyDisplayHtml(block.body, tokenMap)}</div>`);
    } else if (block.type === "image" && block.url) {
      parts.push(`<p><img src="${escape(block.url)}" alt="${escape(block.alt)}" style="max-width:100%"/></p>`);
    } else if (block.type === "signature") {
      const url = signatures[block.id] || (block.role === "owner" ? block.ownerImageUrl : "");
      parts.push(`<h3>${escape(block.label)}</h3>`);
      if (url) parts.push(`<p><img src="${escape(url)}" alt="signature" style="max-width:280px;max-height:120px"/></p>`);
      if (block.ownerName) parts.push(`<p>${escape(block.ownerName)}</p>`);
    }
  });
  return `<!doctype html><html><head><meta charset="utf-8"/><style>${tableStyles}</style></head><body style="font-family:Georgia,serif;padding:24px;color:#111;line-height:1.55">${parts.join("")}</body></html>`;
}

export function ContractLoadingView({ steps = [] }) {
  const total = steps.length || 1;
  const done = steps.filter((step) => step.done).length;
  const percent = Math.max(8, Math.round((done / total) * 100));
  return (
    <div className="contract-loading" role="status" aria-live="polite" aria-busy="true">
      <div className="contract-loading-card">
        <div className="contract-loading-spinner" aria-hidden="true" />
        <h2>Preparing your contract…</h2>
        <div className="contract-loading-bar" aria-hidden="true">
          <div className="contract-loading-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <ul className="contract-loading-steps">
          {steps.map((step) => (
            <li key={step.label} className={step.done ? "done" : ""}>
              <span className="contract-loading-dot" aria-hidden="true">{step.done ? "✓" : ""}</span>
              {step.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ContractSignView({ record, siteSettings, tokenMap: liveTokenMap = {}, onSigned, onError }) {
  const snapshot = record?.progress?.contractSnapshot;
  const eventType = record?.request?.eventType || liveTokenMap?.["{{Event_Type}}"] || snapshot?.tokenMap?.["{{Event_Type}}"] || "";
  const variant = snapshot?.variant || resolveContractVariant(eventType, siteSettings?.contractSettings);
  const contract = snapshot?.settings
    ? coerceContractTemplate(snapshot.settings, variant)
    : getContractTemplate(siteSettings?.contractSettings, variant);
  const tokenMap = snapshot?.tokenMap ? { ...liveTokenMap, ...snapshot.tokenMap } : liveTokenMap;
  const [signatures, setSignatures] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const status = record?.progress?.contract || "Not Generated";
  const alreadySigned = record?.progress?.agreement === "Signed";
  const canSign = !alreadySigned && (status === "Generated" || status === "Sent");

  const clientBlocks = (contract.blocks || []).filter((block) => block.type === "signature" && block.role === "client" && block.required !== false);
  const missing = clientBlocks.filter((block) => !signatures[block.id]);

  const setSignature = (blockId, dataUrl) => setSignatures((prev) => ({ ...prev, [blockId]: dataUrl }));

  const submit = async () => {
    if (!canSign || missing.length || submitting) return;
    setSubmitting(true);
    setMessage("");
    try {
      const uploadedSignatures = {};
      for (const [blockId, dataUrl] of Object.entries(signatures)) {
        uploadedSignatures[blockId] = await uploadDataUrlImage(dataUrl, `signature-${blockId}.png`, "collaburo/signatures");
      }
      (contract.blocks || []).forEach((block) => {
        if (block.type === "signature" && block.role === "owner" && block.ownerImageUrl) {
          uploadedSignatures[block.id] = block.ownerImageUrl;
        }
      });
      const html = buildSignedContractHtml(contract, tokenMap, uploadedSignatures);
      const htmlDataUrl = `data:text/html;base64,${btoa(unescape(encodeURIComponent(html)))}`;
      let agreementFile = null;
      try {
        const agreementUrl = await uploadDataUrlImage(htmlDataUrl, `contract-${record.bookingCode || record.id}.html`, "collaburo/contracts");
        agreementFile = { name: `Signed Contract ${record.bookingCode || record.id}.html`, url: agreementUrl, type: "text/html" };
      } catch {
        agreementFile = { name: `Signed Contract ${record.bookingCode || record.id}.html`, url: htmlDataUrl, type: "text/html" };
      }

      const response = await fetch("/api/contracts/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          recordId: record.id || record.bookingCode,
          baseRecord: record,
          signatures: uploadedSignatures,
          agreementFile,
          signedHtml: html,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Could not submit signed contract.");
      if (data.record?.id) {
        try {
          await fetch("/api/submissions", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "update-progress-record", record: data.record }),
          });
        } catch {
          // Best-effort sync for memory-mode local dev.
        }
      }
      setMessage("Contract submitted successfully. A copy will be emailed shortly.");
      onSigned && onSigned(data.record || null);
    } catch (error) {
      const text = error.message || "Could not submit signed contract.";
      setMessage(text);
      onError && onError(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!record) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>Contract unavailable</h1>
          <p style={{ color: "var(--ink-3)" }}>This booking could not be found, or the record link is no longer available.</p>
        </div>
      </div>
    );
  }

  if (!canSign) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 480, textAlign: "center" }}>
          <h1 style={{ marginTop: 0 }}>{alreadySigned ? "Already signed" : "Contract unavailable"}</h1>
          <p style={{ color: "var(--ink-3)" }}>
            {alreadySigned
              ? "This booking agreement has already been signed."
              : `This contract link is not ready yet (contract status: ${status}). Ask the venue to generate and send the contract first.`}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff", padding: "16px 12px 140px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: 10, color: "#6c757d", fontSize: 12 }}>
          Booking {record.bookingCode || record.id} · {record.client?.name || "Client"}
        </div>
        <ContractDocumentView
          settings={contract}
          tokenMap={tokenMap}
          signatures={signatures}
          interactive
          showTitle={false}
          onSignatureChange={setSignature}
          variant={variant}
        />
        {message ? <div style={{ marginTop: 12, color: message.includes("success") ? "var(--ok, #1a7f37)" : "var(--danger)" }}>{message}</div> : null}
      </div>
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, background: "#fff", borderTop: "1px solid var(--line)", padding: "12px 16px", display: "flex", justifyContent: "center", gap: 12 }}>
        <button
          type="button"
          className="btn dark"
          disabled={submitting || missing.length > 0}
          onClick={submit}
          style={{ minWidth: 220 }}
        >
          {submitting ? "Submitting…" : "Submit Signed Contract"}
        </button>
      </div>
    </div>
  );
}

export { CONTRACT_BLOCK_TYPES, fillContractTokens, buildSignedContractHtml, normalizeContractTemplate };
