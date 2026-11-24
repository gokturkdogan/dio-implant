import { jsonError, jsonOk } from "@/lib/http";
import { sitePopupService } from "@/services/site-popup.service";

export const runtime = "nodejs";

/**
 * Ana sayfa popup'ı — ana sayfaya gelen her ziyaretçi çağırır; bu yüzden yanıt ISR ile
 * CDN'de tutulur ve fonksiyon/DB yalnızca önbellek yenilenirken çalışır.
 * Admin panelinden popup güncellendiğinde `revalidateHomepagePopup()` önbelleği anında
 * temizler (bkz. lib/admin-audit.ts). 1 saatlik süre yalnızca emniyet payıdır.
 */
export const revalidate = 3600;

export async function GET() {
  try {
    const row = await sitePopupService.getByKey("homepage");
    return jsonOk(row);
  } catch (error) {
    return jsonError(error);
  }
}
