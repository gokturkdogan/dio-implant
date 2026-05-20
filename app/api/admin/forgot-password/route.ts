import { jsonError, jsonOk } from "@/lib/http";
import { passwordResetService } from "@/services/password-reset.service";
import { adminForgotPasswordSchema } from "@/validations/admin.validation";

export const runtime = "nodejs";

const SUCCESS_MESSAGE =
  "Parola sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve istenmeyen klasörünü kontrol edin.";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = adminForgotPasswordSchema.parse(body);
    await passwordResetService.requestResetLink(
      input.username,
      input.email,
      request,
    );
    return jsonOk({ ok: true, message: SUCCESS_MESSAGE });
  } catch (e) {
    return jsonError(e);
  }
}
