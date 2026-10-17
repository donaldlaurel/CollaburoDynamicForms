/**
 * Extract legacy contract_s.php / contract_b.php → default template JS modules.
 * Run: "C:\Program Files\nodejs\node.exe" scripts/extract-legacy-contract.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPACE_ROOT = path.resolve(__dirname, "../../collaburo_space");
const OUT_DIR = path.resolve(__dirname, "../components/html-source");

function between(hay, a, b) {
  const i = hay.indexOf(a);
  if (i < 0) return "";
  const from = i;
  const j = b ? hay.indexOf(b, from + a.length) : hay.length;
  return hay.slice(from, j < 0 ? hay.length : j).trim();
}

function scrubLegacyChrome(fragment = "") {
  return String(fragment || "")
    .replace(/<\/?center>/gi, (tag) => (tag.toLowerCase().includes("/") ? "</div>" : '<div style="text-align:center">'))
    .replace(/<\/?div class="form-group">/gi, "")
    .replace(/<\/?div class="pagebreak"[^>]*>/gi, "")
    .replace(/<\/?div class="signature_div">/gi, "")
    .replace(/<\/?div class="moh_signature"[^>]*>/gi, "")
    .replace(/<\/?div class="client_signature"[^>]*>/gi, "")
    .replace(/<\/?span[^>]*>/gi, "")
    .replace(/<\/?a[^>]*>/gi, "")
    .replace(/<\/?button[^>]*>[\s\S]*?<\/button>/gi, "")
    .replace(/\s*style="page-break-before:\s*always"/gi, "")
    .replace(/(<\/?h[1-6][^>]*>)\s*\1/gi, "$1")
    .replace(/<\/u><\/h5><\/div>/gi, "</u></h5>")
    .replace(/<\/strong><\/strong>/gi, "</strong>")
    .replace(/<strong><\/strong>/gi, "")
    .replace(/<\/u><\/u>/gi, "</u>")
    .replace(/<\/div>\s*<br\/>\s*<div style="text-align:center">/gi, '<div style="text-align:center">')
    .replace(/^<\/div>/i, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function finalPolish(fragment = "") {
  return String(fragment || "")
    .replace(/<\/strong><\/strong>/gi, "</strong>")
    .replace(/<strong>WHEREAS:<\/strong><\/strong>/gi, "<strong>WHEREAS:</strong>")
    .replace(/<strong>BETWEEN<\/strong><\/strong>/gi, "<strong>BETWEEN</strong>")
    .replace(/<\/div>\s*<\/div>/gi, "</div>")
    .replace(/(?:^|>)\s*<\/div>/g, ">")
    .replace(/<div style="text-align:center">\s*<\/div>/gi, "")
    .trim();
}

function stripPhpToHtml(src) {
  let html = src.replace(/<\?(?:php)?[\s\S]*?\?>/gi, (block) => {
    const b = block;
    if (/echo\s+\$client_fullname/.test(b) || /echo\s+\$client_name/.test(b)) {
      return "{{Client_Display_Name}}";
    }
    if (/datenow_day_formatted/.test(b)) return "{{Agreement_Day}}";
    if (/datenow_mon/.test(b) && /datenow_year/.test(b)) return "{{Agreement_Month_Year}}";
    if (/datenow_hour/.test(b) && /datenow_min/.test(b)) return "{{Agreement_Time}}";
    if (/lwr_day_formatted|iww_day_formatted/.test(b)) return "{{Agreement_Day}}";
    if (/echo\s+\$lwr_mon|echo\s+\$iww_mon/.test(b)) return "{{Agreement_Month}}";
    if (/echo\s+\$lwr_year|echo\s+\$iww_year/.test(b)) return "{{Agreement_Year}}";
    if (/\$event_type_description|\$brief_desc_event/.test(b)) return "{{Event_Description}}";
    if (/\$noof_attendees|\$exp_noofattendees/.test(b)) return "{{Expected_Number_of_Attendees}}";
    if (/bookingstartdate_month/.test(b)) return "{{Booking_Start_datetime}}";
    if (/bookingenddate_month/.test(b)) return "{{Booking_end_datetime}}";
    if (/\$floorlayout/.test(b)) return "{{Layout_Selections}}";
    if (/nl2br\(\$layoutinstruction/.test(b)) return "{{Floor_Layout_Instructions}}";
    if (/nl2br\(\$blackboard/.test(b)) return "{{Blackboard_Sign_Message}}";
    if (/nl2br\(\$buffetlayout/.test(b)) return "{{Buffet_Layout_Instructions}}";
    if (/nl2br\(\$stagelayout/.test(b)) return "{{Stage_Layout_Instructions}}";
    if (/special_notes/.test(b)) return "{{Special_Notes}}";
    if (/\$space_other_input|\$event_other_input/.test(b)) return "{{Space_Other}}";
    if (/number_format\(\(float\)\$space_rental_total/.test(b)) return "{{Space_Rental_Total}}";
    if (/number_format\(\(float\)\$space_content_total/.test(b)) return "{{Space_Content_Total}}";
    if (/number_format\(\(float\)\$space_extra_total/.test(b)) return "{{Space_Extra_Total}}";
    if (/number_format\(\(float\)\$catering_cost_total/.test(b)) return "{{Catering_Total}}";
    if (/number_format\(\(float\)\$setup_service_total/.test(b)) return "{{Setup_Total}}";
    if (/number_format\(\(float\)\$eventservicescosttotal/.test(b)) return "{{Event_Service_Total}}";
    if (/number_format\(\(float\)\$clearup_service_total/.test(b)) return "{{Cleanup_Total}}";
    if (/number_format\(\(float\)\$discount/.test(b)) return "{{Discount_Total}}";
    if (/number_format\(\(float\)\$addon_discount/.test(b)) return "{{Additional_Discount}}";
    if (/number_format\(\(float\)\$subtotal/.test(b)) return "{{Subtotal}}";
    if (/number_format\(\(float\)\$tax/.test(b)) return "{{Fees_Total}}";
    if (/id=\"summarytotal\"|number_format\(\(float\)\$total/.test(b)) return "{{Total}}";
    if (/damagewaiverrefundabletotal|\$space_damagewaiver_total/.test(b)) return "{{Security_Deposit}}";
    if (/damagewaivertotal|\$overallTotal/.test(b)) return "{{Total_With_Deposit}}";
    if (/contract_annotate_total_space_rental|\$space_rental_items/.test(b)) return "{{Space_Lines}}";
    if (/space_contents_display|\$space_contents/.test(b)) return "{{Item_Details}}";
    if (/\$catering_block|\$catering/.test(b)) return "{{Catering_Specifics}}";
    if (/\$tech_questions/.test(b)) return "{{Tech_Questions}}";
    if (/\$discount_notes/.test(b)) return "{{Discount_Notes}}";
    if (/collaburo_multidates_contract_html/.test(b)) return "{{Multi_Day_Details}}";
    if (/collaburo_multidates_days_label/.test(b)) return "";
    if (/\$space_rental_rooms/.test(b)) return "{{Space_Rental_Rooms_Label}}";
    if (/mohammad_signature|sig1Url|sig2Url|openModal|insert_sig|isDraft|Waiting for Signature/.test(b)) return "";
    if (/checked|oneTimeEvent|is_all_empty|everything_is_empty|ob_start|include_once|floatVal|contract_compute|contract_space|contract_annotate|contract_resolve|mysqli|prefix|GET\[/.test(b)) return "";
    if (/echo\s+['\"]/.test(b)) {
      const m = b.match(/echo\s+['\"]([\s\S]*?)['\"]\s*;/);
      if (m) return m[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
    }
    return "";
  });

  html = html.replace(/<\?(?:php)?[\s\S]*$/gi, "");
  html = html.replace(
    /<div class="form-check"[^>]*>[\s\S]*?<label[^>]*>([\s\S]*?)<\/label>[\s\S]*?<\/div>/gi,
    (_m, label) => {
      const text = String(label)
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return `<div style="margin-left:50px">☐ ${text}</div>`;
    }
  );
  html = html.replace(/<input[\s\S]*?>/gi, "");
  html = html.replace(/<\/?br\s*\/?>/gi, "<br/>");
  html = html.replace(/\n{3,}/g, "\n\n");
  return html;
}

function buildTemplatePayload(html, versionLabel) {
  const agreementTitle = "Event Space Rental Agreement at Collabüro";
  const waiverMarker = "Liability Waiver & Release";
  const addendumMarker = ">Addendum<";
  const versionMarker = versionLabel;

  const agreementHtml = between(html, agreementTitle, waiverMarker);
  const waiverHtml = between(html, waiverMarker, addendumMarker);
  let addendumHtml = scrubLegacyChrome(between(html, addendumMarker, versionMarker));
  if (addendumHtml) {
    addendumHtml = addendumHtml
      .replace(/^>Addendum<\/h4><\/div>/i, "")
      .replace(/^Addendum<\/h4><\/div>/i, "")
      .replace(/<strong><i>This list of information is extensive[\s\S]*?<\/i><\/strong>/i, "")
      .replace(/<p><em>This list of information is extensive[\s\S]*?<\/em><\/p>/i, "")
      .trim();
    addendumHtml = `<h4 style="text-align:center">Addendum</h4>\n${addendumHtml}\n<p><em>This list of information is extensive but in no way exhaustive and will be updated as new issues are brought to our attention or need explanation.</em></p><p>${versionLabel}</p>`;
  }

  let agreementBody = scrubLegacyChrome(agreementHtml);
  agreementBody = agreementBody
    .replace(/^[\s\S]*?Event Space Rental Agreement at Collabüro[\s\S]*?(?=<p>|<strong>THIS AGREEMENT)/i, "")
    .trim();
  agreementBody = `<h5 style="text-align:center"><u>${agreementTitle}</u></h5>\n${agreementBody}`;

  agreementBody = agreementBody.replace(
    /<h3[^>]*>Summary of Details:<\/h3>[\s\S]*?(?=<strong>Rental<\/strong>)/i,
    `<h3 style="font-weight:bold">Summary of Details:</h3>
<div style="margin-left:15px">
<p>Layout Instructions - The agreed on layout is <strong><u>{{Layout_Selections}}</u></strong> with the following special instructions:</p>
<p><strong>Floor Layout Instructions:</strong><br/>{{Floor_Layout_Instructions}}</p>
<p><strong>Stage Layout Instructions:</strong><br/>{{Stage_Layout_Instructions}}</p>
<p><strong>Buffet Layout Instructions and placement:</strong><br/>{{Buffet_Layout_Instructions}}</p>
<p><strong>Blackboard Sign Message:</strong><br/>{{Blackboard_Sign_Message}}</p>
<p><strong>Total Space Rental (including set-up, tear down, and clean-up) - Total: {{Space_Rental_Total}}</strong><br/>{{Space_Lines}}</p>
<p><strong>Space Contents List (including ones to be charged for) - Total: {{Space_Content_Total}}</strong><br/>{{Item_Details}}</p>
<p><strong>Catering Specifics - Total {{Catering_Total}} :</strong><br/>{{Catering_Specifics}}</p>
<p>{{Tech_Questions}}</p>
<p><strong>Special Notes:</strong><br/>{{Special_Notes}}</p>
</div>
<table border="0" style="width:100%">
<tr><td colspan="2"><h3 style="font-weight:bold">Summary of Cost:</h3></td></tr>
<tr><td colspan="2"><strong>Total Quote:</strong></td></tr>
<tr><td>Space Rental {{Space_Rental_Rooms_Label}}</td><td style="text-align:right">{{Space_Rental_Total}}</td></tr>
<tr><td>Space Content Rentals</td><td style="text-align:right">{{Space_Content_Total}}</td></tr>
<tr><td>Space Extra Costs</td><td style="text-align:right">{{Space_Extra_Total}}</td></tr>
<tr><td>Catering Cost: (price not guaranteed until invoiced by caterer)</td><td style="text-align:right">{{Catering_Total}}</td></tr>
<tr><td>Set up Service Cost:</td><td style="text-align:right">{{Setup_Total}}</td></tr>
<tr><td>Event Service Cost:</td><td style="text-align:right">{{Event_Service_Total}}</td></tr>
<tr><td>Clear up Service Cost:</td><td style="text-align:right">{{Cleanup_Total}}</td></tr>
<tr><td>Discount:</td><td style="text-align:right">{{Discount_Total}}</td></tr>
<tr><td>Subtotal:</td><td style="text-align:right">{{Subtotal}}</td></tr>
<tr><td>Tax (13%)</td><td style="text-align:right">{{Fees_Total}}</td></tr>
<tr><td><strong>Total:</strong></td><td style="text-align:right"><strong>{{Total}}</strong></td></tr>
<tr><td>Security Deposit (refundable):</td><td style="text-align:right">{{Security_Deposit}}</td></tr>
<tr><td>Total with Security Deposit:</td><td style="text-align:right">{{Total_With_Deposit}}</td></tr>
</table>
`
  );

  agreementBody = agreementBody.replace(
    /made this[\s\S]*?EST/i,
    `made this <u><strong>{{Agreement_Day}}</strong></u> day of <strong><u>{{Agreement_Month_Year}}</u></strong> at <strong><u>{{Agreement_Time}}</u></strong> EST`
  );

  agreementBody = agreementBody.replace(
    /\(the "Client","you" or "your"\)[\s\S]*?WHEREAS:/i,
    `(the "Client","you" or "your")</p>
<p><strong>WHEREAS:</strong>`
  );

  if (!agreementBody.includes("{{Client_Display_Name}}")) {
    agreementBody = agreementBody.replace(
      /\(the "Organisation"\) and/i,
      `(the "Organisation") and<br/><strong><u>{{Client_Display_Name}}</u></strong><br/>`
    );
  }

  let waiverBody = scrubLegacyChrome(waiverHtml)
    .replace(/^Liability Waiver & Release<\/h4>/i, "")
    .trim();
  waiverBody = `<h4 style="text-align:center">Liability Waiver & Release</h4>\n${waiverBody}`;
  waiverBody = waiverBody.replace(
    /made this[\s\S]*?BETWEEN/i,
    `made this <b><u>{{Agreement_Day}}</u></b> day of <b><u>{{Agreement_Month}}</u></b>, <b><u>{{Agreement_Year}}</u></b><br/><br/><strong>BETWEEN</strong>`
  );
  waiverBody = waiverBody.replace(
    /IN WITNESS WHEREOF[\s\S]*?Client Name and Signature/i,
    `IN WITNESS WHEREOF the Client and Event Space Provider have duly affixed their signatures on this <b><u>{{Agreement_Day}}</u></b> day of <b><u>{{Agreement_Month}}</u></b>, <b><u>{{Agreement_Year}}</u></b><br/><br/><u>{{Client_Display_Name}}</u><br/>Client Name and Signature`
  );
  if (!waiverBody.includes("{{Client_Display_Name}}")) {
    waiverBody = waiverBody.replace(
      /\(the “Client \/ Renter”\)/i,
      `<br/><b><u>{{Client_Display_Name}}</u></b><br/>(the “Client / Renter”)`
    );
  }
  waiverBody = waiverBody.replace(
    /following event:[\s\S]*?Expected number/i,
    `following event: <u>{{Event_Description}}</u><br/><br/>Expected number`
  );
  waiverBody = waiverBody.replace(
    /Expected number of people attending the event:[\s\S]*?\./i,
    `Expected number of people attending the event: <u>{{Expected_Number_of_Attendees}}</u>.`
  );

  agreementBody = finalPolish(agreementBody);
  waiverBody = finalPolish(waiverBody);
  addendumHtml = finalPolish(addendumHtml);

  return {
    title: agreementTitle,
    blocks: [
      { id: "blk_agreement", type: "paragraph", title: "", body: agreementBody, allowTokens: true },
      {
        id: "blk_owner_sig",
        type: "signature",
        role: "owner",
        label: "Collabüro (Organisation)",
        required: true,
        ownerImageUrl: "https://collaburo.space/images/mohammad_signature.png",
        ownerName: "Mohamad Dourou — Managing Director",
      },
      { id: "blk_client_sig", type: "signature", role: "client", label: "Authorized Person from the Client", required: true },
      { id: "blk_waiver", type: "paragraph", title: "", body: waiverBody, allowTokens: true },
      {
        id: "blk_client_sig2",
        type: "signature",
        role: "client",
        label: "Client Name and Signature (Liability Waiver)",
        required: true,
      },
      { id: "blk_addendum", type: "paragraph", title: "", body: addendumHtml, allowTokens: true },
    ],
    _meta: {
      agreementLen: agreementBody.length,
      waiverLen: waiverBody.length,
      addendumLen: addendumHtml.length,
    },
  };
}

function extractOne({ phpFile, outFile, exportName, versionLabel }) {
  const phpPath = path.join(SPACE_ROOT, phpFile);
  const outPath = path.join(OUT_DIR, outFile);
  const src = fs.readFileSync(phpPath, "utf8");
  const lines = src.split(/\r?\n/);
  const start = lines.findIndex((l) => l.includes("Event Space Rental Agreement at Collab"));
  const end = lines.findIndex((l, i) => i > start && l.includes(versionLabel));
  if (start < 0 || end < 0) {
    console.error(`Could not find contract bounds in ${phpFile}`, { start, end, versionLabel });
    process.exit(1);
  }
  const chunk = lines.slice(start, end + 1).join("\n");
  const html = stripPhpToHtml(chunk);
  const payload = buildTemplatePayload(html, versionLabel);
  const { _meta, ...template } = payload;
  const file = `/* Auto-generated from collaburo_space/${phpFile} — re-run scripts/extract-legacy-contract.mjs */
export function ${exportName}() {
  return ${JSON.stringify(template, null, 2)};
}
`;
  fs.writeFileSync(outPath, file, "utf8");
  console.log("Wrote", outPath, _meta);
}

extractOne({
  phpFile: "contract_s.php",
  outFile: "contract-legacy-default.js",
  exportName: "createLegacyContractSettings",
  versionLabel: "Version: 16th August 2024",
});

extractOne({
  phpFile: "contract_b.php",
  outFile: "contract-legacy-business-default.js",
  exportName: "createLegacyBusinessContractSettings",
  versionLabel: "Version: 4th September 2024",
});
