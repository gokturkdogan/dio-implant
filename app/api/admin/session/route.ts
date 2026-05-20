import { cookies } from "next/headers";
import { jsonError, jsonOk } from "../../../../lib/http";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/admin-auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return jsonOk({ authenticated: false });

    const payload = await verifyAdminToken(token);
    const exp = typeof payload.exp === "number" ? payload.exp : null;

    const role =
      payload.role === "admin" || payload.role === "super_admin"
        ? payload.role
        : null;

    const firstName =
      typeof payload.firstName === "string" ? payload.firstName : null;
    const lastName =
      typeof payload.lastName === "string" ? payload.lastName : null;

    return jsonOk({
      authenticated: true,
      username: typeof payload.username === "string" ? payload.username : null,
      firstName,
      lastName,
      role,
      expiresAt: exp ? exp * 1000 : null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

