import "server-only";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { userInvitations } from "../db/schema/user-invitation";
import { users } from "../db/schema/user";
import { db } from "../lib/drizzle";
import {
  normalizeUserEmail,
  userService,
} from "./user.service";
import { buildUserInviteEmail } from "../lib/email-templates/user-invite-email";
import { AppError } from "../lib/errors";
import { getAppBaseUrl, sendMail } from "../lib/mail";
import {
  generateResetToken,
  hashResetToken,
} from "../lib/password-reset-token";

const BCRYPT_ROUNDS = 12;
/** Davet bağlantısı geçerlilik süresi (7 gün). */
export const USER_INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export type PublicInvitationPreview = {
  firstName: string;
  lastName: string;
  email: string;
};

const EMAIL_ALREADY_REGISTERED =
  "Bu e-posta adresi sistemde zaten kayıtlı. Davet gönderilemez.";

function slugifyUsernamePart(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 48);
}

async function allocateUsername(
  firstName: string,
  lastName: string,
  email: string,
): Promise<string> {
  const local = slugifyUsernamePart(email.split("@")[0] ?? "");
  const fromName = slugifyUsernamePart(`${firstName}.${lastName}`);
  let base = (fromName.length >= 3 ? fromName : local) || "kullanici";
  if (base.length < 3) base = "kullanici";

  let candidate = base;
  for (let n = 0; n < 500; n++) {
    const existing = await db.query.users.findFirst({
      where: eq(users.username, candidate),
    });
    if (!existing) return candidate;
    candidate = `${base}${n + 1}`;
  }
  throw new AppError("Kullanıcı adı üretilemedi, lütfen tekrar deneyin", 500);
}

export const userInvitationService = {
  async createAndSendInvite(
    input: { firstName: string; lastName: string; email: string },
    request?: Request,
  ): Promise<void> {
    const email = normalizeUserEmail(input.email);
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();

    if (await userService.isEmailRegistered(email)) {
      throw new AppError(EMAIL_ALREADY_REGISTERED, 409);
    }

    const pendingInvite = await db.query.userInvitations.findFirst({
      where: and(
        sql`lower(${userInvitations.email}) = ${email}`,
        isNull(userInvitations.usedAt),
        gt(userInvitations.expiresAt, new Date()),
      ),
    });
    if (pendingInvite) {
      throw new AppError(
        "Bu e-posta için zaten bekleyen bir davet var. Süresi dolana kadar yeni davet gönderilemez.",
        409,
      );
    }

    const { raw, hash } = generateResetToken();
    const expiresAt = new Date(Date.now() + USER_INVITATION_TTL_MS);

    await db.insert(userInvitations).values({
      email,
      firstName,
      lastName,
      tokenHash: hash,
      expiresAt,
    });

    const baseUrl = getAppBaseUrl(request);
    const setupUrl = `${baseUrl}/admin-panel/kullanici-parola-olustur?token=${encodeURIComponent(raw)}`;
    const expiresDays = Math.round(USER_INVITATION_TTL_MS / (24 * 60 * 60 * 1000));
    const { subject, text, html } = buildUserInviteEmail(
      setupUrl,
      firstName,
      lastName,
      email,
      expiresDays,
    );

    await sendMail({ to: email, subject, text, html });
  },

  async getInvitationByToken(
    rawToken: string,
  ): Promise<PublicInvitationPreview> {
    const tokenHash = hashResetToken(rawToken);
    const row = await db.query.userInvitations.findFirst({
      where: and(
        eq(userInvitations.tokenHash, tokenHash),
        isNull(userInvitations.usedAt),
        gt(userInvitations.expiresAt, new Date()),
      ),
    });

    if (!row) {
      throw new AppError(
        "Davet bağlantısı geçersiz veya süresi dolmuş.",
        400,
      );
    }

    return {
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
    };
  },

  async completeSetup(
    rawToken: string,
    newPassword: string,
  ): Promise<{ username: string }> {
    const tokenHash = hashResetToken(rawToken);
    const now = new Date();

    const invite = await db.query.userInvitations.findFirst({
      where: and(
        eq(userInvitations.tokenHash, tokenHash),
        isNull(userInvitations.usedAt),
        gt(userInvitations.expiresAt, now),
      ),
    });

    if (!invite) {
      throw new AppError(
        "Davet bağlantısı geçersiz veya süresi dolmuş.",
        400,
      );
    }

    const email = normalizeUserEmail(invite.email);
    if (await userService.isEmailRegistered(email)) {
      throw new AppError(EMAIL_ALREADY_REGISTERED, 409);
    }

    const username = await allocateUsername(
      invite.firstName,
      invite.lastName,
      email,
    );
    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db.insert(users).values({
      username,
      firstName: invite.firstName,
      lastName: invite.lastName,
      email,
      passwordHash,
      role: "admin",
    });

    await db
      .update(userInvitations)
      .set({ usedAt: new Date() })
      .where(eq(userInvitations.id, invite.id));

    return { username };
  },
};
