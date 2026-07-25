"use client";

import React from "react";
import "./icons";

// Drag-reorder hook — uses HTML5 native DnD, no library.
// Splits into sourceHandlers (apply to drag handle / row) and targetHandlers (apply to drop zone).

function useReorderable({ items, onReorder, idKey = "id" }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);
  const [overPos, setOverPos] = React.useState(null); // "above" | "below"
  // Native drag events can fire again before React has committed the state
  // update from dragstart/dragover. Refs keep the active drag synchronous so
  // the first drop is never ignored or calculated from a stale position.
  const draggingIdRef = React.useRef(null);
  const overIdRef = React.useRef(null);
  const overPosRef = React.useRef(null);

  const clearDrag = () => {
    draggingIdRef.current = null;
    overIdRef.current = null;
    overPosRef.current = null;
    setDraggingId(null);
    setOverId(null);
    setOverPos(null);
  };

  const setDropTarget = (id, position) => {
    overIdRef.current = id;
    overPosRef.current = position;
    setOverId(id);
    setOverPos(position);
  };

  const sourceHandlers = (item) => ({
    draggable: true,
    onDragStart: (e) => {
      const id = item[idKey];
      draggingIdRef.current = id;
      setDraggingId(id);
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", String(id)); } catch (_) {}
    },
    onDragEnd: clearDrag,
  });

  const targetHandlers = (item) => ({
    onDragEnter: (e) => {
      e.preventDefault();
      const activeId = draggingIdRef.current;
      if (activeId != null && item[idKey] !== activeId) {
        const rect = e.currentTarget.getBoundingClientRect();
        setDropTarget(item[idKey], e.clientY < rect.top + rect.height / 2 ? "above" : "below");
      }
    },
    onDragOver: (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const activeId = draggingIdRef.current;
      if (activeId != null && item[idKey] !== activeId) {
        const rect = e.currentTarget.getBoundingClientRect();
        const pos = e.clientY < rect.top + rect.height / 2 ? "above" : "below";
        if (overIdRef.current !== item[idKey] || overPosRef.current !== pos) {
          setDropTarget(item[idKey], pos);
        }
      }
    },
    onDragLeave: (e) => {
      if (overIdRef.current === item[idKey] && !e.currentTarget.contains(e.relatedTarget)) {
        overIdRef.current = null;
        overPosRef.current = null;
        setOverId(null);
        setOverPos(null);
      }
    },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      let activeId = draggingIdRef.current;
      if (activeId == null) {
        try { activeId = e.dataTransfer.getData("text/plain"); } catch (_) {}
      }
      const fromIdx = items.findIndex((it) => String(it[idKey]) === String(activeId));
      const toIdx = items.findIndex((it) => it[idKey] === item[idKey]);
      // Calculate from the actual drop point instead of relying on the final
      // dragover state, which can lag by one event near a row boundary.
      const rect = e.currentTarget.getBoundingClientRect();
      const dropBelow = e.clientY >= rect.top + rect.height / 2;
      clearDrag();
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
      const next = [...items];
      const [moved] = next.splice(fromIdx, 1);
      // Adjust insertion: if dropping below the target, insert after it
      const insertAt = dropBelow ? (toIdx > fromIdx ? toIdx : toIdx + 1) : (toIdx < fromIdx ? toIdx : toIdx - 1 < 0 ? 0 : toIdx);
      next.splice(insertAt < 0 ? 0 : insertAt, 0, moved);
      onReorder(next);
    },
  });

  // combined for simple cases
  const handlers = (item) => ({ ...sourceHandlers(item), ...targetHandlers(item) });

  return {
    handlers, sourceHandlers, targetHandlers,
    draggingId,
    isOver: (id) => overId === id && draggingId && draggingId !== id,
    overPosition: (id) => overId === id && draggingId && draggingId !== id ? overPos : null,
    isDragging: (id) => draggingId === id,
  };
}

window.useReorderable = useReorderable;



// Toast notifications — bottom-center stack, auto-dismiss.

function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="toast-host">
      {toasts.map((t) => (
        <div key={t.id} className={"toast toast-" + (t.kind || "info")}>
          <span className="toast-dot" />
          <div className="toast-body">
            <b>{t.title}</b>
            {t.desc && <span>{t.desc}</span>}
          </div>
          {t.action && (
            <button className="btn sm ghost" onClick={() => { t.action.run(); onDismiss(t.id); }}>
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function useToasts() {
  const [toasts, setToasts] = React.useState([]);
  const idRef = React.useRef(0);
  const push = React.useCallback((t) => {
    const id = ++idRef.current;
    setToasts((cur) => [...cur, { ...t, id }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((x) => x.id !== id));
    }, t.duration || 2800);
  }, []);
  const dismiss = (id) => setToasts((cur) => cur.filter((x) => x.id !== id));
  return { toasts, push, dismiss };
}

window.ToastHost = ToastHost;
window.useToasts = useToasts;



// Placeholder views for sections that aren't built yet (admin is page 1 of 4).

function StubView({ icon, title, blurb, status = "Coming next" }) {
  const Ic = window.Icons;
  const IconCmp = window.Icons[icon] || Ic.Layers;
  return (
    <div className="stub">
      <div className="stub-card">
        <div className="ill"><IconCmp size={28} /></div>
        <div className="stub-meta">{status}</div>
        <h2>{title}</h2>
        <p>{blurb}</p>
        <button className="btn primary sm">
          <Ic.Plus size={12} /> Request this view
        </button>
      </div>
    </div>
  );
}

const SECTION_STUBS = {
  rentals: {
    icon: "Tag",
    title: "Rentals catalog",
    blurb: "Manage chairs, linens, AV kits, and other rental items with images, pricing, and stock. Fields tagged 'Linked to pricing' in the Workflow will pull from this catalog.",
  },
  pricing: {
    icon: "Dollar",
    title: "Pricing rules",
    blurb: "Define base hourly rates per room, surcharges, and conditional discounts (non-profit, student body, off-peak). The client-facing quote calculator runs on top of this.",
  },
  site: {
    icon: "Settings",
    title: "Site settings",
    blurb: "Brand colors, logo, contact email, terms & conditions, and integrations with your calendar and payment processor.",
  },
  clients: {
    icon: "Users",
    title: "Clients (page 3)",
    blurb: "A searchable, filterable table of every client who has filled out the form. We'll build this after you sign off on the admin and client views.",
    status: "Page 3 of 4",
  },
  calendar: {
    icon: "Cal",
    title: "Booking calendar",
    blurb: "Month / week / day grid of confirmed bookings, holds, and tour appointments across all four rooms.",
  },
  reports: {
    icon: "Chart",
    title: "Reports",
    blurb: "Revenue by room, conversion from inquiry to booking, top-grossing add-ons, lead source attribution.",
  },
};

window.StubView = StubView;
window.SECTION_STUBS = SECTION_STUBS;
