import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { siteContactService } from "@/services/site-contact.service";
import { siteContactUpsertSchema } from "@/validations/contact.validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const contact = await siteContactService.get();
    return jsonOk({ contact });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = siteContactUpsertSchema.parse(body);
    const contact = await siteContactService.upsert(input);
    await auditAdminAction({
      action: "update",
      resourceType: "site_contact",
      resourceLabel: "İletişim bilgileri",
    });
    return jsonOk({ ok: true, contact });
  } catch (e) {
    return jsonError(e);
  }
}
