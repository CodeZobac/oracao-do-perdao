"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type Language, type MessageKey } from "./i18n";

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("pt-BR");
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${translate(language, "prayerTitle")} Cristina Cairo`;
  }, [language]);
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is required");
  return {
    ...context,
    t: (key: MessageKey, values?: Record<string, string | number>) => translate(context.language, key, values),
  };
}
