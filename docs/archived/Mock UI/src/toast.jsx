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
