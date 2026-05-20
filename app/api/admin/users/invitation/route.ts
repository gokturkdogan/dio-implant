import { jsonError, jsonOk } from "@/lib/http";
import { userInvitationService } from "@/services/user-invitation.service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
    if (!token) {
      return jsonOk({ error: "Geçersiz davet bağlantısı" }, 400);
    }
    const invitation = await userInvitationService.getInvitationByToken(token);
    return jsonOk({ invitation });
  } catch (e) {
    return jsonError(e);
  }
}
