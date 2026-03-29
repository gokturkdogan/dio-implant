"use client";

import { useState } from "react";
import type { Speaker } from "@/lib/training-events-types";
import { SpeakerFormModal } from "./speaker-form-modal";

export type SpeakerWithFile = Speaker & {
  _pendingPhotoFile?: File | null;
};

type Props = {
  speakers: SpeakerWithFile[];
  onChange: (speakers: SpeakerWithFile[]) => void;
};

export function TrainingEventSpeakersField({ speakers, onChange }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Konuşmacı ekle");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [modalInitial, setModalInitial] = useState<Speaker | null>(null);
  const [modalInitialFile, setModalInitialFile] = useState<File | null>(null);

  const openAdd = () => {
    setModalTitle("Konuşmacı ekle");
    setEditingIndex(null);
    setModalInitial(null);
    setModalInitialFile(null);
    setModalOpen(true);
  };

  const openEdit = (index: number) => {
    setModalTitle("Konuşmacıyı düzenle");
    setEditingIndex(index);
    const sp = speakers[index];
    setModalInitial(sp ?? null);
    setModalInitialFile(sp?._pendingPhotoFile ?? null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingIndex(null);
    setModalInitial(null);
    setModalInitialFile(null);
  };

  const handleSave = (speaker: Speaker, photoFile: File | null) => {
    const entry: SpeakerWithFile = { ...speaker, _pendingPhotoFile: photoFile };
    if (editingIndex !== null) {
      const next = [...speakers];
      next[editingIndex] = entry;
      onChange(next);
    } else {
      onChange([...speakers, entry]);
    }
  };

  const remove = (index: number) => {
    onChange(speakers.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-field admin-field--full admin-speakers-field">
      <span>Konuşmacılar</span>
      <p className="admin-field__help">
        İsteğe bağlı. Satıra tıklayarak eklenen bilgileri görebilirsiniz.
      </p>

      {speakers.length > 0 && (
        <ul className="admin-speaker-accordion">
          {speakers.map((sp, idx) => (
            <li key={`speaker-${idx}`} className="admin-speaker-accordion__item">
              <details className="admin-speaker-acc">
                <summary className="admin-speaker-acc__summary">
                  <span className="admin-speaker-acc__summary-main">
                    <span className="admin-speaker-acc__caret" aria-hidden />
                    <span className="admin-speaker-acc__name">
                      {sp.name || "(İsimsiz)"}
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
                  <div className="admin-speaker-acc__body">
                    {sp.photoUrl ? (
                      <div className="admin-speaker-acc__photo-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sp.photoUrl}
                          alt=""
                          className="admin-speaker-acc__photo"
                        />
                      </div>
                    ) : null}
                    <div className="admin-speaker-acc__cols">
                      {sp.education.length > 0 ? (
                        <div className="admin-speaker-acc__block">
                          <span className="admin-speaker-acc__label">
                            Üniversite / eğitim
                          </span>
                          <ul className="admin-speaker-acc__list">
                            {sp.education.map((line, i) => (
                              <li key={`e-${idx}-${i}`}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {sp.specialties.length > 0 ? (
                        <div className="admin-speaker-acc__block">
                          <span className="admin-speaker-acc__label">
                            Uzmanlık alanları
                          </span>
                          <ul className="admin-speaker-acc__list">
                            {sp.specialties.map((line, i) => (
                              <li key={`s-${idx}-${i}`}>{line}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}
                      {sp.bio.trim() ? (
                        <div className="admin-speaker-acc__block admin-speaker-acc__block--full">
                          <span className="admin-speaker-acc__label">
                            Kendisi hakkında
                          </span>
                          <p className="admin-speaker-acc__bio">{sp.bio}</p>
                        </div>
                      ) : null}
                      {!sp.photoUrl &&
                      sp.education.length === 0 &&
                      sp.specialties.length === 0 &&
                      !sp.bio.trim() ? (
                        <p className="admin-speaker-acc__empty">
                          Henüz ek bilgi girilmemiş.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="admin-btn admin-btn--secondary" onClick={openAdd}>
        + Konuşmacı ekle
      </button>

      <SpeakerFormModal
        open={modalOpen}
        title={modalTitle}
        initial={modalInitial}
        initialPhotoFile={modalInitialFile}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
