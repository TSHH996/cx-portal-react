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
  return (
    <PanelCard title={settingsCopy.profileTitle} subtitle={settingsCopy.profileSub}>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.profileBodyTitle}</div>
        <div className="panel-note">{settingsCopy.profileBodyText}</div>
      </div>
    </PanelCard>
  );
}

export function BrandingPanel({ settingsCopy, brandTitle, onBrandTitleChange, onSaveBrand }) {
  return (
    <PanelCard title={settingsCopy.brandingTitle} subtitle={settingsCopy.brandingSub}>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.portalTitle}</div>
        <div className="field-row">
          <input className="settingsInput" value={brandTitle} onChange={(e) => onBrandTitleChange(e.target.value)} placeholder={settingsCopy.portalTitle} />
          <button type="button" className="primary-btn" onClick={onSaveBrand}>💾 {settingsCopy.save}</button>
        </div>
      </div>
      <div className="panel-card">
        <div className="panel-heading">{settingsCopy.emailModePanelTitle}</div>
        <div className="panel-note">{settingsCopy.emailModePanelText}</div>
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

export function PreferencesPanel({ settingsCopy, theme, language, setTheme, setLanguage }) {
  return (
    <PanelCard title={settingsCopy.preferencesTitle} subtitle={settingsCopy.preferencesSub}>
      <div className="settingsCards">
        <div className="panel-card">
          <div className="panel-heading">{settingsCopy.currentTheme}</div>
          <div className="field-row">
            <button type="button" className={`ghost-btn${theme === "dark" ? " active-chip" : ""}`} onClick={() => setTheme("dark")}>🌙 {settingsCopy.darkTheme}</button>
            <button type="button" className={`ghost-btn${theme === "light" ? " active-chip" : ""}`} onClick={() => setTheme("light")}>☀️ {settingsCopy.lightTheme}</button>
          </div>
        </div>
        <div className="panel-card">
          <div className="panel-heading">{settingsCopy.currentLanguage}</div>
          <div className="field-row">
            <button type="button" className={`ghost-btn${language === "en" ? " active-chip" : ""}`} onClick={() => setLanguage("en")}>🇺🇸 {settingsCopy.englishLanguage}</button>
            <button type="button" className={`ghost-btn${language === "ar" ? " active-chip" : ""}`} onClick={() => setLanguage("ar")}>🇸🇦 {settingsCopy.arabicLanguage}</button>
          </div>
        </div>
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
