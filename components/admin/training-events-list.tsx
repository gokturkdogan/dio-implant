"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { TrainingEvent } from "@/lib/training-events-types";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  initialEvents: TrainingEvent[];
};

function formatApiError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function TrainingEventsList({ initialEvents }: Props) {
  const { showToast } = useAdminToast();
  const [events, setEvents] = useState<TrainingEvent[]>(initialEvents);

  const syncList = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const res = await fetch("/api/admin/trainings", { credentials: "include" });
      const data = (await res.json()) as { events?: TrainingEvent[]; error?: string };
      if (res.ok && data.events) {
        setEvents(data.events);
        if (!opts?.quiet) showToast("Liste güncellendi.", "success");
      } else {
        showToast(formatApiError(data, "Liste yüklenemedi."), "error");
      }
    },
    [showToast],
  );

  useEffect(() => {
    void syncList({ quiet: true });
  }, [syncList]);

  const onDelete = async (slug: string) => {
    if (!window.confirm(`“${slug}” silinsin mi? Bu işlem geri alınamaz.`)) return;
    const res = await fetch(
      `/api/admin/trainings?slug=${encodeURIComponent(slug)}`,
      { method: "DELETE", credentials: "include" },
    );
    const data = await res.json();
    if (!res.ok) {
      showToast(formatApiError(data, "Silinemedi"), "error");
      return;
    }
    showToast("Eğitim silindi.", "success");
    await syncList();
  };

  return (
    <>
      <div className="admin-egitimler-toolbar">
        <Link href="/admin-panel/egitimler/yeni" className="admin-btn admin-btn--primary">
          Yeni eğitim
        </Link>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => void syncList()}
        >
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{events.length}</strong> etkinlik
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Tarih</th>
              <th>Şehir</th>
              <th>Format</th>
              <th>Slug</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.slug}>
                <td>
                  <Link
                    className="admin-table-link"
                    href={`/dio-akademi/egitim-takvimi/${ev.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ev.title}
                  </Link>
                </td>
                <td>{ev.dateDisplay}</td>
                <td>{ev.city}</td>
                <td>{ev.format}</td>
                <td>
                  <code className="admin-code">{ev.slug}</code>
                </td>
                <td className="admin-table-actions">
                  <Link
                    href={`/admin-panel/egitimler/duzenle/${encodeURIComponent(ev.slug)}`}
                    className="admin-table-action-btn"
                  >
                    Düzenle
                  </Link>
                  <button
                    type="button"
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => void onDelete(ev.slug)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
