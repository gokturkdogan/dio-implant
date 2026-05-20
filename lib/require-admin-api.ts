import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "./admin-auth";

export async function requireAdminApi(): Promise<boolean> {
  return (await getAdminUserId()) !== null;
}

/** Oturum JWT `sub` alanından kullanıcı id. */
export async function getAdminUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAdminToken(token);
    const id = parseInt(String(payload.sub), 10);
    return Number.isFinite(id) && id > 0 ? id : null;
  } catch {
    return null;
  }
}
