"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { AdminUserListItem } from "@/lib/admin-user-types";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  initialUsers: AdminUserListItem[];
};

function formatApiError(data: unknown, fallback: string): string {
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

function displayName(u: AdminUserListItem): string {
  return [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.username;
}

function initials(u: AdminUserListItem): string {
  const f = u.firstName?.trim()?.[0] ?? "";
  const l = u.lastName?.trim()?.[0] ?? "";
  const combined = (f + l).toUpperCase();
  if (combined) return combined;
  return u.username.slice(0, 2).toUpperCase();
}

function roleLabel(role: AdminUserListItem["role"]): string {
  return role === "super_admin" ? "Süper yönetici" : "Yönetici";
}

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function AdminUsersList({ initialUsers }: Props) {
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState<AdminUserListItem[]>(initialUsers);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setRows(initialUsers);
  }, [initialUsers]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      const data = (await res.json()) as { users?: AdminUserListItem[]; error?: string };
      if (!res.ok || !data.users) {
        showToast(formatApiError(data, "Liste yüklenemedi."), "error");
        return;
      }
      setRows(data.users);
      showToast("Liste güncellendi.", "success");
    } catch {
      showToast("Liste yüklenemedi.", "error");
    } finally {
      setRefreshing(false);
    }
  }, [showToast]);

  return (
    <>
      <div className="admin-egitimler-toolbar">
        <Link
          href="/admin-panel/kullanicilar/yeni"
          className="admin-btn admin-btn--primary"
        >
          Yeni kullanıcı ekle
        </Link>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          {refreshing ? "Yenileniyor…" : "Listeyi yenile"}
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{rows.length}</strong> kullanıcı
      </p>

      {rows.length === 0 ? (
        <p className="admin-muted-text">Henüz kayıtlı kullanıcı yok.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table admin-users-table">
            <thead>
              <tr>
                <th aria-label="Kullanıcı" />
                <th>Ad soyad</th>
                <th>Kullanıcı adı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Kayıt tarihi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td style={{ width: 48 }}>
                    <span
                      className="admin-users-table__avatar"
                      aria-hidden="true"
                    >
                      {initials(u)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-users-table__name">{displayName(u)}</span>
                  </td>
                  <td>
                    <code className="admin-users-table__code">@{u.username}</code>
                  </td>
                  <td>
                    <a
                      href={`mailto:${u.email}`}
                      className="admin-table-link admin-users-table__email"
                    >
                      {u.email}
                    </a>
                  </td>
                  <td>
                    <span
                      className={`admin-users-table__role admin-users-table__role--${u.role}`}
                    >
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td>
                    <span className="admin-users-table__date" title={u.updatedAt}>
                      {formatDate(u.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
