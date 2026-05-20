import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./lib/admin-auth";

const ADMIN_LOGIN_PATH = "/admin-panel/login";
const ADMIN_FORGOT_PASSWORD_PATH = "/admin-panel/sifremi-unuttum";
const ADMIN_RESET_PASSWORD_PATH = "/admin-panel/parola-sifirla";

const ADMIN_PUBLIC_PATHS = new Set([
  ADMIN_LOGIN_PATH,
  ADMIN_FORGOT_PASSWORD_PATH,
  ADMIN_RESET_PASSWORD_PATH,
]);
const MAINTENANCE_PATH = "/maintenance";
const MAINTENANCE_STATUS_API = "/api/public/site-maintenance";

function isStaticAsset(pathname: string) {
  return /\.[a-zA-Z0-9]+$/.test(pathname);
}

async function getMaintenanceEnabled(request: NextRequest): Promise<boolean> {
  try {
    const statusUrl = new URL(MAINTENANCE_STATUS_API, request.nextUrl.origin);
    const res = await fetch(statusUrl, {
      headers: { "x-middleware-request": "1" },
      cache: "no-store",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { enabled?: unknown };
    return data.enabled === true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Next static dosyaları ve common public assets geçsin.
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // Admin panel auth akışı.
  if (pathname.startsWith("/admin-panel")) {
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

  // API uçları bakım modundan etkilenmesin (admin yönetimi ve veri akışları açık kalsın).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Public static dosyaları geç.
  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  // Bakım sayfası ve status endpoint loop'a girmesin.
  if (pathname === MAINTENANCE_PATH || pathname === MAINTENANCE_STATUS_API) {
    return NextResponse.next();
  }

  const maintenanceEnabled = await getMaintenanceEnabled(request);
  if (maintenanceEnabled) {
    const url = request.nextUrl.clone();
    url.pathname = MAINTENANCE_PATH;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};

