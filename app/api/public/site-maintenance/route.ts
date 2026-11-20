import { NextResponse } from "next/server";
import { publicCdnCacheHeaders } from "@/lib/cdn-cache";
import { jsonError } from "@/lib/http";
import { siteMaintenanceService } from "@/services/site-maintenance.service";

export const runtime = "nodejs";

/**
 * Middleware her sayfa isteğinde bu ucu sorar. Yanıt CDN'de 30 sn saklanır;
 * böylece her ziyarette fonksiyon + DB sorgusu çalışmaz.
 * Bakım modu açılıp kapatıldığında değişiklik en geç ~1 dk içinde devreye girer.
 */
export async function GET() {
  try {
    const setting = await siteMaintenanceService.get();
    return NextResponse.json(
      { enabled: setting?.enabled ?? false },
      { status: 200, headers: publicCdnCacheHeaders(30) },
    );
  } catch (e) {
    return jsonError(e);
  }
}
