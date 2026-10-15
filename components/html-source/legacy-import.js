// Converts the old Collaburo site's MySQL dump into progress records for this app.
// Runs in the browser: the dump is 100+ MB, which is over the Workers request
// limit, so only the converted records are sent to /api/legacy-import.
// Keep the mapping in sync with scripts/legacy-import/convert-legacy-dump.ps1.

const WANTED_TABLES = ["addrentalprogress", "contract"];
const READ_CHUNK_BYTES = 4 * 1024 * 1024;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MYSQL_ESCAPES = { n: "\n", r: "\r", t: "\t", 0: "", Z: "", b: "\b" };

// ---------------------------------------------------------------------------
// Dump parsing
// ---------------------------------------------------------------------------

function decodeHex(hex = "") {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  return new TextDecoder("utf-8").decode(bytes);
}

// Streaming parser for the `(...), (...);` tuple list of one INSERT statement.
function createValuesParser(onRow) {
  let inTuple = false;
  let inString = false;
  let escaped = false;
  let quoted = false;
  let value = "";
  let row = [];
  let done = false;
  const finishValue = () => {
    if (quoted) row.push(value);
    else if (value === "NULL") row.push(null);
    else if (/^0x/i.test(value)) row.push(decodeHex(value.slice(2)));
    else row.push(value);
    value = "";
    quoted = false;
  };
  return {
    get done() {
      return done;
    },
    feed(text) {
      for (let i = 0; i < text.length && !done; i += 1) {
        const ch = text[i];
        if (inString) {
          if (escaped) {
            value += MYSQL_ESCAPES[ch] ?? ch;
            escaped = false;
          } else if (ch === "\\") {
            escaped = true;
          } else if (ch === "'") {
            if (text[i + 1] === "'") {
              value += "'";
              i += 1;
            } else {
              inString = false;
            }
          } else {
            value += ch;
          }
          continue;
        }
        if (!inTuple) {
          if (ch === "(") {
            inTuple = true;
            row = [];
            value = "";
            quoted = false;
          } else if (ch === ";") {
            done = true;
          }
          continue;
        }
        if (ch === "'") {
          inString = true;
          quoted = true;
        } else if (ch === ",") {
          finishValue();
        } else if (ch === ")") {
          finishValue();
          inTuple = false;
          onRow(row);
        } else if (ch !== " " && ch !== "\n" && ch !== "\r" && ch !== "\t") {
          value += ch;
        }
      }
    },
  };
}

export async function parseLegacyDump(file, { onProgress } = {}) {
  const tables = Object.fromEntries(WANTED_TABLES.map((table) => [table, []]));
  const createColumns = {};
  let createTable = null;
  let activeParser = null;
  let mismatchedRows = 0;

  const handleLine = (line) => {
    if (activeParser) {
      activeParser.feed(line + "\n");
      if (activeParser.done) activeParser = null;
      return;
    }
    if (createTable) {
      if (line.startsWith(")")) {
        createTable = null;
        return;
      }
      const column = line.match(/^\s*`([^`]+)`\s/);
      if (column) createColumns[createTable].push(column[1]);
      return;
    }
    const create = line.match(/^CREATE TABLE (?:IF NOT EXISTS )?`([^`]+)`/i);
    if (create) {
      if (WANTED_TABLES.includes(create[1])) {
        createTable = create[1];
        createColumns[createTable] = [];
      }
      return;
    }
    const insert = line.match(/^INSERT INTO `([^`]+)`\s*(?:\(([^)]*)\))?\s*VALUES\s*/i);
    if (!insert || !WANTED_TABLES.includes(insert[1])) return;
    const table = insert[1];
    const columns = insert[2]
      ? insert[2].split(",").map((column) => column.trim().replace(/`/g, ""))
      : createColumns[table] || [];
    activeParser = createValuesParser((values) => {
      if (values.length !== columns.length) {
        mismatchedRows += 1;
        return;
      }
      const row = {};
      columns.forEach((column, index) => {
        row[column] = values[index];
      });
      tables[table].push(row);
    });
    activeParser.feed(line.slice(insert[0].length) + "\n");
    if (activeParser.done) activeParser = null;
  };

  const decoder = new TextDecoder("utf-8");
  let carry = "";
  for (let offset = 0; offset < file.size; offset += READ_CHUNK_BYTES) {
    const buffer = await file.slice(offset, offset + READ_CHUNK_BYTES).arrayBuffer();
    const isLast = offset + READ_CHUNK_BYTES >= file.size;
    const lines = (carry + decoder.decode(buffer, { stream: !isLast })).split("\n");
    carry = lines.pop();
    for (const line of lines) handleLine(line.endsWith("\r") ? line.slice(0, -1) : line);
    onProgress?.(Math.min(1, (offset + READ_CHUNK_BYTES) / file.size));
  }
  if (carry) handleLine(carry);

  if (!tables.addrentalprogress.length) {
    throw new Error("No bookings found. Choose the .sql export of the old Collaburo database (it must contain the addrentalprogress table).");
  }
  return { bookings: tables.addrentalprogress, contracts: tables.contract, mismatchedRows };
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

const text = (value) => (value === null || value === undefined ? "" : String(value).trim());

function money(value) {
  const number = Number(text(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? Math.round(number * 100) / 100 : 0;
}

const yesNo = (value) => (/^(yes|on|1|true)$/i.test(text(value)) ? "Yes" : "No");
const pad2 = (value) => String(value).padStart(2, "0");

function parseBookingDate(value) {
  const match = text(value).replace(/\s+/g, " ").match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?: (\d{1,2}):(\d{2}) ?([ap]m))?$/i);
  if (!match) return null;
  const [, month, day, year, hour12 = "12", minute = "00", meridiem = "am"] = match;
  const hour = (Number(hour12) % 12) + (/pm/i.test(meridiem) ? 12 : 0);
  return {
    year: Number(year),
    sortKey: `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${minute}`,
    label: `${MONTHS[Number(month) - 1]} ${pad2(day)}, ${year} ${pad2(hour % 12 || 12)}:${minute} ${hour >= 12 ? "pm" : "am"}`,
  };
}

// Same hash as bookingCodeFromId() in collaburo-html-app.jsx.
function bookingCodeFromId(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = ((hash * 31) + id.charCodeAt(i)) >>> 0;
  return `B${hash.toString(36).toUpperCase().padStart(5, "0").slice(-5)}`;
}

function columnLabel(column) {
  return column
    .replace(/^(mh|lr|sr)_/, "")
    .split("_")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

const SPACES = { mh: "Main Hall", lr: "Large Room", sr: "Small Room" };
const EXTRA_SPACES = { la_space: "Lounge Area", ea_space: "Elevated Area", bs_space: "Back Patio" };
const STATUS_MAP = {
  paid: "Paid",
  lost: "Cancelled",
  active: "In Discussion",
  hot: "In Discussion",
  "initiated contact": "Initiated Contact",
  "not contacted": "Not Contacted",
};
const INSURANCE_MAP = {
  "obtained duuo": "Obtained DUUO",
  "client has own": "Client has own",
  "not required": "Not Required",
  "not received": "Not Received",
};
const SOURCE_MAP = {
  returningclient: "Returning Client",
  facebook: "Social Media",
  instagram: "Social Media",
  walkin: "Walk-In",
  weddingwire: "Wedding Wire",
};

// Columns mapped to dedicated fields; every other filled-in column is listed
// under "Old booking details" in adminSections.specialNotes.
const MAPPED_COLUMNS = new Set([
  "id", "uniqueid", "requesteddate", "clientname", "lastname", "organization", "email", "phonenumber",
  "notforprofit", "studentbody", "interestlevel", "eventprivacy", "eventtype", "brief_desc_event", "alcoholserved",
  "exp_noofattendees", "exp_guestarrtime", "mh_space", "lr_space", "sr_space", "la_space", "ea_space", "bs_space",
  "mh_booking_start_date", "mh_booking_end_date", "lr_booking_start_date", "lr_booking_end_date",
  "sr_booking_start_date", "sr_booking_end_date", "internal_notes", "record_issues", "status", "source",
  "agreement", "insurance", "agco_license", "damage_waiver", "damage_waiver_custom", "damage_waiverrefund",
  "infocomplete", "lockform_user", "record_accesslink", "duuoeventtype", "catering", "catering_delivery_time",
  "setupservices", "clearupservices", "thirdpartyrentals", "age_status_new", "age_status_past", "generateBtnClick",
  "mh_layout_floorlayoutinstruction", "mh_layout_buffetlayoutinstructions", "mh_layout_stagelayoutinstructions",
  "lr_layout_floorlayoutinstruction", "lr_layout_buffetlayoutinstructions",
  "sr_layout_floorlayoutinstruction", "sr_layout_buffetlayoutinstructions",
]);

// ---------------------------------------------------------------------------
// Conversion
// ---------------------------------------------------------------------------

function convertBooking(row, contract, importedAtLabel) {
  const oldId = text(row.id);
  const id = `legacy_${oldId}`;

  const spaceNames = [];
  const dateSegments = [];
  let earliest = null;
  Object.entries(SPACES).forEach(([prefix, spaceName]) => {
    const start = parseBookingDate(row[`${prefix}_booking_start_date`]);
    const end = parseBookingDate(row[`${prefix}_booking_end_date`]);
    if (text(row[`${prefix}_space`]) || start) spaceNames.push(spaceName);
    if (!start) return;
    if (!earliest || start.sortKey < earliest.sortKey) earliest = start;
    dateSegments.push(`${spaceName}: ${start.label}${end ? ` - ${end.label}` : ""}`);
  });
  Object.entries(EXTRA_SPACES).forEach(([column, spaceName]) => {
    const value = text(row[column]);
    if (value && value !== "0") spaceNames.push(spaceName);
  });

  const oldStatus = text(row.status);
  const status = STATUS_MAP[oldStatus.toLowerCase()] || oldStatus || "In Discussion";
  const interestLevel = text(row.interestlevel) || (oldStatus === "Hot" ? "Hot" : "");

  let securityDepositCost = text(row.damage_waiver) || "TBD";
  if (securityDepositCost === "Custom Amount" && text(row.damage_waiver_custom)) securityDepositCost = `$${text(row.damage_waiver_custom)}`;
  const insuranceStatus = INSURANCE_MAP[text(row.insurance).toLowerCase()] || "Not Received";
  const agcoLicenseStatus = text(row.agco_license) || "Not Received";
  const agreement = text(row.agreement) === "Signed" ? "Signed" : "Not Signed";
  const source = SOURCE_MAP[text(row.source).replace(/[\s-]/g, "").toLowerCase()] || text(row.source);
  const attendees = text(row.exp_noofattendees);

  const instructions = [];
  Object.entries(SPACES).forEach(([prefix, spaceName]) => {
    ["floorlayoutinstruction", "buffetlayoutinstructions", "stagelayoutinstructions"].forEach((kind) => {
      const value = text(row[`${prefix}_layout_${kind}`]);
      if (value) instructions.push(`${spaceName} - ${columnLabel(kind)}: ${value}`);
    });
  });

  const details = [];
  Object.keys(row).sort().forEach((column) => {
    if (MAPPED_COLUMNS.has(column)) return;
    const value = text(row[column]);
    if (!value || value === "0" || value === "0000-00-00") return;
    const prefix = column.split("_")[0];
    details.push(`${SPACES[prefix] ? `${SPACES[prefix]} - ` : ""}${columnLabel(column)}: ${value}`);
  });

  const costs = {
    spaceRentalTotal: 0, spaceContentTotal: 0, cateringTotal: 0, setupTotal: 0, eventTotal: 0, cleanupTotal: 0,
    subtotal: 0, feeLines: [], total: 0, securityDeposit: 0, totalWithDeposit: 0,
    spaceLines: [], spaceContentLines: [], cateringLines: [], setupLines: [], eventLines: [], cleanupLines: [],
  };
  if (contract) {
    costs.spaceRentalTotal = money(contract.space_rental_total);
    costs.spaceContentTotal = money(contract.space_content_total);
    costs.setupTotal = money(contract.setup_service_total);
    costs.eventTotal = money(contract.eventservicescosttotal);
    costs.cleanupTotal = money(contract.clearup_service_total);
    costs.subtotal = money(costs.spaceRentalTotal + costs.spaceContentTotal + costs.setupTotal + costs.eventTotal + costs.cleanupTotal);
    const discount = money(contract.discount);
    costs.total = money(Math.max(0, costs.subtotal - discount));
    costs.securityDeposit = money(contract.space_damagewaiver_total);
    costs.totalWithDeposit = money(costs.total + costs.securityDeposit);
    if (discount > 0) costs.feeLines = [{ label: "Discount", total: -discount, note: text(contract.discount_notes) }];
    ["space_rental_items", "space_contents"].forEach((column) => {
      const value = text(contract[column]);
      if (value) details.push(`Contract ${columnLabel(column)}:\n${value}`);
    });
  }

  const requested = text(row.requesteddate).match(/^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})$/);
  const submittedAt = requested ? `${requested[1]}T${requested[2]}` : earliest ? `${earliest.sortKey}:00` : "";

  return {
    bookingDate: earliest,
    hasContract: !!contract,
    record: {
      id,
      bookingCode: bookingCodeFromId(id),
      progressNo: Number(oldId),
      submittedAt,
      client: {
        name: `${text(row.clientname)} ${text(row.lastname)}`.trim(),
        organization: text(row.organization),
        email: text(row.email).toLowerCase(),
        phone: text(row.phonenumber),
      },
      request: {
        eventPrivacy: text(row.eventprivacy),
        eventType: text(row.eventtype),
        alcoholOnSite: text(row.alcoholserved),
        attendeeCount: /^\d+$/.test(attendees) ? Number(attendees) : attendees,
        description: text(row.brief_desc_event),
        space: Array.from(new Set(spaceNames)).join(", "),
        bookingDateTime: dateSegments.join("; "),
        guestsArrival: text(row.exp_guestarrtime),
        noOneOnSite: "",
      },
      progress: {
        interestLevel,
        status,
        age: "Archived",
        signed: agreement === "Signed",
        agreement,
        contract: contract ? "Generated" : "Not Generated",
        insurance: insuranceStatus === "Obtained DUUO" || insuranceStatus === "Client has own",
        insuranceStatus,
        agcoLicense: agcoLicenseStatus === "Obtained",
        agcoLicenseStatus,
        infoComplete: text(row.infocomplete) === "Complete",
        lockedForUser: text(row.lockform_user) === "1",
        duuoEventType: text(row.duuoeventtype) || "Select One",
        notForProfit: yesNo(row.notforprofit),
        studentBody: yesNo(row.studentbody),
        communityOrganization: "No",
        source,
        createdBy: "Legacy import",
        accessibleByRecordLink: text(row.record_accesslink) === "1",
        securityDepositCost,
        securityDepositNote: text(row.damage_waiverrefund),
        internalNotes: text(row.internal_notes),
        issues: text(row.record_issues),
        attachments: [],
      },
      costs,
      adminSections: {
        instructions: instructions.join("\n"),
        specialNotes: details.length ? `Old booking details:\n${details.join("\n")}` : "",
        cateringSpecifics: [text(row.catering), text(row.catering_delivery_time) && `Delivery time: ${text(row.catering_delivery_time)}`].filter(Boolean).join("\n"),
        serviceNotes: [
          text(row.setupservices) && `Set-up: ${text(row.setupservices)}`,
          text(row.clearupservices) && `Clean-up: ${text(row.clearupservices)}`,
          text(row.thirdpartyrentals) && `Third-party rentals: ${text(row.thirdpartyrentals)}`,
        ].filter(Boolean).join("\n"),
      },
      emails: [],
      log: [{ label: "Legacy import", at: importedAtLabel, action: `Imported from old site (record #${oldId}, status "${oldStatus}")` }],
      legacy: { id: Number(oldId), uniqueid: text(row.uniqueid), status: oldStatus },
    },
  };
}

// Keeps bookings whose earliest booking date falls before `beforeYear`, newest first.
export function convertLegacyBookings({ bookings = [], contracts = [] }, { beforeYear }) {
  const contractsByUniqueId = new Map();
  [...contracts]
    .sort((a, b) => Number(a.id) - Number(b.id))
    .forEach((contract) => contractsByUniqueId.set(text(contract.uniqueid), contract));
  const importedAtLabel = new Date().toLocaleString();

  const selected = [];
  let skippedNoDate = 0;
  let skippedTooNew = 0;
  bookings.forEach((row) => {
    const item = convertBooking(row, contractsByUniqueId.get(text(row.uniqueid)), importedAtLabel);
    if (!item.bookingDate) skippedNoDate += 1;
    else if (item.bookingDate.year >= beforeYear) skippedTooNew += 1;
    else selected.push(item);
  });
  selected.sort((a, b) => (a.bookingDate.sortKey < b.bookingDate.sortKey ? 1 : -1));

  const records = selected.map((item) => item.record);
  const countBy = (list, keyFor) => list.reduce((acc, item) => {
    const key = keyFor(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const withTotals = records.filter((record) => record.costs.totalWithDeposit > 0);
  return {
    records,
    summary: {
      totalBookings: bookings.length,
      selected: records.length,
      skippedNoDate,
      skippedTooNew,
      byYear: countBy(selected, (item) => item.bookingDate.year),
      byStatus: countBy(records, (record) => record.progress.status),
      withContract: selected.filter((item) => item.hasContract).length,
      withTotals: withTotals.length,
      totalsSum: withTotals.reduce((sum, record) => sum + record.costs.totalWithDeposit, 0),
      missingEmail: records.filter((record) => !record.client.email).length,
    },
  };
}
