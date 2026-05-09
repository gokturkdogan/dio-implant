"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { InstructorRecord } from "@/lib/instructor-types";

type Props = {
  open: boolean;
  instructors: InstructorRecord[];
  excludeIds: Set<number>;
  onClose: () => void;
  onPick: (record: InstructorRecord) => void;
};

export function InstructorPickerModal({
  open,
  instructors,
  excludeIds,
  onClose,
  onPick,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase("tr-TR");
    const available = instructors.filter((r) => !excludeIds.has(r.id));
    if (!q) return available;
    return available.filter((r) => r.name.toLocaleLowerCase("tr-TR").includes(q));
  }, [instructors, excludeIds, query]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="admin-modal-backdrop admin-mini-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-mini-modal admin-mini-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="instructor-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-mini-modal__head">
          <h2 id="instructor-picker-title" className="admin-mini-modal__title">
            Eğitmenden ekle
          </h2>
          <button
            type="button"
            className="admin-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>
        <div className="admin-mini-modal__body">
          <label className="admin-field admin-field--full">
            <span>Ara</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="İsme göre süz…"
              autoFocus
            />
          </label>

          {filtered.length === 0 ? (
            <p className="admin-field__help">
              {instructors.length === 0
                ? "Henüz kayıtlı eğitmen yok. Eğitmenler sayfasından ekleyin."
                : "Filtreyle eşleşen veya etkinliğe eklenmemiş eğitmen kalmadı."}
            </p>
          ) : (
            <ul className="admin-instructor-picker-list">
              {filtered.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    className="admin-instructor-picker-row"
                    onClick={() => {
                      onPick(r);
                      onClose();
                    }}
                  >
                    {r.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photoUrl} alt="" className="admin-instructor-picker-row__img" />
                    ) : (
                      <span className="admin-instructor-picker-row__img admin-instructor-picker-row__img--empty" />
                    )}
                    <span className="admin-instructor-picker-row__text">
                      <span className="admin-instructor-picker-row__name">{r.name}</span>
                      {r.specialties.length > 0 ? (
                        <span className="admin-instructor-picker-row__sub">
                          {r.specialties.slice(0, 2).join(" · ")}
                          {r.specialties.length > 2 ? "…" : ""}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="admin-mini-modal__footer">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
