import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { authorizedDealerService } from "@/services/authorized-dealer.service";
import { authorizedDealerUpdateSchema } from "@/validations/contact.validation";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const id = Number((await ctx.params).id);
    if (!Number.isFinite(id)) return jsonOk({ error: "Geçersiz id" }, 400);
    const body = await request.json();
    const input = authorizedDealerUpdateSchema.parse(body);
    const dealer = await authorizedDealerService.update(id, input);
    await auditAdminAction({
      action: "update",
      resourceType: "dealer",
      resourceId: id,
      resourceLabel: dealer.name,
    });
    return jsonOk({ ok: true, dealer });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const id = Number((await ctx.params).id);
    if (!Number.isFinite(id)) return jsonOk({ error: "Geçersiz id" }, 400);
    const existing = await authorizedDealerService.getById(id);
    await authorizedDealerService.delete(id);
    await auditAdminAction({
      action: "delete",
      resourceType: "dealer",
      resourceId: id,
      resourceLabel: existing?.name ?? `Bayi #${id}`,
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
