import { requireAdminApi } from "@/lib/require-admin-api";
import { jsonError, jsonOk } from "@/lib/http";
import { authorizedDealerService } from "@/services/authorized-dealer.service";
import { authorizedDealerCreateSchema } from "@/validations/contact.validation";

export const runtime = "nodejs";

export async function GET() {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const dealers = await authorizedDealerService.listAll();
    return jsonOk({ dealers });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = authorizedDealerCreateSchema.parse(body);
    const dealer = await authorizedDealerService.create(input);
    return jsonOk({ ok: true, dealer }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
