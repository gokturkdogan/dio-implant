"use client";

import { useMemo } from "react";
import {
  auditDateRangeForPreset,
  formatAuditDateRangeLabel,
  hasActiveDateRange,
  type AuditDatePresetId,
  type AuditDateRange,
} from "@/lib/admin-audit-filter";

type Props = {
  range: AuditDateRange;
  onChange: (range: AuditDateRange) => void;
  matchCount: number;
  totalLoaded: number;
};

const PRESETS: { id: AuditDatePresetId; label: string }[] = [
  { id: "today", label: "Bugün" },
  { id: "last7", label: "Son 7 gün" },
  { id: "last30", label: "Son 30 gün" },
  { id: "thisMonth", label: "Bu ay" },
];

function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function activePreset(range: AuditDateRange): AuditDatePresetId | null {
  for (const p of PRESETS) {
    const preset = auditDateRangeForPreset(p.id);
    if (preset.from === range.from && preset.to === range.to) return p.id;
  }
  return null;
}

export function AdminAuditDateRangeFilter({
  range,
  onChange,
  matchCount,
  totalLoaded,
}: Props) {
  const active = hasActiveDateRange(range);
  const rangeLabel = formatAuditDateRangeLabel(range);
  const presetActive = activePreset(range);

  const resultLine = useMemo(() => {
    if (!active) {
      return (
        <>
          Yüklenen <strong>{totalLoaded}</strong> kayıt listeleniyor
        </>
      );
    }
    return (
      <>
        <strong>{matchCount}</strong> kayıt gösteriliyor
        {totalLoaded > matchCount ? (
          <>
            {" "}
            (<strong>{totalLoaded}</strong> kayıt içinden)
          </>
        ) : null}
      </>
    );
  }, [active, matchCount, totalLoaded]);

  const setFrom = (from: string) => {
    onChange({ from: from || null, to: range.to });
  };

  const setTo = (to: string) => {
    onChange({ from: range.from, to: to || null });
  };

  const applyPreset = (id: AuditDatePresetId) => {
    onChange(auditDateRangeForPreset(id));
  };

  const clear = () => onChange({ from: null, to: null });

  return (
    <div className="admin-audit-date-filter">
      <div className="admin-audit-date-filter__main">
        <div className="admin-audit-date-filter__intro">
          <span className="admin-audit-date-filter__icon" aria-hidden="true">
            <IconCalendar />
          </span>
          <div>
            <p className="admin-audit-date-filter__title">Tarih aralığı</p>
            <p className="admin-audit-date-filter__hint">
              Listeyi yüklenen kayıtlar üzerinde anında filtreler
            </p>
          </div>
        </div>

        <div className="admin-audit-date-filter__inputs">
          <label className="admin-audit-date-filter__field">
            <span className="admin-audit-date-filter__field-label">Başlangıç</span>
            <input
              type="date"
              className="admin-audit-date-filter__input"
              value={range.from ?? ""}
              max={range.to ?? undefined}
              onChange={(e) => setFrom(e.target.value)}
              aria-label="Başlangıç tarihi"
            />
          </label>
          <span className="admin-audit-date-filter__sep" aria-hidden="true">
            –
          </span>
          <label className="admin-audit-date-filter__field">
            <span className="admin-audit-date-filter__field-label">Bitiş</span>
            <input
              type="date"
              className="admin-audit-date-filter__input"
              value={range.to ?? ""}
              min={range.from ?? undefined}
              onChange={(e) => setTo(e.target.value)}
              aria-label="Bitiş tarihi"
            />
          </label>
        </div>

        <div className="admin-audit-date-filter__presets" role="group" aria-label="Hızlı seçim">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`admin-audit-date-filter__preset${
                presetActive === p.id ? " admin-audit-date-filter__preset--active" : ""
              }`}
              onClick={() => applyPreset(p.id)}
            >
              {p.label}
            </button>
          ))}
          {active ? (
            <button
              type="button"
              className="admin-audit-date-filter__clear"
              onClick={clear}
            >
              Temizle
            </button>
          ) : null}
        </div>
      </div>

      <div className="admin-audit-date-filter__status">
        <p className="admin-audit-date-filter__result">{resultLine}</p>
        {rangeLabel ? (
          <p className="admin-audit-date-filter__active-range">
            <span className="admin-audit-date-filter__active-dot" aria-hidden="true" />
            {rangeLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
