import { useMemo, useState } from "react";
import SettingsNav from "../components/settings/SettingsNav";
import { EmailPanel, NotificationsPanel, PreferencesPanel, ProfilePanel } from "../components/settings/SettingsPanels";
import { useAppShell } from "../contexts/AppShellContext";

function SettingsPage() {
  const { copy, language, setLanguage } = useAppShell();
  const [tab, setTab] = useState("profile");

  const settingsCopy = useMemo(() => copy.settingsContent, [copy]);

  const content = {
    profile: <ProfilePanel settingsCopy={settingsCopy} />,
    notifications: <NotificationsPanel settingsCopy={settingsCopy} />,
    preferences: <PreferencesPanel settingsCopy={settingsCopy} language={language} setLanguage={setLanguage} />,
    email: <EmailPanel settingsCopy={settingsCopy} />,
  };

  return (
    <div className="settingsLayoutReact">
      <SettingsNav copy={copy} activeTab={tab} onSelect={setTab} />
      <div className="settingsContentReact">{content[tab]}</div>
    </div>
  );
}

export default SettingsPage;
