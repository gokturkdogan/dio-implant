import { jsonError, jsonOk } from "@/lib/http";
import { siteCatalogService } from "@/services/site-catalog.service";

export const runtime = "nodejs";

/** Genel site: kataloglar listesi (auth gerekmez). */
export async function GET() {
  try {
    const catalogs = await siteCatalogService.listAll();
    return jsonOk({ catalogs });
  } catch (e) {
    return jsonError(e);
  }
}
