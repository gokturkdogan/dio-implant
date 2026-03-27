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

    return jsonOk({
      authenticated: true,
      username: payload.username ?? null,
      expiresAt: exp ? exp * 1000 : null,
    });
  } catch (error) {
    return jsonError(error);
  }
}

