import { neon } from "@neondatabase/serverless";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
});

const parsedEnv = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
});

if (!parsedEnv.success && process.env.NODE_ENV !== "production") {
  // Build ve local boot asamasinda net bir yonlendirme vermek icin.
  console.warn(
    "DATABASE_URL tanimli degil veya gecersiz. API endpointlerini kullanmadan once .env.local ayarlayin."
  );
}

const fallbackUrl = "postgresql://local:local@localhost:5432/local";
export const sql = neon(parsedEnv.success ? parsedEnv.data.DATABASE_URL : fallbackUrl);
