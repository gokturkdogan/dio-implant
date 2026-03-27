import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";

const envSchema = z.object({
  ADMIN_JWT_SECRET: z.string().min(16),
});

const parsed = envSchema.safeParse({
  ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET,
});

const secret = new TextEncoder().encode(
  parsed.success ? parsed.data.ADMIN_JWT_SECRET : "insecure-dev-secret-change-me"
);

export const ADMIN_COOKIE_NAME = "dio_admin_token";
export const ADMIN_SESSION_MINUTES = 15;

export type AdminTokenPayload = {
  sub: string;
  username: string;
};

export async function signAdminToken(payload: AdminTokenPayload) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ADMIN_SESSION_MINUTES * 60;

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(iat)
    .setExpirationTime(exp)
    .setSubject(payload.sub)
    .sign(secret);

  return { token, exp };
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  return payload;
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MINUTES * 60,
  });
}

export async function clearAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

