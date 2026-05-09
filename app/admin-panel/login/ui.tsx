"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useAdminToast } from "@/components/admin/admin-toast-provider";

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

export function AdminLoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const pwdId = useId();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        showToast(body?.error ?? "Giriş yapılamadı", "error");
        return;
      }

      showToast("Giriş başarılı.", "success");
      router.replace(nextPath);
    } catch {
      showToast("Giriş yapılamadı", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell">
      <div className="admin-auth">
        <div className="admin-auth__glow" aria-hidden="true" />
        <div className="admin-auth__card">
          <div className="admin-auth__brand">
            <div className="admin-auth__mark">DIO</div>
            <div className="admin-auth__brand-text">
              <h1 className="admin-auth__title">Yönetim paneli</h1>
              <p className="admin-auth__subtitle">Devam etmek için oturum açın</p>
            </div>
          </div>

          <form className="admin-auth__form" onSubmit={submit}>
            <label className="admin-field">
              <span>Kullanıcı adı</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="Kullanıcı adınız"
              />
            </label>

            <label className="admin-field" htmlFor={pwdId}>
              <span>Parola</span>
              <div className="admin-auth-password">
                <input
                  id={pwdId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="admin-auth-password__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Parolayı gizle" : "Parolayı göster"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </label>

            <button className="admin-btn admin-btn--primary admin-auth__submit" disabled={loading}>
              {loading ? "Giriş yapılıyor…" : "Giriş yap"}
            </button>

            <p className="admin-auth__hint">
              Bu sayfa menüde listelenmez; doğrudan adres ile açılır.
            </p>
          </form>
        </div>
      </div>
      <Script src="/admin-panel/theme-toggle.js" strategy="afterInteractive" />
    </main>
  );
}

