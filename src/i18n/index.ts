import { createI18n } from "vue-i18n";
import zhCN from "./locales/zh-CN";
import enUS from "./locales/en-US";
import { getStoredLocale } from "./utils/storage";

// Supported locales
export const SUPPORTED_LOCALES = ["zh-CN", "en-US"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

// Locale configuration
export interface LocaleConfig {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  flag: string;
}

export const LOCALE_CONFIGS: Record<SupportedLocale, LocaleConfig> = {
  "zh-CN": {
    code: "zh-CN",
    name: "Chinese (Simplified)",
    nativeName: "简体中文",
    flag: "🇨🇳",
  },
  "en-US": {
    code: "en-US",
    name: "English (US)",
    nativeName: "English",
    flag: "🇺🇸",
  },
};

// Default and fallback locale
export const DEFAULT_LOCALE: SupportedLocale = "zh-CN";
export const FALLBACK_LOCALE: SupportedLocale = "zh-CN";

/**
 * Detect browser locale and match to supported locales
 */
function detectBrowserLocale(): SupportedLocale | null {
  if (typeof navigator === "undefined") return null;

  const languages = navigator.languages || [navigator.language];

  for (const lang of languages) {
    // Exact match
    if (SUPPORTED_LOCALES.includes(lang as SupportedLocale)) {
      return lang as SupportedLocale;
    }

    // Language code match (e.g., zh matches zh-CN)
    const langCode = lang.split("-")[0] ?? "";
    for (const supportedLocale of SUPPORTED_LOCALES) {
      if (supportedLocale.startsWith(langCode)) {
        return supportedLocale;
      }
    }
  }

  return null;
}

/**
 * Get initial locale based on:
 * 1. Stored preference
 * 2. Browser language
 * 3. Default locale
 */
function getInitialLocale(): SupportedLocale {
  // 1. Check stored preference
  const stored = getStoredLocale();
  if (stored && SUPPORTED_LOCALES.includes(stored as SupportedLocale)) {
    return stored as SupportedLocale;
  }

  // 2. Detect browser locale
  const detected = detectBrowserLocale();
  if (detected) {
    return detected;
  }

  // 3. Use default locale
  return DEFAULT_LOCALE;
}

// Create i18n instance with simple typing
export const i18n = createI18n({
  legacy: false, // Use Composition API
  globalInjection: true, // Inject $t globally
  locale: getInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages: {
    "zh-CN": zhCN,
    "en-US": enUS,
  },
});

export default i18n;
