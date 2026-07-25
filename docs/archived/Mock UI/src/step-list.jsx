// Step list — middle column. Reorder (DnD), delete, add steps, search.

function StepList({ steps, activeId, onSelect, onMove, onDelete, onAdd, onRename, onReorder }) {
  const Ic = window.Icons;
  const [renaming, setRenaming] = React.useState(null);
  const [draft, setDraft] = React.useState("");
  const [query, setQuery] = React.useState("");

  const filtered = query.trim()
    ? steps.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : steps;

  // DnD only when not filtering
  const dnd = window.useReorderable({
    items: steps,
    onReorder,
  });

  return (
    <div className="steps-col">
      <div className="col-head">
        <h3>Step Sequence</h3>
        <div className="col-head-actions">
          <button className="btn icon sm ghost" title="Add step" onClick={onAdd}>
            <Ic.Plus size={13} />
          </button>
        </div>
      </div>

      <div className="col-search">
        <div className="col-search-wrap">
          <span className="ic"><Ic.Search size={13} /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search steps…"
          />
          {!query && <span className="col-search-kbd">⌘ K</span>}
        </div>
      </div>

      <div className="steps-body">
        {filtered.length === 0 && (
          <div style={{ padding: "12px 4px", fontSize: 12, color: "var(--ink-3)" }}>
            No steps match "{query}".
          </div>
        )}
        {filtered.map((s) => {
          // overall index in unfiltered list (for numbering)
          const idx = steps.findIndex((x) => x.id === s.id);
          const isActive = s.id === activeId;
          const isRenaming = renaming === s.id;
          // Don't allow drag when filtering or renaming (so text selection / input works)
          const dndActive = !query && !isRenaming;
          const source = dndActive ? dnd.sourceHandlers(s) : {};
          const target = dndActive ? dnd.targetHandlers(s) : {};
          const cls =
            "step-card" +
            (isActive ? " active" : "") +
            (dnd.isDragging(s.id) ? " is-dragging" : "") +
            (dnd.isOver(s.id) ? " is-drop-target" : "");
          return (
            <div
              key={s.id}
              className={cls}
              onClick={() => !isRenaming && onSelect(s.id)}
              {...source}
              {...target}
            >
              <span className="step-drag" onClick={(e) => e.stopPropagation()} title="Drag to reorder">
                <Ic.Grip size={14} />
              </span>
              <span className="step-card-num">{idx + 1}</span>
              <div className="step-card-body">
                {isRenaming ? (
                  <input
                    className="input"
                    style={{ padding: "3px 6px", fontSize: 13, fontWeight: 500 }}
                    value={draft}
                    autoFocus
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => { onRename(s.id, draft.trim() || s.name); setRenaming(null); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.target.blur();
                      if (e.key === "Escape") setRenaming(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <span className="step-card-name">{s.name}</span>
                    <span className="step-card-meta">
                      {s.fields.length} {s.fields.length === 1 ? "field" : "fields"}
                      {s.fields.some((f) => f.required) && " · required"}
                    </span>
                  </>
                )}
              </div>
              <div className="step-card-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn icon sm ghost"
                  title="Rename"
                  onClick={() => { setDraft(s.name); setRenaming(s.id); }}
                >
                  <Ic.Edit size={12} />
                </button>
                <button
                  className="btn icon sm ghost"
                  title="Move up"
                  onClick={() => onMove(s.id, -1)}
                  disabled={idx === 0}
                  style={idx === 0 ? { opacity: 0.3, pointerEvents: "none" } : {}}
                >
                  <Ic.ArrUp size={12} />
                </button>
                <button
                  className="btn icon sm ghost"
                  title="Move down"
                  onClick={() => onMove(s.id, 1)}
                  disabled={idx === steps.length - 1}
                  style={idx === steps.length - 1 ? { opacity: 0.3, pointerEvents: "none" } : {}}
                >
                  <Ic.ArrDn size={12} />
                </button>
                <button
                  className="btn icon sm danger-ghost"
                  title="Delete step"
                  onClick={() => onDelete(s.id)}
                >
                  <Ic.Trash size={12} />
                </button>
              </div>
            </div>
          );
        })}
        <button className="add-step" onClick={onAdd}>
          <Ic.Plus size={13} /> Add new step
        </button>
      </div>
    </div>
  );
}

window.StepList = StepList;
