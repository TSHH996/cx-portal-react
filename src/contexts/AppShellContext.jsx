/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { copyByLanguage, defaultLanguage, pageCopy } from "../lib/i18n";

const AppShellContext = createContext(null);

function getInitialLanguage() {
  return localStorage.getItem("cx-language") || defaultLanguage;
}

export function AppShellProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const direction = language === "ar" ? "rtl" : "ltr";
  const copy = copyByLanguage[language] || copyByLanguage.en;
  const theme = "dark";
  const brandTitle = copy.brandTitle || copyByLanguage.en.brandTitle;

  useEffect(() => {
    document.body.dataset.theme = "dark";
    localStorage.removeItem("cx-theme");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem("cx-language", language);
  }, [direction, language]);

  const value = useMemo(
    () => ({
      theme,
      language,
      direction,
      brandTitle,
      copy,
      pageCopy,
      toggleLanguage: () => setLanguage((current) => (current === "en" ? "ar" : "en")),
      setLanguage,
      openNewTicket: () => setIsNewTicketOpen(true),
      closeNewTicket: () => setIsNewTicketOpen(false),
      isNewTicketOpen,
      searchQuery,
      setSearchQuery,
      clearSearchQuery: () => setSearchQuery(""),
    }),
    [theme, language, direction, brandTitle, copy, isNewTicketOpen, searchQuery]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) throw new Error("useAppShell must be used within AppShellProvider");
  return context;
}
