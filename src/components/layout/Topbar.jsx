import { useAppShell } from "../../contexts/AppShellContext";

function Topbar({ title, subtitle }) {
  const { copy, brandTitle } = useAppShell();

  return (
    <header className="topbar-shell">
      <div className="topbar-title-block">
        <div className="topbar-brand-line">
          <span className="eyebrow-text">{brandTitle}</span>
          <span className="topbar-separator" />
          <span className="topbar-context-pill">{copy.connectedBadge || copy.connected}</span>
        </div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="topbar-actions">
        <div className="search-shell">
          <span className="search-icon">🔎</span>
          <input type="text" placeholder={copy.searchPlaceholder} disabled />
          <span className="keycap">Ctrl/⌘ K</span>
        </div>
        <button type="button" className="ghost-btn">🔄 {copy.refresh}</button>
        <button type="button" className="ghost-btn">⬇️ {copy.export}</button>
      </div>
    </header>
  );
}

export default Topbar;
