/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copyByLanguage, defaultLanguage, pageCopy } from "../lib/i18n";

const AppShellContext = createContext(null);

function getInitialTheme() {
  return localStorage.getItem("cx-theme") || "dark";
}

function getInitialLanguage() {
  return localStorage.getItem("cx-language") || defaultLanguage;
}

function getInitialBrandTitle() {
  return localStorage.getItem("cx-brand-title") || "CX Portal";
}

export function AppShellProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [language, setLanguage] = useState(getInitialLanguage);
  const [brandTitle, setBrandTitle] = useState(getInitialBrandTitle);

  const direction = language === "ar" ? "rtl" : "ltr";
  const copy = copyByLanguage[language] || copyByLanguage.en;

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("cx-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem("cx-language", language);
  }, [direction, language]);

  useEffect(() => {
    localStorage.setItem("cx-brand-title", brandTitle);
  }, [brandTitle]);

  const value = useMemo(
    () => ({
      theme,
      language,
      direction,
      brandTitle,
      copy,
      pageCopy,
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "ar" : "en")),
      setTheme,
      setLanguage,
      setBrandTitle,
    }),
    [theme, language, direction, brandTitle, copy]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error("useAppShell must be used within AppShellProvider");
  return context;
}
