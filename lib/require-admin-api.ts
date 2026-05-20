import { cookies } from "next/headers";
import {
  ADMIN_COOKIE_NAME,
  type AdminTokenPayload,
  verifyAdminToken,
} from "./admin-auth";

export type AdminSession = {
  userId: number;
  username: string;
  role: AdminTokenPayload["role"];
  firstName: string;
  lastName: string;
};

async function readAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAdminToken(token);
    const id = parseInt(String(payload.sub), 10);
    if (!Number.isFinite(id) || id <= 0) return null;

    const role =
      payload.role === "admin" || payload.role === "super_admin"
        ? payload.role
        : null;
    if (!role) return null;

    const username =
      typeof payload.username === "string" ? payload.username.trim() : "";
    if (!username) return null;

    return {
      userId: id,
      username,
      role,
      firstName:
        typeof payload.firstName === "string" ? payload.firstName : "",
      lastName: typeof payload.lastName === "string" ? payload.lastName : "",
    };
  } catch {
    return null;
  }
}

export async function requireAdminApi(): Promise<boolean> {
  return (await readAdminSession()) !== null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  return readAdminSession();
}

/** Oturum JWT `sub` alanından kullanıcı id. */
export async function getAdminUserId(): Promise<number | null> {
  const session = await readAdminSession();
  return session?.userId ?? null;
}

export async function requireSuperAdminApi(): Promise<boolean> {
  const session = await readAdminSession();
  return session?.role === "super_admin";
}
