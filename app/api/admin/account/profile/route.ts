import {
  setAdminCookie,
  signAdminToken,
} from "@/lib/admin-auth";
import { jsonError, jsonOk } from "@/lib/http";
import { auditAdminAction } from "@/lib/admin-audit";
import { getAdminUserId } from "@/lib/require-admin-api";
import { userService } from "@/services/user.service";
import { adminAccountProfileSchema } from "@/validations/admin.validation";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const userId = await getAdminUserId();
    if (!userId) {
      return jsonOk({ error: "Yetkisiz" }, 401);
    }

    const body = await request.json();
    const input = adminAccountProfileSchema.parse(body);
    const account = await userService.updateProfile(userId, input);

    const { token } = await signAdminToken({
      sub: String(account.id),
      username: account.username,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
    });
    await setAdminCookie(token);
    await auditAdminAction({
      action: "profile_update",
      resourceType: "account",
      resourceId: account.id,
      resourceLabel: `${account.firstName} ${account.lastName}`.trim(),
    });

    return jsonOk({ ok: true, account });
  } catch (e) {
    return jsonError(e);
  }
}
