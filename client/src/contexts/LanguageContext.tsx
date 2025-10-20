import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, translations } from "@shared/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    if (saved && (saved as Language)) {
      return saved as Language;
    }
    
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("ko")) return "ko";
    if (browserLang.startsWith("ja")) return "ja";
    if (browserLang.startsWith("zh-cn") || browserLang === "zh") return "zh-CN";
    if (browserLang.startsWith("zh-tw") || browserLang === "zh-hant") return "zh-TW";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("de")) return "de";
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
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
