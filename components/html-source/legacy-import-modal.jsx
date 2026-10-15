"use client";

import React from "react";
import { convertLegacyBookings, parseLegacyDump } from "./legacy-import";

const IMPORT_BATCH_SIZE = 50;
const IMPORT_MODES = [
  {
    id: "skip",
    label: "Import and ignore existing data",
    description: "Adds bookings that are not in the list yet. Bookings already imported are left exactly as they are, including any edits made since.",
  },
  {
    id: "overwrite",
    label: "Import and override existing data",
    description: "Adds new bookings and replaces previously imported ones with the version from this file. Edits made to those bookings in the new app are lost. Bookings made on the new site are not touched.",
  },
  {
    id: "replace",
    label: "Clear all data and import",
    description: "Deletes every booking in the Rentals Progress List, old and new, then imports this file.",
    danger: true,
  },
];

const money = (value) => "$" + Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function CountList({ counts }) {
  const entries = Object.entries(counts || {}).sort(([a], [b]) => (a < b ? -1 : 1));
  if (!entries.length) return <span className="rental-muted">None</span>;
  return entries.map(([label, count]) => (
    <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span>{label}</span>
      <b>{count}</b>
    </div>
  ));
}

function ProgressBar({ value }) {
  return (
    <div style={{ height: 8, borderRadius: 4, background: "var(--line)", overflow: "hidden", marginTop: 8 }}>
      <div style={{ width: `${Math.round(value * 100)}%`, height: "100%", background: "var(--ink)", transition: "width .2s" }} />
    </div>
  );
}

export function LegacyImportModal({ onClose, onImportBatch }) {
  const [phase, setPhase] = React.useState("pick");
  const [fileName, setFileName] = React.useState("");
  const [progress, setProgress] = React.useState(0);
  const [parsed, setParsed] = React.useState(null);
  const [beforeYear, setBeforeYear] = React.useState(new Date().getFullYear());
  const [result, setResult] = React.useState(null);
  const [error, setError] = React.useState("");
  const [mode, setMode] = React.useState("skip");
  const [confirmText, setConfirmText] = React.useState("");
  const busy = phase === "reading" || phase === "importing";
  const needsConfirm = mode === "replace" && confirmText.trim().toUpperCase() !== "DELETE";

  const conversion = React.useMemo(
    () => (parsed ? convertLegacyBookings(parsed, { beforeYear: Number(beforeYear) || new Date().getFullYear() }) : null),
    [parsed, beforeYear]
  );

  const readFile = async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError("");
    setResult(null);
    setProgress(0);
    setPhase("reading");
    try {
      setParsed(await parseLegacyDump(file, { onProgress: setProgress }));
      setPhase("review");
    } catch (readError) {
      setParsed(null);
      setError(readError.message || "Could not read this file.");
      setPhase("pick");
    }
  };

  const runImport = async () => {
    const records = conversion?.records || [];
    if (!records.length || needsConfirm) return;
    setPhase("importing");
    setError("");
    setProgress(0);
    const totals = { mode, added: 0, overwritten: 0, skipped: 0 };
    try {
      for (let start = 0; start < records.length; start += IMPORT_BATCH_SIZE) {
        const batch = records.slice(start, start + IMPORT_BATCH_SIZE);
        // Only the first batch clears; later batches add to the now-empty list.
        const batchMode = mode === "replace" && start > 0 ? "skip" : mode;
        const response = await onImportBatch(batch, batchMode);
        totals.added += Number(response?.added || 0);
        totals.overwritten += Number(response?.overwritten || 0);
        totals.skipped += Number(response?.skipped || 0);
        setProgress(Math.min(1, (start + batch.length) / records.length));
      }
      setResult(totals);
      setPhase("done");
    } catch (importError) {
      setResult(totals);
      setError(`${importError.message || "Import failed."} ${totals.added + totals.overwritten} bookings were saved before the error. To finish, run the import again with "Import and ignore existing data".`);
      setConfirmText("");
      setPhase("review");
    }
  };

  const summary = conversion?.summary;
  return (
    <div className="rental-modal-backdrop" onClick={busy ? undefined : onClose}>
      <div className="rental-modal" style={{ width: 640 }} onClick={(e) => e.stopPropagation()}>
        <h3>Import old bookings</h3>
        <div className="rental-modal-body" style={{ display: "grid", gap: 14 }}>
          <div className="rental-muted">
            Choose the <b>.sql</b> export of the old Collaburo database. The file is read on this computer; only the converted bookings are sent to the server.
          </div>

          {(phase === "pick" || phase === "review") && (
            <div>
              <label className="lbl">Database export (.sql)</label>
              <input className="input" type="file" accept=".sql,text/plain" onChange={(e) => readFile(e.target.files?.[0])} />
            </div>
          )}

          {phase === "reading" && (
            <div>
              Reading <b>{fileName}</b>... {Math.round(progress * 100)}%
              <ProgressBar value={progress} />
            </div>
          )}

          {summary && phase !== "reading" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
                <div className="rental-muted">
                  {fileName}: {summary.totalBookings} bookings found. Bookings with a booking date in or after the year on the right, and bookings with no booking date, are left out.
                </div>
                <div>
                  <label className="lbl">Only bookings before</label>
                  <input className="input" type="number" style={{ width: 110 }} value={beforeYear} disabled={busy} onChange={(e) => setBeforeYear(e.target.value)} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, background: "var(--bg-2, #fafafa)", border: "1px solid var(--line)", borderRadius: 8, padding: 12, fontSize: 13 }}>
                <div>
                  <div className="lbl">To import: {summary.selected}</div>
                  <CountList counts={summary.byYear} />
                </div>
                <div>
                  <div className="lbl">Status in the new app</div>
                  <CountList counts={summary.byStatus} />
                </div>
                <div style={{ gridColumn: "1 / -1", display: "grid", gap: 4 }}>
                  <div>Left out: {summary.skippedTooNew} dated {beforeYear} or later, {summary.skippedNoDate} with no booking date</div>
                  <div>With prices from the old contract: {summary.withTotals} (total {money(summary.totalsSum)})</div>
                  {summary.missingEmail > 0 && <div>Without an email address: {summary.missingEmail}</div>}
                  {parsed?.mismatchedRows > 0 && <div style={{ color: "var(--danger, #b42318)" }}>{parsed.mismatchedRows} rows in the file could not be read and were skipped.</div>}
                </div>
              </div>
              {phase !== "done" && (
                <div style={{ display: "grid", gap: 8 }}>
                  <div className="lbl">How to import</div>
                  {IMPORT_MODES.map((option) => (
                    <label key={option.id} style={{ display: "flex", gap: 8, alignItems: "flex-start", cursor: busy ? "default" : "pointer" }}>
                      <input type="radio" name="legacy-import-mode" checked={mode === option.id} disabled={busy} onChange={() => { setMode(option.id); setConfirmText(""); }} style={{ marginTop: 3 }} />
                      <span>
                        <b style={option.danger ? { color: "var(--danger, #b42318)" } : undefined}>{option.label}</b>
                        <span className="rental-muted" style={{ display: "block" }}>{option.description}</span>
                      </span>
                    </label>
                  ))}
                  {mode === "replace" && (
                    <div style={{ border: "1px solid var(--danger, #b42318)", borderRadius: 8, padding: 12, display: "grid", gap: 8 }}>
                      <div style={{ color: "var(--danger, #b42318)" }}>
                        This permanently deletes every booking in the Rentals Progress List, including bookings made on the new site, their client links, and signed contracts. Settings, forms, rentals and pricing are kept.
                        Make a backup first (Neon console, Branches, Create branch).
                      </div>
                      <div>
                        <label className="lbl">Type DELETE to confirm</label>
                        <input className="input" value={confirmText} disabled={busy} onChange={(e) => setConfirmText(e.target.value)} style={{ width: 180 }} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {phase === "importing" && (
            <div>
              Importing... {Math.round(progress * 100)}%. Keep this window open.
              <ProgressBar value={progress} />
            </div>
          )}

          {phase === "done" && result && (
            <div style={{ color: "var(--success, #067647)" }}>
              Done{result.mode === "replace" ? ": all previous bookings were deleted, and" : ":"} {result.added} new bookings imported
              {result.overwritten ? `, ${result.overwritten} existing bookings overwritten` : ""}
              {result.skipped ? `, ${result.skipped} already in the list and left unchanged` : ""}.
              Imported bookings are marked "Archived"; choose Age "All" or "Archived" in the list filters to see them.
            </div>
          )}

          {error && <div style={{ color: "var(--danger, #b42318)" }}>{error}</div>}
        </div>
        <div className="rental-modal-actions">
          <button className="btn" onClick={onClose} disabled={busy}>{phase === "done" ? "Close" : "Cancel"}</button>
          {phase !== "done" && (
            <button className="btn dark" onClick={runImport} disabled={busy || !conversion?.records.length || needsConfirm}>
              {mode === "replace" ? "Delete all and import" : "Import"} {conversion?.records.length || ""} bookings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
