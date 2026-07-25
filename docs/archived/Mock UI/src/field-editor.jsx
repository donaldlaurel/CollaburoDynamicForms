// Field editor — right column. Cards for each field, expand to reveal config.

const TYPE_META = {
  text:        { label: "Text",        pillIcon: "Type" },
  textarea:    { label: "Long text",   pillIcon: "List" },
  number:      { label: "Number",      pillIcon: "Hash" },
  select:      { label: "Dropdown",    pillIcon: "Chevron" },
  multiselect: { label: "Multi-select",pillIcon: "CheckSq" },
  date:        { label: "Date",        pillIcon: "Clock" },
  daterange:   { label: "Date range",  pillIcon: "Cal" },
  file:        { label: "File",        pillIcon: "File" },
  price:       { label: "Price",       pillIcon: "Dollar" },
  toggle:      { label: "Toggle",      pillIcon: "Toggle" },
  room:        { label: "Room",        pillIcon: "Building" },
  addons:      { label: "Add-ons",     pillIcon: "Cards" },
};

// ---------------- Field card ----------------
function FieldCard({ field, allFields, open, onToggle, onUpdate, onDuplicate, onDelete, sourceHandlers, targetHandlers, isDragging, isOver }) {
  const Ic = window.Icons;
  const [advOpen, setAdvOpen] = React.useState(
    !!(field.helpText || field.visibility || field.internalNote)
  );
  const set = (patch) => onUpdate({ ...field, ...patch });
  const supportsOptions = ["select", "multiselect"].includes(field.type);
  const [hasOptions, setHasOptions] = React.useState(
    supportsOptions || (field.options && field.options.length > 0)
  );

  // Only allow drag from the header row when the card is closed (so inputs in body stay selectable)
  const src = !open ? sourceHandlers : {};
  const tgt = targetHandlers || {};

  return (
    <div
      className={
        "field" + (open ? " open" : "") +
        (isDragging ? " is-dragging" : "") +
        (isOver ? " is-drop-target" : "")
      }
      data-comment-anchor={`field-${field.id}`}
      {...tgt}
    >
      <div className="field-row" onClick={onToggle} {...src}>
        <span className="field-grip" onClick={(e) => e.stopPropagation()}>
          <Ic.Grip size={14} />
        </span>
        <span className="field-name">
          {field.label}
          {field.required && <span className="req">*</span>}
        </span>
        <span className="field-row-spacer" />
        <span className="field-type-pill">{TYPE_META[field.type]?.label || field.type}</span>
        <div className="field-actions" onClick={(e) => e.stopPropagation()}>
          <button className="btn icon sm ghost" title="Duplicate" onClick={onDuplicate}>
            <Ic.Copy size={13} />
          </button>
          <button
            className="btn icon sm ghost"
            title={open ? "Collapse" : "Expand"}
            onClick={onToggle}
            style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}
          >
            <Ic.Chevron size={13} />
          </button>
          <button className="btn icon sm danger-ghost" title="Delete" onClick={onDelete}>
            <Ic.Trash size={13} />
          </button>
        </div>
      </div>

      {open && (
        <div className="field-body">
          <div className="field-grid">
            <div>
              <label className="lbl">Field Label</label>
              <input
                className="input"
                value={field.label}
                onChange={(e) => set({ label: e.target.value })}
              />
            </div>
            <div>
              <label className="lbl">Display Field As</label>
              <select
                className="select"
                value={field.type}
                onChange={(e) => set({ type: e.target.value })}
              >
                {window.FIELD_TYPES.map((t) => (
                  <option key={t.type} value={t.type}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {field.type !== "toggle" && field.type !== "room" && field.type !== "addons" && (
            <div className="field-grid one">
              <div>
                <label className="lbl">
                  Placeholder
                  <span className="hint" style={{ marginLeft: 8 }}>shown to clients before they type</span>
                </label>
                <input
                  className="input"
                  value={field.placeholder || ""}
                  placeholder=""
                  onChange={(e) => set({ placeholder: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="field-flag-row">
            <label className="chk">
              <input
                type="checkbox"
                checked={!!field.required}
                onChange={(e) => set({ required: e.target.checked })}
              />
              Required <span className="req">*</span>
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={!!field.adminRequired}
                onChange={(e) => set({ adminRequired: e.target.checked })}
              />
              Admin required <span className="req">*</span>
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={field.visibleToClient !== false}
                onChange={(e) => set({ visibleToClient: e.target.checked })}
              />
              Visible to client
            </label>
            <label className="chk">
              <input
                type="checkbox"
                checked={!!field.linkedToPricing}
                onChange={(e) => set({ linkedToPricing: e.target.checked })}
              />
              Linked to pricing
            </label>
            {!supportsOptions && (
              <label className="chk" style={{ marginLeft: "auto" }}>
                <input
                  type="checkbox"
                  checked={hasOptions}
                  onChange={(e) => {
                    setHasOptions(e.target.checked);
                    if (!e.target.checked) set({ options: [] });
                  }}
                />
                Has options
              </label>
            )}
          </div>

          {(supportsOptions || hasOptions) && (
            <div style={{ paddingBottom: 14 }}>
              <label className="lbl">Options</label>
              <OptionsEditor
                options={field.options || []}
                onChange={(options) => set({ options })}
              />
            </div>
          )}

          {/* Advanced disclosure */}
          <div className="adv">
            <div className="adv-head" onClick={() => setAdvOpen((o) => !o)}>
              <span>Advanced settings</span>
              <Ic.Chevron
                size={13}
                style={{
                  transform: advOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.15s",
                  color: "var(--ink-3)"
                }}
              />
            </div>
            {advOpen && (
              <div className="adv-body">
                <div className="field-grid">
                  <div>
                    <label className="lbl">
                      Information icon <Ic.Info size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
                    </label>
                    <input
                      className="input"
                      value={field.helpText || ""}
                      placeholder="Enter tooltip text…"
                      onChange={(e) => set({ helpText: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="lbl">
                      Information gallery icon
                    </label>
                    <div className="upload">
                      <Ic.Img size={16} />
                      <span><b>Upload image</b> · drag or click</span>
                    </div>
                  </div>
                </div>

                <div className="field-grid">
                  <div>
                    <label className="lbl">Default value</label>
                    <input
                      className="input"
                      value={field.defaultValue || ""}
                      placeholder="Leave empty for none"
                      onChange={(e) => set({ defaultValue: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="lbl">Category / tag</label>
                    <input
                      className="input"
                      value={field.category || ""}
                      placeholder="e.g. Contact, Venue, Pricing…"
                      onChange={(e) => set({ category: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="lbl">Internal-only note <span className="hint">visible to staff only</span></label>
                  <textarea
                    className="textarea"
                    rows={2}
                    value={field.internalNote || ""}
                    placeholder="Notes for the operations team…"
                    onChange={(e) => set({ internalNote: e.target.value })}
                  />
                </div>

                <div>
                  <label className="lbl">
                    Visibility condition <Ic.Branch size={11} style={{ verticalAlign: "middle", marginLeft: 2 }} />
                  </label>
                  <VisibilityRule
                    rule={field.visibility}
                    allFields={allFields.filter((f) => f.id !== field.id)}
                    onChange={(visibility) => set({ visibility })}
                  />
                </div>

                <div>
                  <label className="lbl">Validation rules</label>
                  <input
                    className="input"
                    value={field.validation || ""}
                    placeholder="e.g. min:1, max:500, regex:^[A-Z]"
                    onChange={(e) => set({ validation: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------- Visibility rule ----------------
function VisibilityRule({ rule, allFields, onChange }) {
  const Ic = window.Icons;
  if (!rule) {
    return (
      <button
        className="btn sm ghost"
        style={{ border: "1px dashed var(--line-strong)", color: "var(--ink-3)" }}
        onClick={() =>
          onChange({ field: allFields[0]?.label || "", op: "has_value", value: "" })
        }
      >
        <Ic.Plus size={12} /> Add visibility condition
      </button>
    );
  }
  const needsValue = ["equals", "not_equals", "contains"].includes(rule.op);
  return (
    <div className="vis-row">
      <span className="word">Show this field if</span>
      <select
        className="select"
        value={rule.field}
        onChange={(e) => onChange({ ...rule, field: e.target.value })}
      >
        {allFields.map((f) => (
          <option key={f.id} value={f.label}>{f.label}</option>
        ))}
      </select>
      <select
        className="select"
        value={rule.op}
        onChange={(e) => onChange({ ...rule, op: e.target.value })}
      >
        <option value="has_value">has a value</option>
        <option value="is_empty">is empty</option>
        <option value="equals">equals</option>
        <option value="not_equals">does not equal</option>
        <option value="contains">contains</option>
        <option value="is_true">is checked</option>
        <option value="is_false">is unchecked</option>
      </select>
      {needsValue && (
        <input
          className="input"
          value={rule.value || ""}
          placeholder="value"
          onChange={(e) => onChange({ ...rule, value: e.target.value })}
        />
      )}
      <button
        className="btn icon sm danger-ghost"
        title="Remove condition"
        onClick={() => onChange(null)}
      >
        <Ic.Close size={12} />
      </button>
    </div>
  );
}

// ---------------- Options editor (for select / multiselect) ----------------
function OptionsEditor({ options, onChange }) {
  const Ic = window.Icons;
  const update = (i, v) => {
    const next = [...options];
    next[i] = v;
    onChange(next);
  };
  const remove = (i) => onChange(options.filter((_, j) => j !== i));
  const add = () => onChange([...options, ""]);
  return (
    <div className="opts">
      {options.map((o, i) => (
        <div className="opt-row" key={i}>
          <span className="grip"><Ic.Grip size={13} /></span>
          <input
            className="input"
            value={o}
            placeholder={`Option ${i + 1}`}
            onChange={(e) => update(i, e.target.value)}
          />
          <button className="btn icon sm danger-ghost" onClick={() => remove(i)}>
            <Ic.Trash size={12} />
          </button>
        </div>
      ))}
      <button className="opt-add" onClick={add}>
        <Ic.Plus size={12} /> Add option
      </button>
    </div>
  );
}

// ---------------- Field editor (column) ----------------
function FieldEditor({ step, onUpdateStep, onAddField, onDuplicateField, onDeleteField, onUpdateField, openFieldId, onToggleField, onReorderFields }) {
  const Ic = window.Icons;
  const [editingHead, setEditingHead] = React.useState(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [headDraft, setHeadDraft] = React.useState({ name: "", description: "" });

  React.useEffect(() => {
    if (!editingHead && step) {
      setHeadDraft({ name: step.name, description: step.description || "" });
    }
  }, [step?.id, editingHead]);

  const dnd = window.useReorderable({
    items: step?.fields || [],
    onReorder: (next) => onReorderFields(next),
  });

  if (!step) {
    return (
      <div className="editor-col">
        <div className="editor-inner">
          <div className="empty">
            <div className="ill"><Ic.Layers size={24} /></div>
            <h3>No step selected</h3>
            <p>Pick a step from the sequence on the left to start editing its fields.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-col">
      <div className="editor-inner">
        <div className="editor-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className="editor-head-tag">
              <Ic.Layers size={11} /> Step {(window.SAMPLE_STEPS.findIndex(s => s.id === step.id) + 1)}
            </span>
            {editingHead ? (
              <>
                <input
                  className="input"
                  style={{ fontSize: "var(--text-xl)", fontWeight: 600, marginBottom: 6, letterSpacing: "-0.02em" }}
                  value={headDraft.name}
                  autoFocus
                  onChange={(e) => setHeadDraft({ ...headDraft, name: e.target.value })}
                />
                <textarea
                  className="textarea"
                  rows={2}
                  value={headDraft.description}
                  placeholder="Description shown above this step in the client view"
                  onChange={(e) => setHeadDraft({ ...headDraft, description: e.target.value })}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    className="btn primary sm"
                    onClick={() => {
                      onUpdateStep({ ...step, name: headDraft.name.trim() || step.name, description: headDraft.description });
                      setEditingHead(false);
                    }}
                  >
                    Save
                  </button>
                  <button className="btn ghost sm" onClick={() => setEditingHead(false)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1>{step.name}</h1>
                <p>{step.description || <em style={{ color: "var(--ink-4)" }}>Add a description to give clients context for this step.</em>}</p>
              </>
            )}
          </div>
          {!editingHead && (
            <button className="btn icon ghost" title="Edit step info" onClick={() => setEditingHead(true)}>
              <Ic.Edit size={14} />
            </button>
          )}
        </div>

        <div className="section-bar">
          <h2>
            <Ic.List size={13} /> Components in this step
            <span className="count">{step.fields.length}</span>
          </h2>
          <div style={{ position: "relative" }}>
            <button className="btn dark sm" onClick={() => setPickerOpen((o) => !o)}>
              <Ic.Plus size={13} /> Add field
            </button>
            {pickerOpen && (
              <FieldTypePicker
                onPick={(t) => { onAddField(t); setPickerOpen(false); }}
                onClose={() => setPickerOpen(false)}
              />
            )}
          </div>
        </div>

        {step.fields.length === 0 ? (
          <div className="empty" style={{ background: "var(--surface-2)", border: "1px dashed var(--line-strong)", borderRadius: 10 }}>
            <div className="ill"><Ic.Plus size={22} /></div>
            <h3>No fields yet</h3>
            <p>Add the first field clients will see when they reach this step.</p>
            <button className="btn primary sm" onClick={() => setPickerOpen(true)}>
              <Ic.Plus size={12} /> Add first field
            </button>
          </div>
        ) : (
          <div className="field-list">
            {step.fields.map((f) => (
              <FieldCard
                key={f.id}
                field={f}
                allFields={step.fields}
                open={openFieldId === f.id}
                onToggle={() => onToggleField(f.id)}
                onUpdate={(next) => onUpdateField(f.id, next)}
                onDuplicate={() => onDuplicateField(f.id)}
                onDelete={() => onDeleteField(f.id)}
                sourceHandlers={dnd.sourceHandlers(f)}
                targetHandlers={dnd.targetHandlers(f)}
                isDragging={dnd.isDragging(f.id)}
                isOver={dnd.isOver(f.id)}
              />
            ))}
          </div>
        )}

        <button className="add-field" onClick={() => setPickerOpen(true)}>
          <Ic.Plus size={14} /> Add another field
        </button>
      </div>
    </div>
  );
}

// ---------------- Field type picker popover ----------------
function FieldTypePicker({ onPick, onClose }) {
  const Ic = window.Icons;
  const ref = React.useRef(null);
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);

  const filtered = window.FIELD_TYPES.filter((t) =>
    t.label.toLowerCase().includes(q.toLowerCase()) ||
    t.desc.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="type-picker" ref={ref} style={{ top: "100%", right: 0, marginTop: 6 }}>
      <div className="type-picker-search">
        <input
          className="input"
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search field types…"
        />
      </div>
      <div className="type-picker-grid">
        {filtered.map((t) => {
          const I = window.Icons[t.icon];
          return (
            <button
              key={t.type}
              className="type-picker-item"
              onClick={() => onPick(t.type)}
            >
              <span className="ic"><I size={15} /></span>
              <span>
                <div className="nm">{t.label}</div>
                <div className="ds">{t.desc}</div>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { FieldEditor, FieldCard });
