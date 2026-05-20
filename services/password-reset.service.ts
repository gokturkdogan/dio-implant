import "server-only";
import bcrypt from "bcryptjs";
import { and, eq, gt, isNull } from "drizzle-orm";
import { passwordResetTokens } from "../db/schema/password-reset-token";
import { users } from "../db/schema/user";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";
import { buildPasswordResetEmail } from "../lib/email-templates/password-reset-email";
import { getAppBaseUrl, sendMail } from "../lib/mail";
import {
  generateResetToken,
  hashResetToken,
  PASSWORD_RESET_TTL_MS,
} from "../lib/password-reset-token";

const BCRYPT_ROUNDS = 12;

const MISMATCH_ERROR = "E-posta adresi veya kullanıcı adı hatalı";

export const passwordResetService = {
  async findUserByUsernameAndEmail(username: string, email: string) {
    const row = await db.query.users.findFirst({
      where: eq(users.username, username.trim()),
    });
    if (!row) return null;
    if (row.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
      return null;
    }
    return row;
  },

  async requestResetLink(
    username: string,
    email: string,
    request?: Request,
  ): Promise<void> {
    const user = await this.findUserByUsernameAndEmail(username, email);
    if (!user) {
      throw new AppError(MISMATCH_ERROR, 400);
    }

    const { raw, hash } = generateResetToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await db
      .delete(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.userId, user.id),
          isNull(passwordResetTokens.usedAt),
        ),
      );

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      tokenHash: hash,
      expiresAt,
    });

    const baseUrl = getAppBaseUrl(request);
    const resetUrl = `${baseUrl}/admin-panel/parola-sifirla?token=${encodeURIComponent(raw)}`;
    const { subject, text, html } = buildPasswordResetEmail(
      resetUrl,
      user.firstName,
    );

    await sendMail({
      to: user.email,
      subject,
      text,
      html,
    });
  },

  async resetPasswordWithToken(
    rawToken: string,
    newPassword: string,
  ): Promise<void> {
    const tokenHash = hashResetToken(rawToken);
    const now = new Date();

    const row = await db.query.passwordResetTokens.findFirst({
      where: and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ),
    });

    if (!row) {
      throw new AppError(
        "Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Lütfen yeniden talep edin.",
        400,
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, row.userId));

    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, row.id));
  },
};
