"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import Script from "next/script";
import { useAdminToast } from "@/components/admin/admin-toast-provider";
import { AdminPasswordRequirements } from "@/components/admin/admin-password-requirements";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";
import { allPasswordRequirementsMet } from "@/lib/admin-password-requirements";
import { ADMIN_PASSWORD_INPUT_ATTRS } from "@/lib/admin-password-input-props";
import {
  ADMIN_NEW_PASSWORD_MAX_LENGTH,
  ADMIN_NEW_PASSWORD_MIN_LENGTH,
  adminCompleteUserSetupSchema,
  firstZodIssueMessage,
} from "@/validations/admin.validation";

type InvitationPreview = {
  firstName: string;
  lastName: string;
  email: string;
};

function readApiError(data: unknown, fallback: string): string {
  if (data && typeof data === "object") {
    const d = data as {
      error?: unknown;
      details?: { fieldErrors?: Record<string, string[]> };
    };
    if (d.details?.fieldErrors) {
      const first = Object.values(d.details.fieldErrors).flat().find(Boolean);
      if (first) return first;
    }
    if (typeof d.error === "string" && d.error !== "Validation failed") {
      return d.error;
    }
  }
  return fallback;
}

function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M1 1l22 22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
  minLength?: number;
  maxLength?: number;
  error?: string | null;
};

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  minLength,
  maxLength,
  error,
}: PasswordInputProps) {
  const id = useId();
  return (
    <label className="admin-field admin-field--full" htmlFor={id}>
      <span>{label}</span>
      <div className="admin-auth-password">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          minLength={minLength}
          maxLength={maxLength}
          aria-invalid={error ? true : undefined}
          required
          {...ADMIN_PASSWORD_INPUT_ATTRS}
        />
        <button
          type="button"
          className="admin-auth-password__toggle"
          onClick={onToggle}
          aria-label={show ? "Parolayı gizle" : "Parolayı göster"}
          aria-pressed={show}
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {error ? <span className="admin-field__help admin-field__help--error">{error}</span> : null}
    </label>
  );
}

export function AdminCompleteUserSetupClient({ token }: { token: string }) {
  const { showToast } = useAdminToast();
  const [invitation, setInvitation] = useState<InvitationPreview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [createdUsername, setCreatedUsername] = useState<string | null>(null);
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
    null,
  );

  const invalidLink = !token.trim();

  useEffect(() => {
    if (invalidLink) {
      setLoadingInvite(false);
      setLoadError("Davet bağlantısı geçersiz.");
      return;
    }

    let cancelled = false;
    (async () => {
      setLoadingInvite(true);
      setLoadError(null);
      try {
        const res = await fetch(
          `/api/admin/users/invitation?token=${encodeURIComponent(token.trim())}`,
        );
        const data = (await res.json()) as {
          invitation?: InvitationPreview;
          error?: string;
        };
        if (cancelled) return;
        if (!res.ok || !data.invitation) {
          setLoadError(readApiError(data, "Davet bağlantısı geçersiz veya süresi dolmuş."));
          setInvitation(null);
          return;
        }
        setInvitation(data.invitation);
      } catch {
        if (!cancelled) {
          setLoadError("Davet bilgileri yüklenemedi.");
        }
      } finally {
        if (!cancelled) setLoadingInvite(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, invalidLink]);

  const clearFieldErrors = () => {
    setNewPasswordError(null);
    setConfirmPasswordError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (invalidLink || !invitation) return;

    clearFieldErrors();
    const parsed = adminCompleteUserSetupSchema.safeParse({
      token: token.trim(),
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const err = parsed.error;
      const fieldErrors = err.flatten().fieldErrors;
      setNewPasswordError(fieldErrors.newPassword?.[0] ?? null);
      setConfirmPasswordError(fieldErrors.confirmPassword?.[0] ?? null);
      showToast(firstZodIssueMessage(err), "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/complete-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await res.json()) as { username?: string; error?: string };
      if (!res.ok) {
        showToast(readApiError(data, "Hesap oluşturulamadı."), "error");
        return;
      }
      setCreatedUsername(
        typeof data.username === "string" ? data.username : null,
      );
      setDone(true);
      showToast("Hesabınız oluşturuldu.", "success");
    } catch {
      showToast("Hesap oluşturulamadı.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell">
      <div className="admin-auth">
        <div className="admin-auth__glow" aria-hidden="true" />
        <div className="admin-auth__card">
          <AdminThemeToggle className="admin-theme-btn admin-theme-btn--auth" />
          <div className="admin-auth__brand">
            <div className="admin-auth__mark">DIO</div>
            <div className="admin-auth__brand-text">
              <h1 className="admin-auth__title">Hesabınızı tamamlayın</h1>
              <p className="admin-auth__subtitle">
                Davet bilgilerinizi kontrol edin ve parolanızı belirleyin
              </p>
            </div>
          </div>

          {invalidLink || loadError ? (
            <div className="admin-auth__success-block">
              <p className="admin-auth__error">
                {invalidLink
                  ? "Davet bağlantısı geçersiz."
                  : loadError}
              </p>
              <Link
                href="/admin-panel/login"
                className="admin-btn admin-btn--primary admin-auth__submit"
              >
                Giriş sayfası
              </Link>
            </div>
          ) : loadingInvite ? (
            <p className="admin-auth__hint" style={{ textAlign: "center" }}>
              Davet bilgileri yükleniyor…
            </p>
          ) : done ? (
            <div className="admin-auth__success-block">
              <p className="admin-auth__success-text">
                Hesabınız oluşturuldu.
                {createdUsername ? (
                  <>
                    {" "}
                    Giriş için kullanıcı adınız:{" "}
                    <strong>@{createdUsername}</strong>
                  </>
                ) : null}
              </p>
              <Link
                href="/admin-panel/login"
                className="admin-btn admin-btn--primary admin-auth__submit"
              >
                Giriş yap
              </Link>
            </div>
          ) : invitation ? (
            <form className="admin-auth__form" onSubmit={(ev) => void submit(ev)}>
              <dl className="admin-invite-setup__profile">
                <div className="admin-invite-setup__row">
                  <dt>Ad</dt>
                  <dd>{invitation.firstName}</dd>
                </div>
                <div className="admin-invite-setup__row">
                  <dt>Soyad</dt>
                  <dd>{invitation.lastName}</dd>
                </div>
                <div className="admin-invite-setup__row">
                  <dt>E-posta</dt>
                  <dd>{invitation.email}</dd>
                </div>
              </dl>

              <PasswordInput
                label="Parola"
                value={newPassword}
                onChange={(v) => {
                  setNewPassword(v);
                  if (newPasswordError) setNewPasswordError(null);
                }}
                show={showNew}
                onToggle={() => setShowNew((v) => !v)}
                autoComplete="new-password"
                minLength={ADMIN_NEW_PASSWORD_MIN_LENGTH}
                maxLength={ADMIN_NEW_PASSWORD_MAX_LENGTH}
                error={newPasswordError}
              />
              <PasswordInput
                label="Parola (tekrar)"
                value={confirmPassword}
                onChange={(v) => {
                  setConfirmPassword(v);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                show={showConfirm}
                onToggle={() => setShowConfirm((v) => !v)}
                autoComplete="new-password"
                minLength={ADMIN_NEW_PASSWORD_MIN_LENGTH}
                maxLength={ADMIN_NEW_PASSWORD_MAX_LENGTH}
                error={confirmPasswordError}
              />
              <AdminPasswordRequirements
                password={newPassword}
                confirmPassword={confirmPassword}
              />
              <button
                className="admin-btn admin-btn--primary admin-auth__submit"
                type="submit"
                disabled={
                  loading ||
                  !allPasswordRequirementsMet(newPassword, confirmPassword)
                }
              >
                {loading ? "Kaydediliyor…" : "Hesabı oluştur"}
              </button>
              <p className="admin-auth__hint">
                <Link href="/admin-panel/login" className="admin-auth__link">
                  Giriş sayfasına dön
                </Link>
              </p>
            </form>
          ) : null}
        </div>
      </div>
      <Script src="/admin-panel/theme-toggle.js" strategy="afterInteractive" />
    </main>
  );
}
