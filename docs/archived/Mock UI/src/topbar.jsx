// Topbar — breadcrumb + preview / save / publish actions.

const SECTION_LABEL = {
  workflow: "Client Intake Form",
  rentals: "Rentals Catalog",
  pricing: "Pricing Rules",
  site: "Site Settings",
  clients: "Clients",
  calendar: "Booking Calendar",
  reports: "Reports",
};

const SECTION_PARENT = {
  workflow: "Workflow Steps",
  rentals: "Catalog",
  pricing: "Pricing",
  site: "Settings",
  clients: "Operations",
  calendar: "Operations",
  reports: "Operations",
};

function Topbar({ section, onTogglePreview, previewOpen, isDirty, lastSaved, onSave, onPublish, onReset }) {
  const Ic = window.Icons;
  const isWorkflow = section === "workflow";
  return (
    <header className="topbar">
      <div className="crumbs">
        <span className="past">{SECTION_PARENT[section] || "Admin"}</span>
        <span className="sep">/</span>
        <span className="here">{SECTION_LABEL[section] || section}</span>
      </div>
      {isWorkflow && (
        <span className="draft-pill" title={isDirty ? "Unsaved changes — press ⌘S to save" : "All changes saved"}>
          {isDirty ? "Unsaved changes" : `Saved ${lastSaved}`}
        </span>
      )}

      <div className="topbar-actions">
        {isWorkflow && (
          <>
            <button className="btn ghost sm" onClick={onReset} title="Reset to sample data">
              <Ic.Key size={14} /> Reset
            </button>
            <button
              className="btn"
              onClick={onTogglePreview}
              title="Open client-view preview"
            >
              <Ic.Eye size={14} />
              Preview
            </button>
            <button className="btn" onClick={onSave} disabled={!isDirty} style={!isDirty ? { opacity: 0.5 } : {}}>
              <Ic.Save size={14} /> Save changes
              <span className="kbd" style={{ marginLeft: 4 }}>⌘S</span>
            </button>
            <button className="btn primary" onClick={onPublish}>
              <Ic.Publish size={14} /> Publish
            </button>
          </>
        )}
        {!isWorkflow && (
          <button className="btn primary sm" disabled style={{ opacity: 0.5 }}>
            <Ic.Plus size={12} /> Action
          </button>
        )}
      </div>
    </header>
  );
}

window.Topbar = Topbar;
