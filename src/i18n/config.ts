export const locales = ["en", "es", "it", "fr", "ko", "ar", "zh", "de", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Espanol",
  it: "Italiano",
  fr: "Francais",
  ko: "한국어",
  ar: "العربية",
  zh: "中文",
  de: "Deutsch",
  ru: "Русский",
};

// RTL languages
export const rtlLocales: Locale[] = ["ar"];
export const isRTL = (locale: Locale) => rtlLocales.includes(locale);
