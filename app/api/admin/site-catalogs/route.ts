import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { siteCatalogService } from "@/services/site-catalog.service";
import { siteCatalogCreateSchema } from "@/validations/site-catalog.validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const catalogs = await siteCatalogService.listAll();
    return jsonOk({ catalogs });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = siteCatalogCreateSchema.parse(body);
    const catalog = await siteCatalogService.create(input);
    return jsonOk({ ok: true, catalog }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
