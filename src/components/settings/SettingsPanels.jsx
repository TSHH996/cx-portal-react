import { useAuth } from "../../contexts/AuthContext";

function PanelCard({ title, subtitle, children }) {
  return (
    <div className="surface-card">
      <div className="surface-card-head">
        <div className="card-heading">{title}</div>
        {subtitle ? <div className="card-subheading">{subtitle}</div> : null}
      </div>
      <div className="surface-card-body">{children}</div>
    </div>
  );
}

export function ProfilePanel({ settingsCopy }) {
  const { profile } = useAuth();

  return (
    <PanelCard title={settingsCopy.profileTitle} subtitle={settingsCopy.profileSub}>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.profileBodyTitle}</div>
        <div className="settingsProfileGrid">
          <div className="settingsProfileItem">
            <span className="settingsProfileLabel">{settingsCopy.accountNameLabel}</span>
            <bdi className="settingsProfileValue">{profile?.name || settingsCopy.profileUnavailable}</bdi>
          </div>
          <div className="settingsProfileItem">
            <span className="settingsProfileLabel">{settingsCopy.accountEmailLabel}</span>
            <bdi className="settingsProfileValue">{profile?.email || settingsCopy.profileUnavailable}</bdi>
          </div>
          <div className="settingsProfileItem">
            <span className="settingsProfileLabel">{settingsCopy.accountRoleLabel}</span>
            <bdi className="settingsProfileValue">{profile?.role === "admin" ? settingsCopy.accountRoleAdmin : settingsCopy.profileUnavailable}</bdi>
          </div>
          <div className="settingsProfileItem">
            <span className="settingsProfileLabel">{settingsCopy.accountAccessLabel}</span>
            <span className="soft-badge good">{profile?.isAdmin ? settingsCopy.accountAccessAdmin : settingsCopy.profileUnavailable}</span>
          </div>
        </div>
        <div className="panel-note">{settingsCopy.profileBodyText}</div>
      </div>
    </PanelCard>
  );
}

export function NotificationsPanel({ settingsCopy }) {
  return (
    <PanelCard title={settingsCopy.notificationsTitle} subtitle={settingsCopy.notificationsSub}>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.notificationsBodyTitle}</div>
        <div className="panel-note">{settingsCopy.notificationsBodyText}</div>
      </div>
    </PanelCard>
  );
}

export function PreferencesPanel({ settingsCopy, language, setLanguage }) {
  return (
    <PanelCard title={settingsCopy.preferencesTitle} subtitle={settingsCopy.preferencesSub}>
      <div className="settingsCards settingsCardsSingle">
        <div className="panel-card">
          <div className="panel-heading">{settingsCopy.currentLanguage}</div>
          <div className="field-row">
            <button type="button" className={`ghost-btn${language === "en" ? " active-chip" : ""}`} onClick={() => setLanguage("en")}>🇺🇸 {settingsCopy.englishLanguage}</button>
            <button type="button" className={`ghost-btn${language === "ar" ? " active-chip" : ""}`} onClick={() => setLanguage("ar")}>🇸🇦 {settingsCopy.arabicLanguage}</button>
          </div>
        </div>
      </div>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.darkModeTitle}</div>
        <div className="panel-note">{settingsCopy.darkModeText}</div>
      </div>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.preferencesBodyTitle}</div>
        <div className="panel-note">{settingsCopy.preferencesBodyText}</div>
        <div className="panel-note" style={{ marginTop: 8 }}>{settingsCopy.appearanceHint}</div>
      </div>
    </PanelCard>
  );
}

export function EmailPanel({ settingsCopy }) {
  return (
    <PanelCard title={settingsCopy.emailTitle} subtitle={settingsCopy.emailSub}>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.emailBodyTitle}</div>
        <div className="panel-note">{settingsCopy.emailBodyText}</div>
      </div>
    </PanelCard>
  );
}
