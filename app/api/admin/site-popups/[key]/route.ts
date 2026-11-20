import { jsonError, jsonOk } from "@/lib/http";
import { requireAdminApi } from "@/lib/require-admin-api";
import { sitePopupService } from "@/services/site-popup.service";
import { sitePopupKeySchema } from "@/validations/site-popup.validation";

export const runtime = "nodejs";

type Params = { params: Promise<{ key: string }> };

/**
 * Admin paneli için popup okuma ucu — public uç CDN'de önbelleklendiği için
 * panel her zaman güncel veriyi buradan okur. Güncelleme hâlâ
 * `PATCH /api/site-popups/[key]` (admin yetkili) üzerinden yapılır.
 */
export async function GET(_: Request, { params }: Params) {
  try {
    if (!(await requireAdminApi())) {
      return jsonOk({ error: "Yetkisiz" }, 401);
    }
    const { key } = await params;
    const parsedKey = sitePopupKeySchema.parse(key);
    const row = await sitePopupService.getByKey(parsedKey);
    return jsonOk(row);
  } catch (error) {
    return jsonError(error);
  }
}
