import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./admin-auth";

export async function requireAdminApi(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}
