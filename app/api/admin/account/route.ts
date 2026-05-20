import { jsonError, jsonOk } from "@/lib/http";
import { getAdminUserId } from "@/lib/require-admin-api";
import { userService } from "@/services/user.service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      return jsonOk({ error: "Yetkisiz" }, 401);
    }
    const account = await userService.getById(userId);
    return jsonOk({ account });
  } catch (e) {
    return jsonError(e);
  }
}
