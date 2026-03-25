export const CONTACT_RETURN_KEY = "mincfo:contact-return";

type ContactReturnTarget = {
  path: string;
  sectionId?: string;
};

export function saveContactReturnLocation(target: ContactReturnTarget) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(CONTACT_RETURN_KEY, JSON.stringify(target));
}

export function readContactReturnLocation(): ContactReturnTarget | null {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(CONTACT_RETURN_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ContactReturnTarget;
    if (!parsed.path) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearContactReturnLocation() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(CONTACT_RETURN_KEY);
}
