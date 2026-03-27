import { jsonError, jsonOk } from "../../../../lib/http";
import {
  signAdminToken,
  setAdminCookie,
} from "../../../../lib/admin-auth";
import { adminSettingsService } from "../../../../services/admin-settings.service";
import { adminLoginSchema } from "../../../../validations/admin.validation";

export async function POST(request: Request) {
  try {
    await adminSettingsService.ensureDefaultAdminFromEnv();

    const payload = await request.json();
    const input = adminLoginSchema.parse(payload);

    const admin = await adminSettingsService.verifyLogin(
      input.username,
      input.password
    );

    const { token, exp } = await signAdminToken({
      sub: String(admin.id),
      username: admin.username,
    });

    await setAdminCookie(token);
    return jsonOk({ success: true, expiresAt: exp * 1000 });
  } catch (error) {
    return jsonError(error);
  }
}

