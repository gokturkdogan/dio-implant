import type { AdminAuditLogListItem } from "@/lib/admin-audit-display";

export type AuditDateRange = {
  from: string | null;
  to: string | null;
};

export function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfLocalDay(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00`).getTime();
}

export function endOfLocalDay(isoDate: string): number {
  return new Date(`${isoDate}T23:59:59.999`).getTime();
}

export function isAuditLogInDateRange(
  createdAt: string,
  range: AuditDateRange,
): boolean {
  const t = new Date(createdAt).getTime();
  if (Number.isNaN(t)) return true;
  if (range.from && t < startOfLocalDay(range.from)) return false;
  if (range.to && t > endOfLocalDay(range.to)) return false;
  return true;
}

export function filterAuditLogsByDateRange(
  logs: AdminAuditLogListItem[],
  range: AuditDateRange,
): AdminAuditLogListItem[] {
  if (!range.from && !range.to) return logs;
  return logs.filter((log) => isAuditLogInDateRange(log.createdAt, range));
}

export function hasActiveDateRange(range: AuditDateRange): boolean {
  return Boolean(range.from || range.to);
}

/** Başlangıç bitişten sonraysa yer değiştirir. */
export function normalizeAuditDateRange(range: AuditDateRange): AuditDateRange {
  if (range.from && range.to && range.from > range.to) {
    return { from: range.to, to: range.from };
  }
  return range;
}

export type AuditDatePresetId = "today" | "last7" | "last30" | "thisMonth";

export function auditDateRangeForPreset(preset: AuditDatePresetId): AuditDateRange {
  const today = new Date();
  const to = toLocalISODate(today);

  if (preset === "today") {
    return { from: to, to };
  }

  if (preset === "last7") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: toLocalISODate(from), to };
  }

  if (preset === "last30") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: toLocalISODate(from), to };
  }

  const from = new Date(today.getFullYear(), today.getMonth(), 1);
  return { from: toLocalISODate(from), to };
}

export function formatAuditDateRangeLabel(range: AuditDateRange): string | null {
  if (!range.from && !range.to) return null;
  const fmt = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(
        new Date(`${iso}T12:00:00`),
      );
    } catch {
      return iso;
    }
  };
  if (range.from && range.to) {
    if (range.from === range.to) return fmt(range.from);
    return `${fmt(range.from)} – ${fmt(range.to)}`;
  }
  if (range.from) return `${fmt(range.from)} ve sonrası`;
  if (range.to) return `${fmt(range.to)} ve öncesi`;
  return null;
}
