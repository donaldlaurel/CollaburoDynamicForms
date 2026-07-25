// Sidebar — left navigation, collapsible.

function Sidebar({ collapsed, onToggle, active, onChangeSection }) {
  const Ic = window.Icons;
  return (
    <aside className="side">
      <div className="side-brand">
        <div className="side-brand-mark">C</div>
        {!collapsed && (
          <div className="side-brand-name">
            Collaburo
            <span>Admin</span>
          </div>
        )}
        <button className="side-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <Ic.PanelLeft size={16} />
        </button>
      </div>

      <div className="side-section">Configuration</div>
      <nav className="side-nav">
        {SIDE_NAV.map((n) => {
          const IconCmp = Ic[n.icon];
          return (
            <a
              key={n.id}
              className={"side-link" + (active === n.id ? " active" : "")}
              onClick={() => onChangeSection && onChangeSection(n.id)}
              title={collapsed ? n.label : undefined}
            >
              <span className="side-link-icon"><IconCmp size={16} /></span>
              <span className="side-link-label">{n.label}</span>
              {n.count && <span className="side-link-count">{n.count}</span>}
            </a>
          );
        })}
      </nav>

      <div className="side-section">Operations</div>
      <nav className="side-nav">
        {SIDE_NAV_BOTTOM.map((n) => {
          const IconCmp = Ic[n.icon];
          return (
            <a
              key={n.id}
              className={"side-link" + (active === n.id ? " active" : "")}
              onClick={() => onChangeSection && onChangeSection(n.id)}
              title={collapsed ? n.label : undefined}
            >
              <span className="side-link-icon"><IconCmp size={16} /></span>
              <span className="side-link-label">{n.label}</span>
              {n.count && <span className="side-link-count">{n.count}</span>}
            </a>
          );
        })}
      </nav>

      <div className="side-foot">
        <div className="side-avatar">EM</div>
        <div className="side-user">
          <b>Elena Marquez</b>
          <span>Venue Manager</span>
        </div>
      </div>
    </aside>
  );
}

window.Sidebar = Sidebar;
