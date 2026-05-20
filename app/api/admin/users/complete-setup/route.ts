import { jsonError, jsonOk } from "@/lib/http";
import { userInvitationService } from "@/services/user-invitation.service";
import { adminCompleteUserSetupSchema } from "@/validations/admin.validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = adminCompleteUserSetupSchema.parse(body);
    const { username } = await userInvitationService.completeSetup(
      input.token,
      input.newPassword,
    );
    return jsonOk({
      ok: true,
      username,
      message:
        "Hesabınız oluşturuldu. Giriş sayfasından kullanıcı adınız ve parolanızla oturum açabilirsiniz.",
    });
  } catch (e) {
    return jsonError(e);
  }
}
