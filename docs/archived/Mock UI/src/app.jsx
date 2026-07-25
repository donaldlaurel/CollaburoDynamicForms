// Main app — composes sidebar, topbar, step list, field editor, preview.
// Persists steps to localStorage. Routes between sections.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#ed7a3c",
  "fontFamily": "geist",
  "density": "comfortable",
  "sidebarCollapsed": false,
  "populated": true
}/*EDITMODE-END*/;

const FONT_OPTIONS = {
  geist:    { stack: '"Geist", ui-sans-serif, system-ui, sans-serif', mono: '"Geist Mono", ui-monospace, monospace' },
  manrope:  { stack: '"Manrope", ui-sans-serif, system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
  plex:     { stack: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif', mono: '"IBM Plex Mono", ui-monospace, monospace' },
  inter:    { stack: '"Inter Tight", ui-sans-serif, system-ui, sans-serif', mono: '"JetBrains Mono", ui-monospace, monospace' },
};

const STORAGE_KEY = "collaburo.admin.workflow.v1";
const SAVED_KEY = "collaburo.admin.savedAt.v1";

let _uid = 1000;
const uid = (p) => `${p}_${++_uid}`;

function loadSteps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function App() {
  const Ic = window.Icons;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const { toasts, push: pushToast, dismiss: dismissToast } = window.useToasts();

  // Steps — load from localStorage, fallback to sample
  const [steps, setSteps] = React.useState(() => loadSteps() || window.SAMPLE_STEPS);
  const [activeStepId, setActiveStepId] = React.useState(() => (loadSteps() || window.SAMPLE_STEPS)[0]?.id || "s1");
  const [openFieldId, setOpenFieldId] = React.useState("f1");
  const [activeSection, setActiveSection] = React.useState("workflow");
  const [isDirty, setIsDirty] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [lastSavedAt, setLastSavedAt] = React.useState(() => {
    const v = parseInt(localStorage.getItem(SAVED_KEY) || "0", 10);
    return v || Date.now();
  });

  const stepsRef = React.useRef(steps);
  stepsRef.current = steps;

  // Empty-vs-populated tweak
  const populatedRef = React.useRef(t.populated);
  React.useEffect(() => {
    if (populatedRef.current === t.populated) return;
    populatedRef.current = t.populated;
    if (!t.populated) {
      const empty = [{ id: "s_empty", name: "Untitled Step", description: "", fields: [] }];
      setSteps(empty);
      setActiveStepId("s_empty");
      setOpenFieldId(null);
    } else {
      const next = loadSteps() || window.SAMPLE_STEPS;
      setSteps(next);
      setActiveStepId(next[0]?.id);
      setOpenFieldId(next[0]?.fields[0]?.id || null);
    }
  }, [t.populated]);

  // Apply font via CSS vars
  React.useEffect(() => {
    const f = FONT_OPTIONS[t.fontFamily] || FONT_OPTIONS.geist;
    document.documentElement.style.setProperty("--font-sans", f.stack);
    document.documentElement.style.setProperty("--font-mono", f.mono);
  }, [t.fontFamily]);

  // Apply accent
  React.useEffect(() => {
    document.documentElement.style.setProperty("--accent", t.accent);
    document.documentElement.style.setProperty("--accent-soft", `color-mix(in oklch, ${t.accent} 14%, white)`);
    document.documentElement.style.setProperty("--accent-soft-line", `color-mix(in oklch, ${t.accent} 35%, white)`);
    document.documentElement.style.setProperty("--surface-active", `color-mix(in oklch, ${t.accent} 10%, var(--surface-2))`);
  }, [t.accent]);

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];
  const activeStepIndex = steps.findIndex((s) => s.id === activeStepId);

  // ----- mutators -----
  const markDirty = () => setIsDirty(true);
  const updateStep = (next) => { setSteps(steps.map((s) => s.id === next.id ? next : s)); markDirty(); };
  const renameStep = (id, name) => { setSteps(steps.map((s) => s.id === id ? { ...s, name } : s)); markDirty(); };
  const moveStep = (id, delta) => {
    const i = steps.findIndex((s) => s.id === id);
    const j = i + delta;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next); markDirty();
  };
  const reorderSteps = (next) => { setSteps(next); markDirty(); };
  const deleteStep = (id) => {
    if (steps.length === 1) return;
    const i = steps.findIndex((s) => s.id === id);
    const next = steps.filter((s) => s.id !== id);
    setSteps(next);
    if (activeStepId === id) setActiveStepId(next[Math.max(0, i - 1)].id);
    markDirty();
    pushToast({ kind: "info", title: "Step deleted", desc: steps[i].name });
  };
  const addStep = () => {
    const ns = { id: uid("s"), name: `New step ${steps.length + 1}`, description: "", fields: [] };
    setSteps([...steps, ns]);
    setActiveStepId(ns.id);
    markDirty();
  };

  const addField = (type) => {
    const id = uid("f");
    const defaults = {
      id, type, label: defaultLabelFor(type), required: false,
      placeholder: "", visibleToClient: true,
    };
    setSteps(steps.map((s) =>
      s.id === activeStepId ? { ...s, fields: [...s.fields, defaults] } : s
    ));
    setOpenFieldId(id);
    markDirty();
  };
  const updateField = (fid, next) => {
    setSteps(steps.map((s) =>
      s.id === activeStepId
        ? { ...s, fields: s.fields.map((f) => f.id === fid ? next : f) }
        : s
    ));
    markDirty();
  };
  const duplicateField = (fid) => {
    let dupId = null;
    setSteps(steps.map((s) => {
      if (s.id !== activeStepId) return s;
      const i = s.fields.findIndex((f) => f.id === fid);
      const orig = s.fields[i];
      const copy = { ...orig, id: uid("f"), label: orig.label + " (copy)" };
      dupId = copy.id;
      const next = [...s.fields];
      next.splice(i + 1, 0, copy);
      return { ...s, fields: next };
    }));
    if (dupId) setOpenFieldId(dupId);
    markDirty();
  };
  const deleteField = (fid) => {
    setSteps(steps.map((s) =>
      s.id === activeStepId
        ? { ...s, fields: s.fields.filter((f) => f.id !== fid) }
        : s
    ));
    if (openFieldId === fid) setOpenFieldId(null);
    markDirty();
  };
  const reorderFields = (nextFields) => {
    setSteps(steps.map((s) => s.id === activeStepId ? { ...s, fields: nextFields } : s));
    markDirty();
  };

  // ----- save / publish -----
  const save = React.useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stepsRef.current));
      const now = Date.now();
      localStorage.setItem(SAVED_KEY, String(now));
      setLastSavedAt(now);
      setIsDirty(false);
      pushToast({ kind: "success", title: "Changes saved", desc: "Workflow draft updated" });
    } catch (e) {
      pushToast({ kind: "danger", title: "Save failed", desc: e.message });
    }
  }, [pushToast]);

  const publish = () => {
    save();
    pushToast({
      kind: "success",
      title: "Published to clients",
      desc: "New intake form is live at collaburo.app/book",
      duration: 4000,
    });
  };

  const resetToSample = () => {
    setSteps(window.SAMPLE_STEPS);
    setActiveStepId(window.SAMPLE_STEPS[0].id);
    setOpenFieldId(window.SAMPLE_STEPS[0].fields[0]?.id || null);
    setIsDirty(true);
    pushToast({ kind: "info", title: "Reset to sample", desc: "Click Save to persist" });
  };

  // ----- keyboard shortcuts -----
  React.useEffect(() => {
    const onKey = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty) save();
      }
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const inp = document.querySelector(".col-search input");
        inp && inp.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, save]);

  // ----- rendering -----
  const renderMain = () => {
    if (activeSection !== "workflow") {
      const stub = window.SECTION_STUBS[activeSection];
      return stub ? <StubView {...stub} /> : null;
    }
    return (
      <div className="workspace">
        <StepList
          steps={steps}
          activeId={activeStepId}
          onSelect={(id) => { setActiveStepId(id); setOpenFieldId(null); }}
          onMove={moveStep}
          onDelete={deleteStep}
          onAdd={addStep}
          onRename={renameStep}
          onReorder={reorderSteps}
        />
        <FieldEditor
          step={activeStep}
          onUpdateStep={updateStep}
          onAddField={addField}
          onDuplicateField={duplicateField}
          onDeleteField={deleteField}
          onUpdateField={updateField}
          openFieldId={openFieldId}
          onToggleField={(id) => setOpenFieldId(openFieldId === id ? null : id)}
          onReorderFields={reorderFields}
        />
      </div>
    );
  };

  const lastSavedLabel = relativeTime(lastSavedAt);

  return (
    <div
      className={
        "app" +
        (t.sidebarCollapsed ? " side-collapsed" : "") +
        (t.density === "compact" ? " density-compact" : "")
      }
      data-screen-label="Admin · Workflow Steps"
    >
      <Sidebar
        collapsed={t.sidebarCollapsed}
        onToggle={() => setTweak("sidebarCollapsed", !t.sidebarCollapsed)}
        active={activeSection}
        onChangeSection={setActiveSection}
      />

      <main className="main">
        <Topbar
          section={activeSection}
          previewOpen={previewOpen}
          onTogglePreview={() => setPreviewOpen(true)}
          isDirty={isDirty}
          lastSaved={lastSavedLabel}
          onSave={save}
          onPublish={publish}
          onReset={resetToSample}
        />
        {renderMain()}
      </main>

      {previewOpen && (
        <ClientPreview
          steps={steps}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      <ToastHost toasts={toasts} onDismiss={dismissToast} />

      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={["#ed7a3c", "#2a6fdb", "#1f8a5b", "#7a5ae0", "#262626"]}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSelect
          label="Font"
          value={t.fontFamily}
          options={[
            { value: "geist", label: "Geist" },
            { value: "manrope", label: "Manrope" },
            { value: "plex", label: "IBM Plex Sans" },
            { value: "inter", label: "Inter Tight" },
          ]}
          onChange={(v) => setTweak("fontFamily", v)}
        />
        <TweakRadio
          label="Density"
          value={t.density}
          options={["comfortable", "compact"]}
          onChange={(v) => setTweak("density", v)}
        />

        <TweakSection label="Layout" />
        <TweakToggle
          label="Sidebar collapsed"
          value={t.sidebarCollapsed}
          onChange={(v) => setTweak("sidebarCollapsed", v)}
        />

        <TweakSection label="State" />
        <TweakRadio
          label="Content"
          value={t.populated ? "populated" : "empty"}
          options={["populated", "empty"]}
          onChange={(v) => setTweak("populated", v === "populated")}
        />
        <TweakButton label="Reset to sample" onClick={resetToSample} />
      </TweaksPanel>
    </div>
  );
}

function defaultLabelFor(type) {
  return {
    text: "Untitled field",
    textarea: "Long answer",
    number: "Number",
    select: "Choose one",
    multiselect: "Choose any",
    date: "Date",
    daterange: "Date range",
    file: "Upload",
    price: "Price",
    toggle: "Toggle",
    room: "Choose a room",
    addons: "Add-ons",
  }[type] || "Untitled field";
}

function relativeTime(ts) {
  const diff = Date.now() - ts;
  const s = Math.round(diff / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
