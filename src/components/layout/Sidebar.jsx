import { NavLink } from "react-router-dom";
import { useAppShell } from "../../contexts/AppShellContext";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

const navItems = [
  { to: "/dashboard", icon: "📊", key: "dashboard", pill: { en: "Live", ar: "مباشر" } },
  { to: "/tickets", icon: "🎫", key: "tickets", pill: { en: "Inbox", ar: "الوارد" } },
  { to: "/reports", icon: "📈", key: "reports", pill: { en: "Weekly", ar: "أسبوعي" } },
  { to: "/settings", icon: "⚙️", key: "settings", pill: { en: "UI", ar: "واجهة" } },
];

function Sidebar() {
  const { copy, language, toggleLanguage, toggleTheme, theme, pageCopy, brandTitle } = useAppShell();
  const { signOut } = useAuth();
  const { showToast } = useToast();

  async function handleLogout() {
    if (!window.confirm(copy.logoutConfirm)) return;
    await signOut();
    showToast(copy.logoutTxt, copy.logoutSuccess, "good");
  }

  return (
    <aside className="sidebar-shell">
      <div className="sidebar-top">
        <div className="brand-row">
          <div className="logo-mark">CX</div>
          <div>
            <div className="eyebrow-text">{copy.brandEyebrow}</div>
            <div className="brand-title">{brandTitle}</div>
            <div className="brand-subtitle">{copy.brandSub}</div>
          </div>
        </div>
      </div>

      <div className="sidebar-label">{copy.workspace}</div>

      <nav className="nav-list">
        {navItems.map((item) => {
          const labels = pageCopy[item.key][language];
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
              <div className="nav-left">
                <div className="nav-icon">{item.icon}</div>
                <div>
                  <div className="nav-title">{labels.title}</div>
                  <div className="nav-subtitle">{labels.sub}</div>
                </div>
              </div>
              <span className="nav-pill">{item.pill[language]}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        <div className="team-card">
          <div className="team-avatar">CX</div>
          <div>
            <div className="team-title">{copy.teamTitle}</div>
            <div className="team-subtitle">{copy.teamSub}</div>
          </div>
        </div>

        <div className="badge-row">
          <span className="soft-badge">{copy.branchesBadge}</span>
          <span className="soft-badge">React + Vite</span>
          <span className="soft-badge">Supabase</span>
        </div>

        <div className="toggle-row">
          <button type="button" className="ghost-btn" onClick={toggleTheme}>
            {theme === "dark" ? "🌙" : "☀️"} {copy.themeLabel}
          </button>
          <button type="button" className="ghost-btn" onClick={toggleLanguage}>
            {language === "en" ? "🇺🇸 EN" : "🇸🇦 AR"}
          </button>
          <button type="button" className="ghost-btn" onClick={handleLogout}>
            ↩ {copy.logoutTxt}
          </button>
        </div>

        <button type="button" className="primary-btn wide-btn">＋ {copy.newTicket}</button>
      </div>
    </aside>
  );
}

export default Sidebar;
