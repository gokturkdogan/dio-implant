"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";

export function AdminLoginClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error ?? "Giriş yapılamadı");
        return;
      }

      router.replace(nextPath);
    } catch {
      setError("Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-shell">
      <div className="admin-auth">
        <div className="admin-auth__card">
          <div className="admin-auth__brand">
            <div className="admin-auth__mark">DIO</div>
            <div className="admin-auth__title">Admin Panel</div>
          </div>

          <form className="admin-auth__form" onSubmit={submit}>
            <label className="admin-field">
              <span>Kullanıcı adı</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="admin"
              />
            </label>

            <label className="admin-field">
              <span>Parola</span>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>

            {error ? <div className="admin-auth__error">{error}</div> : null}

            <button className="admin-btn admin-btn--primary" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş yap"}
            </button>

            <div className="admin-auth__hint">
              Bu sayfa navigasyonda görünmez; sadece URL ile erişilir.
            </div>
          </form>
        </div>
      </div>
      <Script src="/admin-panel/theme-toggle.js" strategy="afterInteractive" />
    </main>
  );
}

