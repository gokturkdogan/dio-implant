import { auditAdminAction } from "@/lib/admin-audit";
import { jsonError, jsonOk } from "@/lib/http";
import { getAdminUserId } from "@/lib/require-admin-api";
import { userService } from "@/services/user.service";
import { adminAccountPasswordSchema } from "@/validations/admin.validation";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      return jsonOk({ error: "Yetkisiz" }, 401);
    }

    const body = await request.json();
    const input = adminAccountPasswordSchema.parse(body);
    await userService.changePassword(
      userId,
      input.currentPassword,
      input.newPassword,
    );
    await auditAdminAction({
      action: "password_update",
      resourceType: "account",
      resourceId: userId,
    });

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
