/**
 * Tek seferlik: varsayılan super admin kullanıcısı (yoksa ekler).
 * Çalıştırma: npx tsx scripts/seed-super-admin-user.ts
 */
import { config } from "dotenv";

config({ path: ".env.local" });

const SEED = {
  username: "dioimplantadmin2026",
  firstName: "super",
  lastName: "admin",
  email: "dioimplant4@gmail.com",
  password: "dioimplantadmin2026*",
  role: "super_admin" as const,
};

async function main() {
  const bcrypt = (await import("bcryptjs")).default;
  const { eq } = await import("drizzle-orm");
  const { users } = await import("../db/schema/user");
  const { db } = await import("../lib/drizzle");

  const existing = await db.query.users.findFirst({
    where: eq(users.username, SEED.username),
    columns: { id: true, username: true, role: true },
  });

  if (existing) {
    console.log(`Kullanıcı zaten var: ${existing.username} (id=${existing.id}, role=${existing.role})`);
    return;
  }

  const passwordHash = await bcrypt.hash(SEED.password, 12);
  const [created] = await db
    .insert(users)
    .values({
      username: SEED.username,
      firstName: SEED.firstName,
      lastName: SEED.lastName,
      email: SEED.email,
      passwordHash,
      role: SEED.role,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
    });

  if (!created) {
    throw new Error("Kullanıcı eklenemedi");
  }

  console.log("Super admin oluşturuldu:", created);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
