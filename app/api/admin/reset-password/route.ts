import { jsonError, jsonOk } from "@/lib/http";
import { passwordResetService } from "@/services/password-reset.service";
import { adminResetPasswordSchema } from "@/validations/admin.validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = adminResetPasswordSchema.parse(body);
    await passwordResetService.resetPasswordWithToken(
      input.token,
      input.newPassword,
    );
    return jsonOk({
      ok: true,
      message: "Parolanız güncellendi. Giriş sayfasından oturum açabilirsiniz.",
    });
  } catch (e) {
    return jsonError(e);
  }
}
