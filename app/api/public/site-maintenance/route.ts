import { jsonError, jsonOk } from "@/lib/http";
import { siteMaintenanceService } from "@/services/site-maintenance.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const setting = await siteMaintenanceService.get();
    return jsonOk(
      {
        enabled: setting?.enabled ?? false,
      },
      200,
    );
  } catch (e) {
    return jsonError(e);
  }
}

