// Preview drawer — shows the current step as the client would see it.

function PreviewDrawer({ step, stepIndex, totalSteps, onClose }) {
  const Ic = window.Icons;
  if (!step) return null;
  return (
    <aside className="preview">
      <div className="preview-head">
        <h4>Client Preview · Step {stepIndex + 1} of {totalSteps}</h4>
        <button className="btn icon sm ghost" onClick={onClose} title="Close preview">
          <Ic.Close size={14} />
        </button>
      </div>
      <div className="preview-body">
        <div className="preview-card">
          <div className="preview-progress">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <span
                key={i}
                className={i < stepIndex ? "done" : i === stepIndex ? "active" : ""}
              />
            ))}
          </div>
          <h2>{step.name}</h2>
          <p className="sub">{step.description || "—"}</p>
          {step.fields
            .filter((f) => f.visibleToClient !== false)
            .map((f) => <PreviewField key={f.id} f={f} />)}
          <div className="preview-foot">
            <button className="btn sm" disabled={stepIndex === 0}>Back</button>
            <button className="btn primary sm">
              {stepIndex === totalSteps - 1 ? "Submit Request" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function PreviewField({ f }) {
  const Ic = window.Icons;
  const labelEl = (
    <label>
      {f.label}{f.required && <span className="req"> *</span>}
      {f.helpText && (
        <span className="ptip" title={f.helpText}>i</span>
      )}
    </label>
  );

  if (f.type === "textarea") {
    return (
      <div className="preview-field">
        {labelEl}
        <textarea className="ptextarea" placeholder={f.placeholder || ""} defaultValue={f.defaultValue || ""} />
      </div>
    );
  }
  if (f.type === "toggle") {
    return (
      <div className="preview-field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className={"swt" + (f.defaultValue ? " on" : "")} />
        <span style={{ fontSize: 12.5 }}>{f.label}{f.required && <span className="req"> *</span>}</span>
      </div>
    );
  }
  if (f.type === "select" || f.type === "multiselect") {
    return (
      <div className="preview-field">
        {labelEl}
        <select className="pinput">
          <option value="">{f.placeholder || "Select…"}</option>
          {(f.options || []).map((o, i) => <option key={i}>{o}</option>)}
        </select>
      </div>
    );
  }
  if (f.type === "room") {
    return (
      <div className="preview-field">
        {labelEl}
        {window.ROOMS.map((r, i) => (
          <div key={r.id} className={"proom" + (i === 0 ? " sel" : "")}>
            <div className="proom-thumb" />
            <div className="proom-info">
              <b>{r.name}</b>
              <span>{r.capacity} · {r.hourly}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (f.type === "addons") {
    return (
      <div className="preview-field">
        {labelEl}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {["Tables", "Linens", "AV Kit", "Stage lights"].map((n, i) => (
            <div key={i} style={{
              border: "1px solid var(--line)", borderRadius: 8, padding: 10,
              fontSize: 12, display: "flex", flexDirection: "column", gap: 4
            }}>
              <div style={{ height: 48, borderRadius: 5, background: "linear-gradient(135deg,var(--surface-3),var(--surface-active))" }} />
              <b style={{ fontSize: 12 }}>{n}</b>
              <span style={{ color: "var(--ink-3)", fontSize: 11 }}>From ${[12, 18, 80, 120][i]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (f.type === "date") {
    return (
      <div className="preview-field">
        {labelEl}
        <input className="pinput" type="date" />
      </div>
    );
  }
  if (f.type === "daterange") {
    return (
      <div className="preview-field">
        {labelEl}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input className="pinput" type="date" />
          <input className="pinput" type="date" />
        </div>
      </div>
    );
  }
  if (f.type === "file") {
    return (
      <div className="preview-field">
        {labelEl}
        <div className="upload" style={{ background: "var(--surface-2)" }}>
          <Ic.File size={14} /> <span>Drop a file or click to upload</span>
        </div>
      </div>
    );
  }
  if (f.type === "price") {
    return (
      <div className="preview-field">
        {labelEl}
        <input className="pinput" placeholder={f.placeholder || "$0.00"} />
      </div>
    );
  }
  // text, number, default
  return (
    <div className="preview-field">
      {labelEl}
      <input
        className="pinput"
        type={f.type === "number" ? "tel" : "text"}
        placeholder={f.placeholder || ""}
        defaultValue={f.defaultValue || ""}
      />
    </div>
  );
}

window.PreviewDrawer = PreviewDrawer;
