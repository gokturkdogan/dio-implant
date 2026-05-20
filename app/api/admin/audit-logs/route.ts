import { jsonError, jsonOk } from "@/lib/http";
import { requireSuperAdminApi } from "@/lib/require-admin-api";
import { adminAuditService } from "@/services/admin-audit.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    if (!(await requireSuperAdminApi())) {
      return jsonOk({ error: "Bu işlem için süper yönetici yetkisi gerekir." }, 403);
    }

    const url = new URL(request.url);
    const limit = Math.min(
      200,
      Math.max(1, parseInt(url.searchParams.get("limit") ?? "50", 10) || 50),
    );
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10) || 0);

    const { logs, total } = await adminAuditService.listForSuperAdmin(limit, offset);
    return jsonOk({ logs, total, limit, offset });
  } catch (e) {
    return jsonError(e);
  }
}
