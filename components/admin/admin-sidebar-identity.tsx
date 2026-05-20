"use client";

import { useCallback, useEffect, useState } from "react";

type SessionUser = {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  role: "admin" | "super_admin" | null;
};

function IconRoleSuperAdmin() {
  return (
    <svg
      className="admin-sidebar-identity__role-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2l2.2 6.5L21 9l-5 4 1.9 7L12 17.5 5.1 20 7 13 2 9l6.8-.5L12 2z" />
    </svg>
  );
}

function IconRoleAdmin() {
  return (
    <svg
      className="admin-sidebar-identity__role-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.85"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function displayName(u: SessionUser): string {
  const parts = [u.firstName?.trim(), u.lastName?.trim()].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return u.username?.trim() || "Kullanıcı";
}

function roleLabel(role: SessionUser["role"]): string {
  if (role === "super_admin") return "Süper yönetici";
  if (role === "admin") return "Yönetici";
  return "Yönetici";
}

/** Logo satırının altında: ad soyad + rol (oturum API). */
export function AdminSidebarIdentity() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/session", { credentials: "include" });
      const data = (await res.json()) as {
        authenticated?: boolean;
        firstName?: string | null;
        lastName?: string | null;
        username?: string | null;
        role?: string | null;
      };
      if (!res.ok || !data.authenticated) return;
      const role =
        data.role === "admin" || data.role === "super_admin" ? data.role : null;
      setUser({
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        username: data.username ?? null,
        role,
      });
    } catch {
      /* sessiz */
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    void (async () => {
      await fetchSession();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [mounted, fetchSession]);

  useEffect(() => {
    if (!mounted) return;
    const onUpdated = () => void fetchSession();
    window.addEventListener("admin-account-updated", onUpdated);
    return () => window.removeEventListener("admin-account-updated", onUpdated);
  }, [mounted, fetchSession]);

  if (!mounted || !user) return null;

  return (
    <div className="admin-sidebar-identity">
      <p className="admin-sidebar-identity__name">{displayName(user)}</p>
      <div
        className={`admin-sidebar-identity__role admin-sidebar-identity__role--${user.role ?? "admin"}`}
      >
        {user.role === "super_admin" ? <IconRoleSuperAdmin /> : <IconRoleAdmin />}
        <span>{roleLabel(user.role)}</span>
      </div>
    </div>
  );
}
