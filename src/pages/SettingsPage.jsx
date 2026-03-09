import { useMemo, useState } from "react";
import { useEffect } from "react";
import SettingsNav from "../components/settings/SettingsNav";
import { BrandingPanel, EmailPanel, NotificationsPanel, PreferencesPanel, ProfilePanel } from "../components/settings/SettingsPanels";
import { useAppShell } from "../contexts/AppShellContext";
import { useToast } from "../contexts/ToastContext";

function SettingsPage() {
  const { copy, language, theme, setTheme, setLanguage, brandTitle, setBrandTitle } = useAppShell();
  const { showToast } = useToast();
  const [tab, setTab] = useState("profile");
  const [draftBrandTitle, setDraftBrandTitle] = useState(brandTitle);
  useEffect(() => {
    setDraftBrandTitle(brandTitle);
  }, [brandTitle]);

  const settingsCopy = useMemo(() => copy.settingsContent, [copy]);

  const content = {
    profile: <ProfilePanel settingsCopy={settingsCopy} />,
    branding: <BrandingPanel settingsCopy={settingsCopy} brandTitle={draftBrandTitle} onBrandTitleChange={setDraftBrandTitle} onSaveBrand={() => {
      const nextTitle = draftBrandTitle.trim() || brandTitle;
      setBrandTitle(nextTitle);
      showToast(copy.brandSavedTitle, copy.brandSavedText, "good");
    }} />,
    notifications: <NotificationsPanel settingsCopy={settingsCopy} />,
    preferences: <PreferencesPanel settingsCopy={settingsCopy} theme={theme} language={language} setTheme={setTheme} setLanguage={setLanguage} />,
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
