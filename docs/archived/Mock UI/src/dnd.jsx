// Drag-reorder hook — uses HTML5 native DnD, no library.
// Splits into sourceHandlers (apply to drag handle / row) and targetHandlers (apply to drop zone).

function useReorderable({ items, onReorder, idKey = "id" }) {
  const [draggingId, setDraggingId] = React.useState(null);
  const [overId, setOverId] = React.useState(null);

  const sourceHandlers = (item) => ({
    draggable: true,
    onDragStart: (e) => {
      setDraggingId(item[idKey]);
      e.dataTransfer.effectAllowed = "move";
      try { e.dataTransfer.setData("text/plain", String(item[idKey])); } catch (_) {}
    },
    onDragEnd: () => { setDraggingId(null); setOverId(null); },
  });

  const targetHandlers = (item) => ({
    onDragEnter: (e) => {
      e.preventDefault();
      if (draggingId && item[idKey] !== draggingId) setOverId(item[idKey]);
    },
    onDragOver: (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; },
    onDragLeave: (e) => {
      if (overId === item[idKey] && !e.currentTarget.contains(e.relatedTarget)) {
        setOverId(null);
      }
    },
    onDrop: (e) => {
      e.preventDefault();
      const from = items.findIndex((it) => it[idKey] === draggingId);
      const to = items.findIndex((it) => it[idKey] === item[idKey]);
      setDraggingId(null);
      setOverId(null);
      if (from < 0 || to < 0 || from === to) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    },
  });

  // combined for simple cases
  const handlers = (item) => ({ ...sourceHandlers(item), ...targetHandlers(item) });

  return {
    handlers, sourceHandlers, targetHandlers,
    draggingId,
    isOver: (id) => overId === id && draggingId && draggingId !== id,
    isDragging: (id) => draggingId === id,
  };
}

window.useReorderable = useReorderable;
