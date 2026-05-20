import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { siteMaintenanceService } from "@/services/site-maintenance.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const setting = await siteMaintenanceService.get();
    return jsonOk({
      maintenance: {
        enabled: setting?.enabled ?? false,
        message: setting?.message ?? "",
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = (await request.json()) as { enabled?: unknown; message?: unknown };
    if (typeof body.enabled !== "boolean") {
      return jsonOk({ error: "Geçersiz istek" }, 400);
    }
    const message = typeof body.message === "string" ? body.message : "";
    const updated = await siteMaintenanceService.upsert({
      enabled: body.enabled,
      message,
    });
    await auditAdminAction({
      action: "update",
      resourceType: "site_maintenance",
      resourceLabel: updated.enabled ? "Bakım modu açıldı" : "Bakım modu kapatıldı",
      metadata: { enabled: updated.enabled },
    });
    return jsonOk({
      ok: true,
      maintenance: {
        enabled: updated.enabled,
        message: updated.message,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

