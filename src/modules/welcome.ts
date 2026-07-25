export const WELCOME_DISMISSED_STORAGE_KEY = "ling:welcome-guide:dismissed:v1";

export type WelcomeStorage = Pick<Storage, "getItem" | "setItem">;

export function getBrowserWelcomeStorage(): WelcomeStorage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function hasDismissedWelcome(storage: WelcomeStorage): boolean | null {
  try {
    return storage.getItem(WELCOME_DISMISSED_STORAGE_KEY) === "true";
  } catch {
    return null;
  }
}

export function dismissWelcome(storage: WelcomeStorage): boolean {
  try {
    storage.setItem(WELCOME_DISMISSED_STORAGE_KEY, "true");
    return true;
  } catch {
    return false;
  }
}
