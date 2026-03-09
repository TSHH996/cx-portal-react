function SettingsNav({ copy, activeTab, onSelect }) {
  const items = [
    { key: "profile", label: copy.settingsItemProfile },
    { key: "branding", label: copy.settingsItemBranding },
    { key: "notifications", label: copy.settingsItemNotifications },
    { key: "preferences", label: copy.settingsItemPreferences },
    { key: "email", label: copy.settingsItemEmail },
  ];

  return (
    <div className="settingsMenu surface-card">
      <div className="surface-card-head">
        <div className="card-heading">{copy.settingsMainTitle}</div>
        <div className="card-subheading">{copy.settingsMainSub}</div>
      </div>
      <div className="settingsNavList">
        {items.map((item) => (
          <button key={item.key} type="button" className={`settingsItem${activeTab === item.key ? " active" : ""}`} onClick={() => onSelect(item.key)}>
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SettingsNav;
