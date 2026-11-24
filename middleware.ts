import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./lib/admin-auth";

const ADMIN_LOGIN_PATH = "/admin-panel/login";
const ADMIN_FORGOT_PASSWORD_PATH = "/admin-panel/sifremi-unuttum";
const ADMIN_RESET_PASSWORD_PATH = "/admin-panel/parola-sifirla";
const ADMIN_USER_SETUP_PATH = "/admin-panel/kullanici-parola-olustur";

const ADMIN_PUBLIC_PATHS = new Set([
  ADMIN_LOGIN_PATH,
  ADMIN_FORGOT_PASSWORD_PATH,
  ADMIN_RESET_PASSWORD_PATH,
  ADMIN_USER_SETUP_PATH,
]);

function isStaticAsset(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

/**
 * Yalnızca admin paneli oturum kontrolü. Public sayfalar middleware'den hiç geçmez;
 * bakım modu `app/(site)/layout.tsx` içinde sayfa render'ında uygulanır.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Giriş ve şifremi unuttum sayfalarına erişim serbest
  if (ADMIN_PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // /admin-panel altındaki statik dosyaları auth'tan muaf tut.
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = ADMIN_LOGIN_PATH;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  /** Middleware yalnızca admin panelinde çalışır. */
  matcher: ["/admin-panel", "/admin-panel/:path*"],
};
