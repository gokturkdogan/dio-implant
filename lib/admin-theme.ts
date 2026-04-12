/** localStorage key — keep in sync with `public/admin-panel/theme-toggle.js` */
export const ADMIN_THEME_LOCAL_STORAGE_KEY = "dio:adminTheme";

/** Non-httpOnly cookie so SSR can mirror theme on `<html>` (avoids light-theme flash). */
export const ADMIN_THEME_COOKIE_NAME = "dio_admin_theme";

export type AdminThemePreference = "light" | "dark";

export function parseAdminThemeCookie(
  value: string | undefined,
): AdminThemePreference | undefined {
  if (value === "light" || value === "dark") return value;
  return undefined;
}
