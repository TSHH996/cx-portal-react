import { useAppShell } from "../../contexts/AppShellContext";

function Topbar({ title, subtitle }) {
  const { copy, brandTitle } = useAppShell();

  return (
    <header className="topbar-shell">
      <div>
        <div className="eyebrow-text">{brandTitle}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>

      <div className="topbar-actions">
        <div className="search-shell">
          <span>🔎</span>
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
