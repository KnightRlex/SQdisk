import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Formato: { code: "código i18next", label: "CÓDIGO Nombre del idioma" }
const languages = [
  { code: "de", label: "DE Deutsch" },
  { code: "ar", label: "AR العربية" },
  { code: "id", label: "ID Bahasa Indonesia" },
  { code: "bg", label: "BG Български" },
  { code: "zh-CN", label: "CN 简体中文" },
  { code: "zh-TW", label: "TW 繁體中文" },
  { code: "cs", label: "CS Čeština" },
  { code: "ko", label: "KO 한국어" },
  { code: "hr", label: "HR Hrvatski" },
  { code: "da", label: "DA Dansk" },
  { code: "en", label: "EN English" },
  { code: "es", label: "ES Español" },
  { code: "sk", label: "SK Slovenčina" },
  { code: "fi", label: "FI Suomi" },
  { code: "fr", label: "FR Français" },
  { code: "el", label: "EL Ελληνικά" },
  { code: "hi", label: "HI हिन्दी" },
  { code: "nl", label: "NL Nederlands" },
  { code: "is", label: "IS Íslenska" },
  { code: "it", label: "IT Italiano" },
  { code: "ja", label: "JA 日本語" },
  { code: "mn", label: "MN Монгол" },
  { code: "no", label: "NO Norsk" },
  { code: "fa", label: "FA فارسی" },
  { code: "pl", label: "PL Polski" },
  { code: "pt", label: "PT Português" },
  { code: "ru", label: "RU Русский" },
  { code: "ro", label: "RO Română" },
  { code: "sv", label: "SV Svenska" },
  { code: "th", label: "TH ไทย" },
  { code: "tr", label: "TR Türkçe" },
  { code: "vi", label: "VI Tiếng Việt" }
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem('appLanguage', code);
    setIsOpen(false);
  };

  // Obtener el idioma actual
  const currentLang = languages.find(l => l.code === i18n.language) || languages[10];

  return (
    <div className="absolute top-2 right-24 z-50" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs px-2 py-1 rounded bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 border border-gray-700/50 transition-colors font-mono"
        style={{ WebkitAppRegion: "no-drag" } as any}
      >
        {currentLang.label}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg overflow-hidden max-h-96 overflow-y-auto">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-gray-700 flex items-center gap-2 font-mono ${
                i18n.language === lang.code ? "bg-gray-600/50 text-white font-bold" : ""
              }`}
            >
              <span className="text-gray-500 w-8">{lang.label.split(' ')[0]}</span>
              <span>{lang.label.split(' ').slice(1).join(' ')}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};