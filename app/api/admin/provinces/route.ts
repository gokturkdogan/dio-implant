import { jsonError, jsonOk } from "@/lib/http";
import { requireAdminApi } from "@/lib/require-admin-api";
import { provinceService } from "@/services/province.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const provinces = await provinceService.listAll();
    return jsonOk({ provinces });
  } catch (e) {
    return jsonError(e);
  }
}
