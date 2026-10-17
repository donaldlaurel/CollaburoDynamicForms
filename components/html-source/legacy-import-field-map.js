const MAIN_MAPPED = new Set([
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

const MAIN_PARTIAL = new Set(["mh_otherdates", "lr_otherdates", "sr_otherdates"]);
const CONTRACT_MAPPED = new Set([
  "id", "uniqueid", "space_rental_total", "space_content_total", "setup_service_total",
  "eventservicescosttotal", "clearup_service_total", "discount", "discount_notes",
  "space_damagewaiver_total", "space_rental_items", "space_contents",
  "bookingstartdate_month", "bookingstartdate_day", "bookingstartdate_year",
  "bookingstartdate_hour", "bookingstartdate_min", "bookingstartdate_mrdn",
  "bookingenddate_month", "bookingenddate_day", "bookingenddate_year",
  "bookingenddate_hour", "bookingenddate_min", "bookingenddate_mrdn",
  "space_mainhall", "space_loungearea", "space_largeroom", "space_smallroom",
  "space_elevatedarea", "space_patio", "space_other", "space_other_input",
]);
const SHARD_DATE_COLUMNS = {
  addrentalprogress_bp: new Set(["bp_id", "bp_common_id", "bookingstartdate_bp", "bookingenddate_bp", "multipledates_bp"]),
  addrentalprogress_la: new Set(["la_id", "la_common_id", "bookingstartdate_la", "bookingenddate_la"]),
};

export { MAIN_MAPPED };

const meaningful = (value) => {
  const normalized = String(value ?? "").trim();
  return normalized && normalized !== "0" && normalized !== "0.00" && normalized !== "0000-00-00";
};

function classification(table, column) {
  if (table === "addrentalprogress") {
    if (MAIN_PARTIAL.has(column)) return "partial";
    return MAIN_MAPPED.has(column) ? "mapped" : "notesOnly";
  }
  if (table === "contract") {
    if (["space_rental_items", "space_contents"].includes(column)) return "notesOnly";
    return CONTRACT_MAPPED.has(column) ? "mapped" : "notImported";
  }
  if (SHARD_DATE_COLUMNS[table]?.has(column)) {
    return column === "multipledates_bp" ? "partial" : "mapped";
  }
  return "notImported";
}

export function buildLegacyFieldAudit(parsed = {}, conversionSummary = {}) {
  const rowsByTable = {
    addrentalprogress: parsed.bookings || [],
    contract: parsed.contracts || [],
    addrentalprogress_bp: parsed.backPatios || [],
    addrentalprogress_la: parsed.lounges || [],
  };
  const fields = [];
  Object.entries(parsed.schemas || {}).forEach(([table, columns]) => {
    const rows = rowsByTable[table] || [];
    columns.forEach((column) => {
      fields.push({
        table,
        column,
        classification: classification(table, column),
        populatedRows: rows.reduce((count, row) => count + (meaningful(row?.[column]) ? 1 : 0), 0),
      });
    });
  });
  const counts = fields.reduce((all, field) => {
    all[field.classification] = (all[field.classification] || 0) + 1;
    return all;
  }, { mapped: 0, partial: 0, notesOnly: 0, notImported: 0, parseFailed: Number(conversionSummary.parseFailures || 0) });
  const suspiciousEncodingValues = Object.values(rowsByTable).reduce((total, rows) => (
    total + rows.reduce((rowTotal, row) => (
      rowTotal + Object.values(row || {}).reduce((valueTotal, value) => (
        valueTotal + (/�|Ã|â/.test(String(value ?? "")) ? 1 : 0)
      ), 0)
    ), 0)
  ), 0);
  return {
    counts,
    fields,
    records: {
      totalBookings: Number(conversionSummary.totalBookings || 0),
      selected: Number(conversionSummary.selected || 0),
      skippedNoDate: Number(conversionSummary.skippedNoDate || 0),
      skippedTooNew: Number(conversionSummary.skippedTooNew || 0),
      recoveredBackPatio: Number(conversionSummary.recoveredBackPatio || 0),
      recoveredLounge: Number(conversionSummary.recoveredLounge || 0),
      contractDateFallbacks: Number(conversionSummary.contractDateFallbacks || 0),
      duplicateBackPatioRows: Number(conversionSummary.duplicateBackPatioRows || 0),
      duplicateContractIds: Number(conversionSummary.duplicateContractIds || 0),
      suspiciousEncodingValues,
      mismatchedRows: Number(parsed.mismatchedRows || 0),
    },
  };
}
