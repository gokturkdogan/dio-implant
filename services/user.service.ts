import "server-only";
import bcrypt from "bcryptjs";
import { desc, eq, sql } from "drizzle-orm";
import { users } from "../db/schema/user";
import { db } from "../lib/drizzle";
import type { AdminUserListItem } from "../lib/admin-user-types";
import { AppError } from "../lib/errors";

const BCRYPT_ROUNDS = 12;

export function normalizeUserEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type PublicUserProfile = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "super_admin";
};

export const userService = {
  /** Yönetim paneli girişi — `users` tablosu. */
  async verifyLogin(username: string, password: string) {
    const row = await db.query.users.findFirst({
      where: eq(users.username, username.trim()),
    });

    if (!row) {
      throw new AppError("Kullanıcı adı veya parola hatalı", 401);
    }

    const ok = await bcrypt.compare(password, row.passwordHash);
    if (!ok) {
      throw new AppError("Kullanıcı adı veya parola hatalı", 401);
    }

    return {
      id: row.id,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      role: row.role,
    };
  },

  /** Kayıtlı kullanıcı var mı (e-posta büyük/küçük harf duyarsız). */
  async isEmailRegistered(email: string): Promise<boolean> {
    const normalized = normalizeUserEmail(email);
    if (!normalized) return false;
    const row = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${normalized}`,
      columns: { id: true },
    });
    return !!row;
  },

  /** Yönetim paneli kullanıcı listesi (parola hash döndürülmez). */
  async listForAdmin(): Promise<AdminUserListItem[]> {
    const rows = await db.query.users.findMany({
      orderBy: [desc(users.createdAt), desc(users.id)],
    });
    return rows.map((r) => ({
      id: r.id,
      username: r.username,
      firstName: r.firstName,
      lastName: r.lastName,
      email: r.email,
      role: r.role,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  },

  async getById(id: number): Promise<PublicUserProfile> {
    const row = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!row) {
      throw new AppError("Kullanıcı bulunamadı", 404);
    }
    return {
      id: row.id,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      role: row.role,
    };
  },

  async updateProfile(
    id: number,
    input: { firstName: string; lastName: string },
  ): Promise<PublicUserProfile> {
    const [updated] = await db
      .update(users)
      .set({
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    if (!updated) {
      throw new AppError("Kullanıcı bulunamadı", 404);
    }

    return {
      id: updated.id,
      username: updated.username,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      role: updated.role,
    };
  },

  async changePassword(
    id: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const row = await db.query.users.findFirst({
      where: eq(users.id, id),
    });
    if (!row) {
      throw new AppError("Kullanıcı bulunamadı", 404);
    }

    const ok = await bcrypt.compare(currentPassword, row.passwordHash);
    if (!ok) {
      throw new AppError("Mevcut parola hatalı", 401);
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, id));
  },
};
