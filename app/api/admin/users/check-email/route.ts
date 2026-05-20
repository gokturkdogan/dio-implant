import { z } from "zod";
import { and, gt, isNull, sql } from "drizzle-orm";
import { userInvitations } from "@/db/schema/user-invitation";
import { db } from "@/lib/drizzle";
import { jsonError, jsonOk } from "@/lib/http";
import { requireSuperAdminApi } from "@/lib/require-admin-api";
import { normalizeUserEmail, userService } from "@/services/user.service";

export const runtime = "nodejs";

const querySchema = z.object({
  email: z.string().trim().email("Geçerli bir e-posta girin").max(200),
});

export async function GET(request: Request) {
  try {
    if (!(await requireSuperAdminApi())) {
      return jsonOk({ error: "Bu işlem için süper yönetici yetkisi gerekir." }, 403);
    }

    const emailRaw = new URL(request.url).searchParams.get("email") ?? "";
    const parsed = querySchema.safeParse({ email: emailRaw });
    if (!parsed.success) {
      return jsonOk({ available: false, reason: "invalid" as const }, 400);
    }

    const email = normalizeUserEmail(parsed.data.email);

    if (await userService.isEmailRegistered(email)) {
      return jsonOk({
        available: false,
        reason: "registered" as const,
        message:
          "Bu e-posta adresi sistemde zaten kayıtlı. Davet gönderilemez.",
      });
    }

    const pendingInvite = await db.query.userInvitations.findFirst({
      where: and(
        sql`lower(${userInvitations.email}) = ${email}`,
        isNull(userInvitations.usedAt),
        gt(userInvitations.expiresAt, new Date()),
      ),
      columns: { id: true },
    });

    if (pendingInvite) {
      return jsonOk({
        available: false,
        reason: "pending_invite" as const,
        message:
          "Bu e-posta için zaten bekleyen bir davet var. Süresi dolana kadar yeni davet gönderilemez.",
      });
    }

    return jsonOk({ available: true });
  } catch (e) {
    return jsonError(e);
  }
}
