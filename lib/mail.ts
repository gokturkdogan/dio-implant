import "server-only";
import nodemailer from "nodemailer";
import { z } from "zod";
import { AppError } from "./errors";

const smtpEnvSchema = z.object({
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "1"),
});

function getSmtpConfig() {
  const parsed = smtpEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new AppError(
      "E-posta sunucusu yapılandırılmamış (SMTP_HOST, SMTP_USER, SMTP_PASS, SMTP_FROM)",
      503,
    );
  }
  return parsed.data;
}

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendMail(input: SendMailInput): Promise<void> {
  const cfg = getSmtpConfig();
  const secure = cfg.SMTP_SECURE ?? cfg.SMTP_PORT === 465;

  const transport = nodemailer.createTransport({
    host: cfg.SMTP_HOST,
    port: cfg.SMTP_PORT,
    secure,
    auth: {
      user: cfg.SMTP_USER,
      pass: cfg.SMTP_PASS,
    },
  });

  try {
    await transport.sendMail({
      from: cfg.SMTP_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[sendMail]", error);

    if (/ENOTFOUND|ECONNREFUSED|ETIMEDOUT|getaddrinfo/i.test(msg)) {
      throw new AppError(
        "E-posta sunucusuna bağlanılamadı. SMTP_HOST ve SMTP_PORT değerlerini kontrol edin (Gmail: smtp.gmail.com, 587).",
        503,
      );
    }
    if (/Invalid login|authentication failed|EAUTH|535|534/i.test(msg)) {
      throw new AppError(
        "E-posta girişi başarısız. SMTP_USER (Gmail adresiniz) ve SMTP_PASS (uygulama şifresi) doğru mu kontrol edin.",
        503,
      );
    }
    throw new AppError(`E-posta gönderilemedi: ${msg}`, 503);
  }
}

export function getAppBaseUrl(request?: Request): string {
  const fromEnv = process.env.APP_BASE_URL?.trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }
  return "http://localhost:3000";
}
