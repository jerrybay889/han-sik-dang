import { createContext, useContext, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Language, translations } from "@shared/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  
  const language = (i18n.language as Language) || "en";

  const setLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  const t = (key: string): string => {
    const translation = translations[language];
    return translation?.[key as keyof typeof translation] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
