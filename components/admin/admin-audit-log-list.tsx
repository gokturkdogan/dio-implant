"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  auditActionLabel,
  auditResourceLabel,
  formatAuditActorName,
  formatAuditDateTime,
  type AdminAuditLogListItem,
} from "@/lib/admin-audit-display";
import {
  filterAuditLogsByDateRange,
  hasActiveDateRange,
  normalizeAuditDateRange,
  type AuditDateRange,
} from "@/lib/admin-audit-filter";
import { AdminAuditDateRangeFilter } from "./admin-audit-date-range-filter";
import { AdminAuditDetailModal } from "./admin-audit-detail-modal";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  initialLogs: AdminAuditLogListItem[];
  initialTotal: number;
};

function actionBadgeClass(action: string): string {
  if (action === "create" || action === "invite") return "admin-audit-table__badge--create";
  if (action === "delete") return "admin-audit-table__badge--delete";
  if (action === "update" || action === "profile_update" || action === "password_update") {
    return "admin-audit-table__badge--update";
  }
  return "admin-audit-table__badge--neutral";
}

const EMPTY_DATE_RANGE: AuditDateRange = { from: null, to: null };

export function AdminAuditLogList({ initialLogs, initialTotal }: Props) {
  const { showToast } = useAdminToast();
  const [allRows, setAllRows] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [dateRange, setDateRange] = useState<AuditDateRange>(EMPTY_DATE_RANGE);
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [detail, setDetail] = useState<AdminAuditLogListItem | null>(null);

  const filteredRows = useMemo(
    () => filterAuditLogsByDateRange(allRows, dateRange),
    [allRows, dateRange],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setAllRows(initialLogs);
    setTotal(initialTotal);
  }, [initialLogs, initialTotal]);

  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detail]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/admin/audit-logs?limit=80", {
        credentials: "include",
      });
      const data = (await res.json()) as {
        logs?: AdminAuditLogListItem[];
        total?: number;
        error?: string;
      };
      if (!res.ok || !data.logs) {
        showToast(data.error ?? "Günlük yüklenemedi.", "error");
        return;
      }
      setAllRows(data.logs);
      setTotal(data.total ?? data.logs.length);
      showToast("Günlük güncellendi.", "success");
    } catch {
      showToast("Günlük yüklenemedi.", "error");
    } finally {
      setRefreshing(false);
    }
  }, [showToast]);

  const dateFilterActive = hasActiveDateRange(dateRange);
  const showEmpty = allRows.length === 0;
  const showFilterEmpty = !showEmpty && filteredRows.length === 0;

  return (
    <>
      <AdminAuditDateRangeFilter
        range={dateRange}
        onChange={(next) => setDateRange(normalizeAuditDateRange(next))}
        matchCount={filteredRows.length}
        totalLoaded={allRows.length}
      />

      <div className="admin-audit-toolbar">
        <p className="admin-egitimler-count admin-audit-toolbar__count">
          Veritabanında toplam <strong>{total}</strong> kayıt
          {allRows.length < total ? (
            <>
              {" "}
              (bu sayfada <strong>{allRows.length}</strong> yüklü)
            </>
          ) : null}
        </p>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          disabled={refreshing}
          onClick={() => void refresh()}
        >
          {refreshing ? "Yenileniyor…" : "Listeyi yenile"}
        </button>
      </div>

      {showEmpty ? (
        <p className="admin-muted-text">Henüz işlem kaydı yok.</p>
      ) : showFilterEmpty ? (
        <p className="admin-muted-text">Seçilen tarih aralığında kayıt bulunamadı.</p>
      ) : (
        <div className="admin-table-wrap admin-audit-table-wrap">
          <table className="admin-table admin-audit-table">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Saat</th>
                <th>İşlem</th>
                <th>Alan</th>
                <th>Kullanıcı</th>
                <th aria-label="Detay" />
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((log) => {
                const when = formatAuditDateTime(log.createdAt);
                const actor = formatAuditActorName(log);
                return (
                  <tr key={log.id}>
                    <td className="admin-audit-table__date">{when.date}</td>
                    <td className="admin-audit-table__time">{when.time}</td>
                    <td>
                      <span
                        className={`admin-audit-table__badge ${actionBadgeClass(log.action)}`}
                      >
                        {auditActionLabel(log.action)}
                      </span>
                    </td>
                    <td className="admin-audit-table__area">
                      {auditResourceLabel(log.resourceType)}
                    </td>
                    <td>
                      <span className="admin-audit-table__user" title={log.email}>
                        {actor}
                      </span>
                    </td>
                    <td className="admin-audit-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--small"
                        onClick={() => setDetail(log)}
                      >
                        Detayı görüntüle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && mounted
        ? createPortal(
            <AdminAuditDetailModal log={detail} onClose={() => setDetail(null)} />,
            document.body,
          )
        : null}
    </>
  );
}
