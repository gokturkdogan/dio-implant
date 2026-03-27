import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin-panel")) {
    return NextResponse.next();
  }

  // Login sayfasına erişim serbest
  if (pathname === "/admin-panel/login") {
    return NextResponse.next();
  }

  // /admin-panel altındaki statik dosyaları (js/css/img) auth'tan muaf tut.
  // Aksi halde script istekleri login HTML'ine redirect olur ve
  // tarayıcı "Unexpected token '<'" hatası verir.
  if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-panel/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/admin-panel/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin-panel/:path*"],
};

