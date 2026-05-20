"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import { useAdminToast } from "./admin-toast-provider";
import {
  adminInviteUserSchema,
  firstZodIssueMessage,
} from "@/validations/admin.validation";

function readApiError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const err = (data as { error: unknown }).error;
    if (typeof err === "string" && err !== "Validation failed") return err;
  }
  return fallback;
}

type EmailBlockReason = "registered" | "pending_invite";

type EmailCheckState =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "available" }
  | { status: "unavailable"; message: string; reason?: EmailBlockReason };

const EMAIL_BLOCK_TOAST_MS = 6500;

function emailBlockTitle(reason?: EmailBlockReason): string {
  if (reason === "registered") return "E-posta zaten kayıtlı";
  if (reason === "pending_invite") return "Bekleyen davet var";
  return "Davet gönderilemez";
}

export function AdminInviteUserForm() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailCheck, setEmailCheck] = useState<EmailCheckState>({
    status: "idle",
  });
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
  }>({});
  const emailCheckSeq = useRef(0);
  const lastEmailToastRef = useRef<string | null>(null);

  const showEmailBlockFeedback = useCallback(
    (message: string, reason?: EmailBlockReason) => {
      const toastKey = `${reason ?? ""}:${message}`;
      if (lastEmailToastRef.current !== toastKey) {
        lastEmailToastRef.current = toastKey;
        showToast(message, "error", EMAIL_BLOCK_TOAST_MS);
      }
    },
    [showToast],
  );

  const emailBlocked =
    emailCheck.status === "unavailable" || emailCheck.status === "checking";

  type EmailCheckResult =
    | { ok: true }
    | { ok: false; message: string; reason?: EmailBlockReason };

  const checkEmailAvailability = useCallback(
    async (raw: string, options?: { toast?: boolean }): Promise<EmailCheckResult> => {
      const trimmed = raw.trim();
      const parsed = adminInviteUserSchema.shape.email.safeParse(trimmed);
      if (!parsed.success) {
        setEmailCheck({ status: "idle" });
        return { ok: false, message: "Geçerli bir e-posta girin." };
      }

      const seq = ++emailCheckSeq.current;
      setEmailCheck({ status: "checking" });

      try {
        const res = await fetch(
          `/api/admin/users/check-email?email=${encodeURIComponent(parsed.data)}`,
          { credentials: "include" },
        );
        const data = (await res.json()) as {
          available?: boolean;
          message?: string;
          reason?: EmailBlockReason;
        };
        if (seq !== emailCheckSeq.current) {
          return { ok: false, message: "Kontrol iptal edildi." };
        }

        if (data.available) {
          lastEmailToastRef.current = null;
          setEmailCheck({ status: "available" });
          setFieldErrors((prev) => {
            if (!prev.email) return prev;
            const { email: _removed, ...rest } = prev;
            return rest;
          });
          return { ok: true };
        }

        const message =
          typeof data.message === "string"
            ? data.message
            : "Bu e-posta adresi ile davet gönderilemez.";
        const reason =
          data.reason === "registered" || data.reason === "pending_invite"
            ? data.reason
            : undefined;
        setEmailCheck({ status: "unavailable", message, reason });
        setFieldErrors((prev) => ({ ...prev, email: message }));
        if (options?.toast !== false) {
          showEmailBlockFeedback(message, reason);
        }
        return { ok: false, message, reason };
      } catch {
        if (seq !== emailCheckSeq.current) {
          return { ok: false, message: "Kontrol iptal edildi." };
        }
        setEmailCheck({ status: "idle" });
        return { ok: false, message: "E-posta kontrol edilemedi. Tekrar deneyin." };
      }
    },
    [showEmailBlockFeedback],
  );

  const onEmailChange = (value: string) => {
    setEmail(value);
    setEmailCheck({ status: "idle" });
    lastEmailToastRef.current = null;
    if (fieldErrors.email) {
      setFieldErrors((prev) => {
        const { email: _removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const parsed = adminInviteUserSchema.safeParse({
      firstName,
      lastName,
      email,
    });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        firstName: flat.firstName?.[0],
        lastName: flat.lastName?.[0],
        email: flat.email?.[0],
      });
      showToast(firstZodIssueMessage(parsed.error), "error");
      return;
    }

    let emailResult: EmailCheckResult;
    if (emailCheck.status === "available") {
      emailResult = { ok: true };
    } else if (emailCheck.status === "unavailable") {
      emailResult = {
        ok: false,
        message: emailCheck.message,
        reason: emailCheck.reason,
      };
    } else {
      emailResult = await checkEmailAvailability(parsed.data.email);
    }
    if (!emailResult.ok) {
      lastEmailToastRef.current = null;
      showEmailBlockFeedback(emailResult.message, emailResult.reason);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = readApiError(data, "Davet gönderilemedi.");
        if (res.status === 409) {
          const reason: EmailBlockReason | undefined = msg.includes("bekleyen")
            ? "pending_invite"
            : msg.includes("kayıtlı")
              ? "registered"
              : undefined;
          setEmailCheck({ status: "unavailable", message: msg, reason });
          setFieldErrors((prev) => ({ ...prev, email: msg }));
          showEmailBlockFeedback(msg, reason);
        } else {
          showToast(msg, "error");
        }
        return;
      }
      showToast(
        typeof data.message === "string"
          ? data.message
          : "Davet e-postası gönderildi.",
        "success",
      );
      router.push("/admin-panel/kullanicilar");
    } catch {
      showToast("Davet gönderilemedi.", "error");
    } finally {
      setLoading(false);
    }
  };

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const emailAlertId = useId();

  const emailHelp =
    fieldErrors.email ??
    (emailCheck.status === "unavailable" ? emailCheck.message : null) ??
    (emailCheck.status === "checking"
      ? "E-posta kontrol ediliyor…"
      : emailCheck.status === "available"
        ? "Bu e-posta ile davet gönderilebilir."
        : "Davet ve parola belirleme bağlantısı bu adrese gönderilir.");

  const emailHelpIsError =
    !!fieldErrors.email || emailCheck.status === "unavailable";

  const emailStatusVariant: "idle" | "checking" | "ok" | "error" =
    emailHelpIsError
      ? "error"
      : emailCheck.status === "checking"
        ? "checking"
        : emailCheck.status === "available"
          ? "ok"
          : "idle";

  const emailAlert =
    emailCheck.status === "unavailable" ? emailCheck : null;

  return (
    <form className="admin-invite-user" onSubmit={(ev) => void submit(ev)}>
      <p className="admin-invite-user__intro">
        Girilen e-posta adresine parola belirleme bağlantısı gönderilir. Sistemde
        kayıtlı bir e-posta için davet oluşturulamaz.
      </p>

      {emailAlert ? (
        <div
          id={emailAlertId}
          className="admin-invite-user__alert"
          role="alert"
          aria-live="assertive"
        >
          <span className="admin-invite-user__alert-icon" aria-hidden="true">
            !
          </span>
          <div className="admin-invite-user__alert-body">
            <strong className="admin-invite-user__alert-title">
              {emailBlockTitle(emailAlert.reason)}
            </strong>
            <p className="admin-invite-user__alert-text">{emailAlert.message}</p>
          </div>
        </div>
      ) : null}

      <div className="admin-invite-user__fields">
        <label className="admin-field" htmlFor={firstNameId}>
          <span>Ad</span>
          <input
            id={firstNameId}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            maxLength={80}
            required
            aria-invalid={fieldErrors.firstName ? true : undefined}
          />
          {fieldErrors.firstName ? (
            <span className="admin-field__help admin-field__help--error">
              {fieldErrors.firstName}
            </span>
          ) : null}
        </label>

        <label className="admin-field" htmlFor={lastNameId}>
          <span>Soyad</span>
          <input
            id={lastNameId}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            maxLength={80}
            required
            aria-invalid={fieldErrors.lastName ? true : undefined}
          />
          {fieldErrors.lastName ? (
            <span className="admin-field__help admin-field__help--error">
              {fieldErrors.lastName}
            </span>
          ) : null}
        </label>

        <label
          className={`admin-field admin-field--full${
            emailHelpIsError
              ? " admin-field--error"
              : emailCheck.status === "available"
                ? " admin-field--success"
                : ""
          }`}
          htmlFor={emailId}
        >
          <span>E-posta</span>
          <input
            id={emailId}
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            onBlur={() => void checkEmailAvailability(email)}
            autoComplete="email"
            inputMode="email"
            maxLength={200}
            required
            aria-invalid={emailHelpIsError ? true : undefined}
            aria-describedby={emailAlert ? emailAlertId : undefined}
          />
          <div
            className={`admin-invite-email-status admin-invite-email-status--${emailStatusVariant}`}
            role="status"
            aria-live="polite"
          >
            <span className="admin-invite-email-status__icon" aria-hidden="true">
              {emailStatusVariant === "ok" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : emailStatusVariant === "error" ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : emailStatusVariant === "checking" ? (
                <span className="admin-invite-email-status__spinner" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  <path
                    d="M12 8v5M12 16h.01"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </span>
            <span className="admin-invite-email-status__text">{emailHelp}</span>
          </div>
        </label>
      </div>

      <div className="admin-invite-user__actions">
        <Link href="/admin-panel/kullanicilar" className="admin-btn admin-btn--ghost">
          İptal
        </Link>
        <button
          type="submit"
          className="admin-btn admin-btn--primary"
          disabled={loading || emailBlocked}
        >
          {loading ? "Gönderiliyor…" : "Davet gönder"}
        </button>
      </div>
    </form>
  );
}
