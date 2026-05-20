import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { siteCatalogService } from "@/services/site-catalog.service";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

/** Kapak görselini Cloudinary’den silip DB alanlarını temizler. */
export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const id = Number((await ctx.params).id);
    if (!Number.isFinite(id) || id < 1) return jsonOk({ error: "Geçersiz id" }, 400);
    const catalog = await siteCatalogService.clearCoverAssets(id);
    await auditAdminAction({
      action: "update",
      resourceType: "site_catalog",
      resourceId: id,
      resourceLabel: catalog.title,
      metadata: { change: "cover_removed" },
    });
    return jsonOk({ ok: true, catalog });
  } catch (e) {
    return jsonError(e);
  }
}
