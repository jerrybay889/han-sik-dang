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
    if (browserLang.startsWith("en")) return "en";
    if (browserLang.startsWith("ja")) return "ja";
    if (browserLang.startsWith("zh-cn") || browserLang === "zh") return "zh-CN";
    if (browserLang.startsWith("zh-tw") || browserLang === "zh-hant") return "zh-TW";
    if (browserLang.startsWith("es")) return "es";
    if (browserLang.startsWith("fr")) return "fr";
    if (browserLang.startsWith("de")) return "de";
    if (browserLang.startsWith("vi")) return "vi";
    return "ko";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
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
