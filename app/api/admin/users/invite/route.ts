import { auditAdminAction } from "@/lib/admin-audit";
import { jsonError, jsonOk } from "@/lib/http";
import { requireSuperAdminApi } from "@/lib/require-admin-api";
import { userInvitationService } from "@/services/user-invitation.service";
import { adminInviteUserSchema } from "@/validations/admin.validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!(await requireSuperAdminApi())) {
      return jsonOk({ error: "Bu işlem için süper yönetici yetkisi gerekir." }, 403);
    }
    const body = await request.json();
    const input = adminInviteUserSchema.parse(body);
    await userInvitationService.createAndSendInvite(input, request);
    await auditAdminAction({
      action: "invite",
      resourceType: "user_invitation",
      resourceLabel: input.email,
      metadata: {
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });
    return jsonOk({
      ok: true,
      message:
        "Davet e-postası gönderildi. Kullanıcı bağlantıdan parolasını belirleyebilir.",
    });
  } catch (e) {
    return jsonError(e);
  }
}
