"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useAdminToast } from "./admin-toast-provider";
import { AdminPasswordRequirements } from "@/components/admin/admin-password-requirements";
import { allPasswordRequirementsMet } from "@/lib/admin-password-requirements";
import { ADMIN_PASSWORD_INPUT_ATTRS } from "@/lib/admin-password-input-props";
import {
  ADMIN_NEW_PASSWORD_MAX_LENGTH,
  ADMIN_NEW_PASSWORD_MIN_LENGTH,
  adminAccountPasswordSchema,
  firstZodIssueMessage,
} from "@/validations/admin.validation";

type Account = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "super_admin";
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

function displayName(a: Account): string {
  return [a.firstName, a.lastName].filter(Boolean).join(" ").trim() || a.username;
}

function initials(a: Account): string {
  const f = a.firstName?.trim()?.[0] ?? "";
  const l = a.lastName?.trim()?.[0] ?? "";
  const combined = (f + l).toUpperCase();
  if (combined) return combined;
  return a.username.slice(0, 2).toUpperCase();
}

function roleLabel(role: Account["role"]): string {
  return role === "super_admin" ? "Süper yönetici" : "Yönetici";
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function IconAt() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
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

type PasswordFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  autoComplete: string;
  fullWidth?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string | null;
};

function PasswordField({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  autoComplete,
  fullWidth,
  minLength,
  maxLength,
  error,
}: PasswordFieldProps) {
  const id = useId();
  return (
    <label
      className={fullWidth ? "admin-field admin-field--full" : "admin-field"}
      htmlFor={id}
    >
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
          onClick={onToggleShow}
          aria-label={show ? "Parolayı gizle" : "Parolayı göster"}
          aria-pressed={show}
        >
          {show ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
      {error ? (
        <span className="admin-field__help admin-field__help--error">{error}</span>
      ) : null}
    </label>
  );
}

export function AdminAccountPage() {
  const { showToast } = useAdminToast();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(
    null,
  );
  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(
    null,
  );

  const applyAccount = useCallback((a: Account) => {
    setAccount(a);
    setFirstName(a.firstName);
    setLastName(a.lastName);
  }, []);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/account", { credentials: "include" });
      const data = (await res.json()) as { account?: Account; error?: string };
      if (!res.ok || !data.account) {
        setLoadError(readApiError(data, "Hesap bilgileri yüklenemedi."));
        return;
      }
      applyAccount(data.account);
    } catch {
      setLoadError("Hesap bilgileri yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [applyAccount]);

  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  const cancelProfileEdit = () => {
    if (account) {
      setFirstName(account.firstName);
      setLastName(account.lastName);
    }
    setEditingProfile(false);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(readApiError(data, "Profil kaydedilemedi."), "error");
        return;
      }
      const updated = (data as { account?: Account }).account;
      if (updated) {
        applyAccount(updated);
        window.dispatchEvent(new CustomEvent("admin-account-updated"));
      }
      setEditingProfile(false);
      showToast("Profil bilgileri güncellendi.", "success");
    } finally {
      setSavingProfile(false);
    }
  };

  const cancelPasswordEdit = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setEditingPassword(false);
    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setCurrentPasswordError(null);
    setNewPasswordError(null);
    setConfirmPasswordError(null);

    const parsed = adminAccountPasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setCurrentPasswordError(fieldErrors.currentPassword?.[0] ?? null);
      setNewPasswordError(fieldErrors.newPassword?.[0] ?? null);
      setConfirmPasswordError(fieldErrors.confirmPassword?.[0] ?? null);
      showToast(firstZodIssueMessage(parsed.error), "error");
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch("/api/admin/account/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(readApiError(data, "Parola değiştirilemedi."), "error");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setEditingPassword(false);
      showToast("Parolanız güncellendi.", "success");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-account">
        <p className="admin-muted-text">Hesap bilgileri yükleniyor…</p>
      </div>
    );
  }

  if (loadError || !account) {
    return (
      <div className="admin-account">
        <p className="admin-muted-text">{loadError ?? "Hesap bulunamadı."}</p>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={() => void loadAccount()}>
          Yeniden dene
        </button>
      </div>
    );
  }

  return (
    <div className="admin-account">
      <div className="admin-account__hero admin-card">
        <div className="admin-account__hero-main">
          <div className="admin-account__avatar" aria-hidden="true">
            {initials(account)}
          </div>
          <div className="admin-account__hero-text">
            <h2 className="admin-account__name">{displayName(account)}</h2>
            <p className="admin-account__username">@{account.username}</p>
            <span
              className={`admin-account__role admin-account__role--${account.role}`}
            >
              <IconShield />
              {roleLabel(account.role)}
            </span>
          </div>
        </div>
        <ul className="admin-account__facts">
          <li>
            <span className="admin-account__fact-icon"><IconMail /></span>
            <span className="admin-account__fact-label">E-posta</span>
            <span className="admin-account__fact-value">{account.email}</span>
          </li>
          <li>
            <span className="admin-account__fact-icon"><IconAt /></span>
            <span className="admin-account__fact-label">Kullanıcı adı</span>
            <span className="admin-account__fact-value">{account.username}</span>
          </li>
        </ul>
      </div>

      <div className="admin-account__grid">
        <div className="admin-card admin-account__panel">
          <div className="admin-card__head">
            <div className="admin-account__panel-head">
              <span className="admin-account__panel-icon admin-account__panel-icon--profile">
                <IconUser />
              </span>
              <div className="admin-account__panel-head-text">
                <div className="admin-account__name-row">
                  <div className="admin-card__title">Profil bilgileri</div>
                  {!editingProfile ? (
                    <button
                      type="button"
                      className="admin-account__edit-btn"
                      onClick={() => setEditingProfile(true)}
                      aria-label="Profili düzenle"
                      title="Düzenle"
                    >
                      <IconEdit />
                    </button>
                  ) : null}
                </div>
                <div className="admin-card__sub">
                  {editingProfile
                    ? "Ad ve soyadınızı güncelleyin."
                    : "Görüntüleme modu — düzenlemek için kalem simgesine tıklayın."}
                </div>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <dl className="admin-account__display">
              {editingProfile ? (
                <div className="admin-account__display-row admin-account__display-row--edit">
                  <form
                    className="admin-account__form admin-account__form--inline"
                    onSubmit={(ev) => void saveProfile(ev)}
                  >
                    <label className="admin-field">
                      <span>Ad</span>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        autoComplete="given-name"
                        maxLength={80}
                        required
                      />
                    </label>
                    <label className="admin-field">
                      <span>Soyad</span>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        autoComplete="family-name"
                        maxLength={80}
                        required
                      />
                    </label>
                    <div className="admin-account__form-actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        disabled={savingProfile}
                        onClick={cancelProfileEdit}
                      >
                        İptal
                      </button>
                      <button
                        type="submit"
                        className="admin-btn admin-btn--primary"
                        disabled={savingProfile}
                      >
                        <IconUser />
                        {savingProfile ? "Kaydediliyor…" : "Kaydet"}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="admin-account__display-row">
                    <dt>Ad</dt>
                    <dd>{account.firstName}</dd>
                  </div>
                  <div className="admin-account__display-row">
                    <dt>Soyad</dt>
                    <dd>{account.lastName}</dd>
                  </div>
                </>
              )}
            </dl>
          </div>
        </div>

        <div className="admin-card admin-account__panel">
          <div className="admin-card__head">
            <div className="admin-account__panel-head">
              <span className="admin-account__panel-icon admin-account__panel-icon--password">
                <IconLock />
              </span>
              <div className="admin-account__panel-head-text">
                <div className="admin-account__name-row">
                  <div className="admin-card__title">Parola</div>
                  {!editingPassword ? (
                    <button
                      type="button"
                      className="admin-account__edit-btn"
                      onClick={() => setEditingPassword(true)}
                      aria-label="Parolayı değiştir"
                      title="Düzenle"
                    >
                      <IconEdit />
                    </button>
                  ) : null}
                </div>
                <div className="admin-card__sub">
                  {editingPassword
                    ? "Yeni parolanızı belirleyin; gereksinimler aşağıda listelenir."
                    : "Parolanız güvenlik nedeniyle gösterilmez."}
                </div>
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            {editingPassword ? (
              <form className="admin-account__form" onSubmit={(ev) => void savePassword(ev)}>
                <PasswordField
                  label="Mevcut parola"
                  value={currentPassword}
                  onChange={(v) => {
                    setCurrentPassword(v);
                    if (currentPasswordError) setCurrentPasswordError(null);
                  }}
                  show={showCurrentPassword}
                  onToggleShow={() => setShowCurrentPassword((v) => !v)}
                  autoComplete="current-password"
                  fullWidth
                  maxLength={ADMIN_NEW_PASSWORD_MAX_LENGTH}
                  error={currentPasswordError}
                />
                <PasswordField
                  label="Yeni parola"
                  value={newPassword}
                  onChange={(v) => {
                    setNewPassword(v);
                    if (newPasswordError) setNewPasswordError(null);
                  }}
                  show={showNewPassword}
                  onToggleShow={() => setShowNewPassword((v) => !v)}
                  autoComplete="new-password"
                  minLength={ADMIN_NEW_PASSWORD_MIN_LENGTH}
                  maxLength={ADMIN_NEW_PASSWORD_MAX_LENGTH}
                  error={newPasswordError}
                />
                <PasswordField
                  label="Yeni parola (tekrar)"
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v);
                    if (confirmPasswordError) setConfirmPasswordError(null);
                  }}
                  show={showConfirmPassword}
                  onToggleShow={() => setShowConfirmPassword((v) => !v)}
                  autoComplete="new-password"
                  minLength={ADMIN_NEW_PASSWORD_MIN_LENGTH}
                  maxLength={ADMIN_NEW_PASSWORD_MAX_LENGTH}
                  error={confirmPasswordError}
                />
                <AdminPasswordRequirements
                  password={newPassword}
                  confirmPassword={confirmPassword}
                />
                <div className="admin-account__form-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--ghost"
                    disabled={savingPassword}
                    onClick={cancelPasswordEdit}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="admin-btn admin-btn--primary"
                    disabled={
                      savingPassword ||
                      !currentPassword.trim() ||
                      !allPasswordRequirementsMet(newPassword, confirmPassword)
                    }
                  >
                    <IconLock />
                    {savingPassword ? "Güncelleniyor…" : "Kaydet"}
                  </button>
                </div>
              </form>
            ) : (
              <dl className="admin-account__display">
                <div className="admin-account__display-row">
                  <dt>Parola</dt>
                  <dd className="admin-account__display-mask">••••••••••••</dd>
                </div>
              </dl>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
