import { NextResponse } from "next/server";
import { clearAdminCookie } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
  await clearAdminCookie();
  const redirectUrl = new URL("/admin-panel/login", request.url);
  return NextResponse.redirect(redirectUrl, { status: 303 });
}

