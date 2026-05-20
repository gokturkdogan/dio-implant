import { jsonError, jsonOk } from "@/lib/http";
import { requireSuperAdminApi } from "@/lib/require-admin-api";
import { userService } from "@/services/user.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireSuperAdminApi())) {
      return jsonOk({ error: "Bu işlem için süper yönetici yetkisi gerekir." }, 403);
    }
    const users = await userService.listForAdmin();
    return jsonOk({ users });
  } catch (e) {
    return jsonError(e);
  }
}
