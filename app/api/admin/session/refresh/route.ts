import { jsonError, jsonOk } from "../../../../../lib/http";
import {
  signAdminToken,
  setAdminCookie,
} from "../../../../../lib/admin-auth";
import { userService } from "../../../../../services/user.service";
import { adminLoginSchema } from "../../../../../validations/admin.validation";

export const runtime = "nodejs";

/** Oturum JWT süresi dolduktan sonra şifre ile yeni çerez (login ile aynı doğrulama). */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = adminLoginSchema.parse(body);
    const user = await userService.verifyLogin(input.username, input.password);
    const { token, exp } = await signAdminToken({
      sub: String(user.id),
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    await setAdminCookie(token);
    return jsonOk({ success: true, expiresAt: exp * 1000 });
  } catch (e) {
    return jsonError(e);
  }
}
