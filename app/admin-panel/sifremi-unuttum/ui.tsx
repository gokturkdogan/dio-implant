"use client";

import Link from "next/link";
import { useState } from "react";
import Script from "next/script";
import { useAdminToast } from "@/components/admin/admin-toast-provider";
import { AdminThemeToggle } from "@/components/admin/admin-theme-toggle";

function readApiError(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function AdminForgotPasswordClient() {
  const { showToast } = useAdminToast();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
        showToast(readApiError(data, "Talep gönderilemedi."), "error");
        return;
      }

      const message =
        typeof data.message === "string"
          ? data.message
          : "Parola sıfırlama bağlantısı e-posta adresinize gönderildi.";
      setSuccessMessage(message);
      setSubmitted(true);
      showToast("Talebiniz alındı.", "success");
    } catch {
      showToast("Talep gönderilemedi.", "error");
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
              <h1 className="admin-auth__title">Şifremi unuttum</h1>
              <p className="admin-auth__subtitle">
                Kullanıcı adınız ve kayıtlı e-posta adresinizi girin
              </p>
            </div>
          </div>

          {submitted && successMessage ? (
            <div className="admin-auth__success-block">
              <p className="admin-auth__success-text">{successMessage}</p>
              <Link href="/admin-panel/login" className="admin-btn admin-btn--primary admin-auth__submit">
                Giriş sayfasına dön
              </Link>
            </div>
          ) : (
            <form className="admin-auth__form" onSubmit={(ev) => void submit(ev)}>
              <label className="admin-field">
                <span>Kullanıcı adı</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  placeholder="Kullanıcı adınız"
                  required
                  maxLength={64}
                />
              </label>

              <label className="admin-field">
                <span>E-posta</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="Kayıtlı e-posta adresiniz"
                  required
                  maxLength={200}
                />
              </label>

              <button
                className="admin-btn admin-btn--primary admin-auth__submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Gönderiliyor…" : "Talep gönder"}
              </button>

              <p className="admin-auth__hint">
                <Link href="/admin-panel/login" className="admin-auth__link">
                  Giriş sayfasına dön
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
      <Script src="/admin-panel/theme-toggle.js" strategy="afterInteractive" />
    </main>
  );
}
