import { cookies } from "next/headers";
import { LOCALE_COOKIE, resolveLocale, type Locale } from "./locale";

/**
 * Reads the active locale from the request cookie. Server-only.
 * Falls back to the default locale when the cookie is missing or invalid.
 */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return resolveLocale(store.get(LOCALE_COOKIE)?.value);
}
