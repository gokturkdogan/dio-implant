"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { CurriculumItem } from "@/lib/training-events-types";

function padTimePart(t: string): string {
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return "09:00";
  let h = parseInt(m[1], 10);
  let min = parseInt(m[2], 10);
  if (Number.isNaN(h) || Number.isNaN(min)) return "09:00";
  h = Math.min(23, Math.max(0, h));
  min = Math.min(59, Math.max(0, min));
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

function parseTimeRangeToInputs(timeStr: string): { start: string; end: string } {
  const s = timeStr.trim();
  const m = s.match(/^(\d{1,2}:\d{2})\s*[–\-—]\s*(\d{1,2}:\d{2})/);
  if (m) {
    return { start: padTimePart(m[1]), end: padTimePart(m[2]) };
  }
  const single = s.match(/^(\d{1,2}:\d{2})/);
  if (single) {
    const st = padTimePart(single[1]);
    return { start: st, end: st };
  }
  return { start: "09:00", end: "10:00" };
}

function emptyDraft() {
  return {
    timeStart: "09:00",
    timeEnd: "10:00",
    topic: "",
    speaker: "",
  };
}

type Draft = ReturnType<typeof emptyDraft>;

function itemToDraft(item: CurriculumItem): Draft {
  const { start, end } = parseTimeRangeToInputs(item.time);
  return {
    timeStart: start,
    timeEnd: end,
    topic: item.topic,
    speaker: item.speaker ?? "",
  };
}

function draftToItem(d: Draft): CurriculumItem {
  const time = `${d.timeStart.trim()} – ${d.timeEnd.trim()}`;
  const topic = d.topic.trim();
  const speaker = d.speaker.trim();
  return {
    time,
    topic,
    ...(speaker ? { speaker } : {}),
  };
}

type Props = {
  open: boolean;
  title: string;
  initial: CurriculumItem | null;
  /** Bu etkinlikte seçili konuşmacı adları (formdan; kayıt gerekmez). */
  speakerNames: string[];
  onClose: () => void;
  onSave: (item: CurriculumItem) => void;
};

export function CurriculumFormModal({
  open,
  title,
  initial,
  speakerNames,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraft(initial ? itemToDraft(initial) : emptyDraft());
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const speakerSelectOptions = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const raw of speakerNames) {
      const n = raw.trim();
      if (!n || seen.has(n)) continue;
      seen.add(n);
      ordered.push(n);
    }
    const cur = draft.speaker.trim();
    if (cur && !seen.has(cur)) {
      ordered.unshift(cur);
    }
    return ordered;
  }, [speakerNames, draft.speaker]);

  if (!open || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item = draftToItem(draft);
    if (!item.topic) return;
    onSave(item);
    onClose();
  };

  return createPortal(
    <div
      className="admin-modal-backdrop admin-mini-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-mini-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="curriculum-modal-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="admin-mini-modal__head">
          <h2 id="curriculum-modal-title" className="admin-mini-modal__title">
            {title}
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
        <form className="admin-mini-modal__body" onSubmit={handleSubmit}>
          <label className="admin-field admin-field--full">
            <span>Zaman aralığı *</span>
            <div className="admin-field-row admin-field-row--time-range">
              <input
                type="time"
                className="admin-time-input"
                value={draft.timeStart}
                step={300}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, timeStart: e.target.value }))
                }
                required
                aria-label="Başlangıç"
              />
              <span className="admin-time-range-sep" aria-hidden>
                –
              </span>
              <input
                type="time"
                className="admin-time-input"
                value={draft.timeEnd}
                step={300}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, timeEnd: e.target.value }))
                }
                required
                aria-label="Bitiş"
              />
            </div>
          </label>

          <label className="admin-field admin-field--full">
            <span>Açıklama *</span>
            <textarea
              rows={4}
              value={draft.topic}
              onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
              required
              placeholder="Örn. Kayıt & Karşılama, oturum başlığı…"
            />
          </label>

          <div className="admin-field admin-field--full">
            <span>Konuşmacı (opsiyonel)</span>
            <p className="admin-field__help">
              Yalnızca bu etkinlikte eklediğiniz konuşmacılardan seçilir; listede
              yoksa önce üstteki “Konuşmacılar” bölümünden ekleyin. Kayıt etmeden
              seçilen konuşmacılar da burada görünür.
            </p>
            <select
              value={draft.speaker}
              onChange={(e) => setDraft((d) => ({ ...d, speaker: e.target.value }))}
              aria-label="Müfredat satırı konuşmacısı"
            >
              <option value="">— Yok —</option>
              {speakerSelectOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            {speakerNames.length === 0 && !draft.speaker.trim() ? (
              <p className="admin-field__help">Henüz konuşmacı eklenmedi.</p>
            ) : null}
          </div>

          <div className="admin-mini-modal__footer">
            <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
              Vazgeç
            </button>
            <button type="submit" className="admin-btn admin-btn--primary">
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
