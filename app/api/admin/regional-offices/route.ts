import { auditAdminAction } from "@/lib/admin-audit";
import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { regionalOfficeService } from "@/services/regional-office.service";
import { regionalOfficeCreateSchema } from "@/validations/contact.validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const offices = await regionalOfficeService.listAll();
    return jsonOk({ offices });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = regionalOfficeCreateSchema.parse(body);
    const office = await regionalOfficeService.create(input);
    await auditAdminAction({
      action: "create",
      resourceType: "regional_office",
      resourceId: office.id,
      resourceLabel: office.name,
    });
    return jsonOk({ ok: true, office }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
