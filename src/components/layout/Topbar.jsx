import { useEffect, useRef } from "react";
import { useAppShell } from "../../contexts/AppShellContext";

function Topbar({ title, subtitle }) {
  const { copy, brandTitle, searchQuery, setSearchQuery, clearSearchQuery } = useAppShell();
  const inputRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      const isShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isShortcut) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }

      if (event.key === "Escape" && document.activeElement === inputRef.current) {
        clearSearchQuery();
        inputRef.current?.blur();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSearchQuery]);

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
          <input ref={inputRef} dir="auto" type="text" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchPlaceholder} />
          <span className="keycap">Ctrl/⌘ K</span>
        </div>
        <button type="button" className="ghost-btn">🔄 {copy.refresh}</button>
        <button type="button" className="ghost-btn">⬇️ {copy.export}</button>
      </div>
    </header>
  );
}

export default Topbar;
