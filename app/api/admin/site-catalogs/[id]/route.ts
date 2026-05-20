import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { siteCatalogService } from "@/services/site-catalog.service";
import { siteCatalogUpdateSchema } from "@/validations/site-catalog.validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const id = Number((await ctx.params).id);
    if (!Number.isFinite(id)) return jsonOk({ error: "Geçersiz id" }, 400);
    const body = await request.json();
    const input = siteCatalogUpdateSchema.parse(body);
    const catalog = await siteCatalogService.update(id, input);
    await auditAdminAction({
      action: "update",
      resourceType: "site_catalog",
      resourceId: id,
      resourceLabel: catalog.title,
    });
    return jsonOk({ ok: true, catalog });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const id = Number((await ctx.params).id);
    if (!Number.isFinite(id)) return jsonOk({ error: "Geçersiz id" }, 400);
    const existing = await siteCatalogService.getById(id);
    await siteCatalogService.delete(id);
    await auditAdminAction({
      action: "delete",
      resourceType: "site_catalog",
      resourceId: id,
      resourceLabel: existing?.title ?? `Katalog #${id}`,
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
