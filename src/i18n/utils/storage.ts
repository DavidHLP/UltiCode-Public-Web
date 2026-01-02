const LOCALE_STORAGE_KEY = "ulticode-locale";

export function getStoredLocale(): string | null {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredLocale(locale: string): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    console.warn("Failed to store locale preference");
  }
}

export function removeStoredLocale(): void {
  try {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  } catch {
    console.warn("Failed to remove locale preference");
  }
}
