import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession } from "./require-admin-api";

/** Süper yönetici değilse panel ana sayfasına yönlendirir. */
export async function requireSuperAdminPage(): Promise<void> {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin-panel/login");
  }
  if (session.role !== "super_admin") {
    redirect("/admin-panel/hesap-bilgileri");
  }
}
