// Fullscreen client preview — renders the actual booking flow as a client would see it.
// Opens via topbar "Preview" button. Closes on Esc or close button.

function ClientPreview({ steps, onClose }) {
  const Ic = window.Icons;
  const visibleSteps = steps.filter((s) =>
    s.fields.length === 0 || s.fields.some((f) => f.visibleToClient !== false)
  );
  const list = visibleSteps.length ? visibleSteps : steps;

  const [stepIdx, setStepIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState({});

  // Reset when steps change identity
  React.useEffect(() => { setStepIdx(0); setAnswers({}); }, [steps.length]);

  React.useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && stepIdx < list.length - 1) setStepIdx(stepIdx + 1);
      if (e.key === "ArrowLeft" && stepIdx > 0) setStepIdx(stepIdx - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepIdx, list.length, onClose]);

  const step = list[stepIdx];
  const isLast = stepIdx === list.length - 1;

  const setAnswer = (fid, value) => setAnswers((a) => ({ ...a, [fid]: value }));

  // Evaluate field visibility based on current answers (simple rule engine)
  const isFieldVisible = (f) => {
    if (f.visibleToClient === false) return false;
    if (!f.visibility) return true;
    const r = f.visibility;
    // find field in this step or earlier ones by label
    const allFields = list.flatMap((s) => s.fields);
    const ref = allFields.find((x) => x.label === r.field);
    if (!ref) return true;
    const v = answers[ref.id];
    switch (r.op) {
      case "has_value": return v != null && v !== "" && v !== false;
      case "is_empty":  return v == null || v === "" || v === false;
      case "equals":    return String(v) === String(r.value);
      case "not_equals":return String(v) !== String(r.value);
      case "contains":  return String(v || "").toLowerCase().includes(String(r.value || "").toLowerCase());
      case "is_true":   return !!v;
      case "is_false":  return !v;
      default: return true;
    }
  };

  const visibleFields = step ? step.fields.filter(isFieldVisible) : [];

  return (
    <div className="cp-overlay" data-screen-label="Client Preview">
      <header className="cp-bar">
        <div className="cp-bar-brand">
          <div className="cp-bar-brand-mark">C</div>
          Collaburo
        </div>
        <span className="cp-bar-tag">Live preview</span>
        <div className="cp-bar-spacer" />
        <div className="cp-bar-meta">
          <span>Step {stepIdx + 1} of {list.length}</span>
          <span>·</span>
          <span>~{Math.max(2, list.length - stepIdx) * 2} min left</span>
        </div>
        <button className="cp-close" onClick={onClose} title="Close preview (Esc)">
          <Ic.Close size={16} />
        </button>
      </header>

      <div className="cp-body">
        <aside className="cp-rail">
          <h5>Your booking</h5>
          {list.map((s, i) => (
            <div
              key={s.id}
              className={"cp-rail-step" + (i < stepIdx ? " done" : i === stepIdx ? " active" : "")}
              onClick={() => setStepIdx(i)}
            >
              <span className="cp-rail-step-dot">
                {i < stepIdx ? "✓" : i + 1}
              </span>
              <span>{s.name}</span>
            </div>
          ))}
        </aside>

        <div className="cp-scroll">
          <div className="cp-form">
            <div className="cp-progress">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={i < stepIdx ? "done" : i === stepIdx ? "active" : ""}
                />
              ))}
            </div>

            {step ? (
              <>
                <div className="cp-eyebrow">
                  <Ic.Layers size={11} /> Step {stepIdx + 1}
                </div>
                <h1 className="cp-title">{step.name}</h1>
                <p className="cp-sub">
                  {step.description || "Tell us a little more so we can finalize your event."}
                </p>

                {visibleFields.length === 0 ? (
                  <div className="cp-empty">
                    No client-visible fields on this step.
                  </div>
                ) : (
                  visibleFields.map((f) => (
                    <ClientField
                      key={f.id}
                      f={f}
                      value={answers[f.id]}
                      onChange={(v) => setAnswer(f.id, v)}
                    />
                  ))
                )}

                <div className="cp-actions">
                  <button
                    className="cp-back"
                    onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                    disabled={stepIdx === 0}
                  >
                    ← Back
                  </button>
                  <button
                    className={"cp-next" + (isLast ? " primary" : "")}
                    onClick={() => {
                      if (isLast) {
                        alert("✓ This would submit the booking request.");
                      } else {
                        setStepIdx((i) => Math.min(list.length - 1, i + 1));
                      }
                    }}
                  >
                    {isLast ? "Submit request" : "Continue"} →
                  </button>
                </div>
              </>
            ) : (
              <div className="cp-empty">No steps in this workflow.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ----- per-type renderer -----
function ClientField({ f, value, onChange }) {
  const labelEl = (
    <label className="cp-label">
      {f.label}
      {f.required && <span className="req">*</span>}
    </label>
  );
  const help = f.helpText ? <p className="cp-help">{f.helpText}</p> : null;

  switch (f.type) {
    case "textarea":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <textarea
            className="cp-textarea"
            placeholder={f.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "toggle":
      return (
        <div className="cp-field">
          {help}
          <div className={"cp-toggle-row" + (value ? " on" : "")} onClick={() => onChange(!value)}>
            <span className={"swt" + (value ? " on" : "")} />
            <div>
              <b>{f.label}{f.required && <span style={{ color: "var(--accent)" }}> *</span>}</b>
              {f.helpText && <span className="desc">{f.helpText}</span>}
            </div>
          </div>
        </div>
      );
    case "select":
    case "multiselect":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <select
            className="cp-select"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">{f.placeholder || "Select…"}</option>
            {(f.options || []).map((o, i) => <option key={i} value={o}>{o}</option>)}
          </select>
        </div>
      );
    case "room":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <div className="cp-room-grid">
            {window.ROOMS.map((r) => (
              <div
                key={r.id}
                className={"cp-room" + (value === r.name ? " sel" : "")}
                onClick={() => onChange(r.name)}
              >
                <div className="cp-room-thumb" />
                <b>{r.name}</b>
                <span className="cap">{r.capacity}</span>
                <span className="price">{r.hourly} · {r.min}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case "addons": {
      const items = [
        { id: "tbl",  name: "Round tables (8 pax)",  price: "$12 ea" },
        { id: "lin",  name: "White linen runners",    price: "$8 ea" },
        { id: "av",   name: "AV kit (mic + speakers)",price: "$120" },
        { id: "stg",  name: "Stage lighting",         price: "$240" },
        { id: "uplt", name: "Custom uplighting",      price: "$180" },
        { id: "phot", name: "Photo backdrop",         price: "$90" },
      ];
      const sel = value || {};
      return (
        <div className="cp-field">
          {labelEl}{help}
          <div className="cp-addon-grid">
            {items.map((it) => {
              const n = sel[it.id] || 0;
              return (
                <div key={it.id} className={"cp-addon" + (n > 0 ? " sel" : "")}>
                  <div className="cp-addon-thumb" />
                  <b>{it.name}</b>
                  <div className="price">{it.price}</div>
                  <div className="qty">
                    <button onClick={() => onChange({ ...sel, [it.id]: Math.max(0, n - 1) })}>−</button>
                    <span>{n}</span>
                    <button onClick={() => onChange({ ...sel, [it.id]: n + 1 })}>+</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case "date":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <input
            className="cp-input"
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "daterange":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              className="cp-input"
              type="date"
              value={(value && value.start) || ""}
              onChange={(e) => onChange({ ...(value || {}), start: e.target.value })}
            />
            <input
              className="cp-input"
              type="date"
              value={(value && value.end) || ""}
              onChange={(e) => onChange({ ...(value || {}), end: e.target.value })}
            />
          </div>
        </div>
      );
    case "file":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <div className="cp-input" style={{
            display: "flex", alignItems: "center", gap: 10,
            cursor: "pointer", color: "var(--ink-3)",
            background: "var(--surface-2)", borderStyle: "dashed"
          }}>
            <span>📎</span>
            <span>Drop a file or click to upload</span>
          </div>
        </div>
      );
    case "price":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <input
            className="cp-input"
            placeholder={f.placeholder || "$0.00"}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    case "number":
      return (
        <div className="cp-field">
          {labelEl}{help}
          <input
            className="cp-input"
            type="tel"
            placeholder={f.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
    default: // text
      return (
        <div className="cp-field">
          {labelEl}{help}
          <input
            className="cp-input"
            type="text"
            placeholder={f.placeholder || ""}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}

window.ClientPreview = ClientPreview;
