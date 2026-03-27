import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { adminSettings } from "../db/schema";
import { db } from "../lib/drizzle";
import { AppError } from "../lib/errors";

export const adminSettingsService = {
  async ensureDefaultAdminFromEnv() {
    const username = process.env.ADMIN_DEFAULT_USERNAME?.trim();
    const password = process.env.ADMIN_DEFAULT_PASSWORD;

    if (!username || !password) return;

    const existing = await db.query.adminSettings.findFirst({
      where: eq(adminSettings.username, username),
      columns: { id: true },
    });

    if (existing) return;

    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(adminSettings).values({ username, passwordHash });
  },

  async verifyLogin(username: string, password: string) {
    const row = await db.query.adminSettings.findFirst({
      where: eq(adminSettings.username, username),
    });

    if (!row) {
      throw new AppError("Kullanıcı adı veya parola hatalı", 401);
    }

    const ok = await bcrypt.compare(password, row.passwordHash);
    if (!ok) {
      throw new AppError("Kullanıcı adı veya parola hatalı", 401);
    }

    return { id: row.id, username: row.username };
  },
};

