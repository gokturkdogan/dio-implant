"use client";

import { useState } from "react";
import type { CurriculumItem } from "@/lib/training-events-types";
import { CurriculumFormModal } from "./curriculum-form-modal";

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

type Props = {
  items: CurriculumItem[];
  onChange: (items: CurriculumItem[]) => void;
  /** Bu etkinlik formunda seçili konuşmacı adları (sıra korunur, tekrarsız). */
  eventSpeakerNames: string[];
};

export function TrainingEventCurriculumField({
  items,
  onChange,
  eventSpeakerNames,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Müfredat bölümü ekle");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<CurriculumItem | null>(null);

  const openAdd = () => {
    setModalTitle("Müfredat bölümü ekle");
    setEditingIndex(null);
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setModalTitle("Bölümü düzenle");
    setEditingIndex(index);
    setModalInitial(items[index] ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setModalInitial(null);
  };

  const handleSave = (item: CurriculumItem) => {
    if (editingIndex !== null) {
      const next = [...items];
      next[editingIndex] = item;
      onChange(next);
    } else {
      onChange([...items, item]);
    }
  };

  const remove = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-field admin-field--full admin-curriculum-field">
      <span>Müfredat</span>
      <p className="admin-field__help">
        İsteğe bağlı. Program bölümlerini ekleyin; konuşmacı bu etkinlikte seçtiğiniz
        kişiler listesinden gelir. Satıra tıklayarak ayrıntıyı görebilirsiniz.
      </p>

      {items.length > 0 && (
        <ul className="admin-speaker-accordion">
          {items.map((it, idx) => (
            <li key={`curriculum-${idx}`} className="admin-speaker-accordion__item">
              <details className="admin-speaker-acc">
                <summary className="admin-speaker-acc__summary">
                  <span className="admin-speaker-acc__summary-main">
                    <span className="admin-speaker-acc__caret" aria-hidden />
                    <span className="admin-speaker-acc__name admin-curr-acc__summary-text">
                      <span className="admin-curr-acc__time">{it.time}</span>
                      {it.topic ? (
                        <span className="admin-curr-acc__topic-preview">
                          {" "}
                          · {truncate(it.topic, 56)}
                        </span>
                      ) : null}
                    </span>
                  </span>
                  <span
                    className="admin-speaker-acc__summary-actions"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="admin-speaker-chip__btn"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEdit(idx);
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className="admin-speaker-chip__btn admin-speaker-chip__btn--danger"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(idx);
                      }}
                    >
                      Kaldır
                    </button>
                  </span>
                </summary>
                <div className="admin-speaker-acc__panel">
                  <div className="admin-speaker-acc__body admin-curr-acc__panel-body">
                    <div className="admin-curr-acc__block admin-curr-acc__block--full">
                      <span className="admin-speaker-acc__label">Açıklama</span>
                      <p className="admin-speaker-acc__bio">{it.topic || "—"}</p>
                    </div>
                    {it.speaker ? (
                      <div className="admin-curr-acc__block">
                        <span className="admin-speaker-acc__label">Konuşmacı</span>
                        <p className="admin-curr-acc__speaker">{it.speaker}</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="admin-btn admin-btn--secondary" onClick={openAdd}>
        + Bölüm ekle
      </button>

      <CurriculumFormModal
        open={modalOpen}
        title={modalTitle}
        initial={modalInitial}
        speakerNames={eventSpeakerNames}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
