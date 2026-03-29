"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MAX_ADMIN_IMAGE_UPLOAD_MB } from "@/lib/admin-image-upload";
import type { Speaker } from "@/lib/training-events-types";
import { AdminCropImageField } from "./admin-crop-image-field";

function emptyDraft() {
  return {
    name: "",
    photoUrl: "",
    education: [""],
    specialties: [""],
    bio: "",
  };
}

type Draft = ReturnType<typeof emptyDraft>;

function draftToSpeaker(d: Draft): Speaker {
  return {
    name: d.name.trim(),
    photoUrl: d.photoUrl.trim() || undefined,
    education: d.education.map((x) => x.trim()).filter(Boolean),
    specialties: d.specialties.map((x) => x.trim()).filter(Boolean),
    bio: d.bio.trim(),
  };
}

function speakerToDraft(s: Speaker): Draft {
  return {
    name: s.name,
    photoUrl: s.photoUrl ?? "",
    education: s.education.length ? [...s.education] : [""],
    specialties: s.specialties.length ? [...s.specialties] : [""],
    bio: s.bio,
  };
}

type Props = {
  open: boolean;
  title: string;
  initial: Speaker | null;
  /** Düzenleme modunda önceden bekleyen dosya varsa */
  initialPhotoFile?: File | null;
  onClose: () => void;
  onSave: (speaker: Speaker, photoFile: File | null) => void;
};

export function SpeakerFormModal({
  open,
  title,
  initial,
  initialPhotoFile,
  onClose,
  onSave,
}: Props) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraft(initial ? speakerToDraft(initial) : emptyDraft());
    setPhotoFile(initialPhotoFile ?? null);
  }, [open, initial, initialPhotoFile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const setEducation = (i: number, value: string) => {
    setDraft((d) => {
      const next = [...d.education];
      next[i] = value;
      return { ...d, education: next };
    });
  };

  const addEducation = () => {
    setDraft((d) => ({ ...d, education: [...d.education, ""] }));
  };

  const removeEducation = (i: number) => {
    setDraft((d) => ({
      ...d,
      education: d.education.length > 1 ? d.education.filter((_, j) => j !== i) : [""],
    }));
  };

  const setSpecialty = (i: number, value: string) => {
    setDraft((d) => {
      const next = [...d.specialties];
      next[i] = value;
      return { ...d, specialties: next };
    });
  };

  const addSpecialty = () => {
    setDraft((d) => ({ ...d, specialties: [...d.specialties, ""] }));
  };

  const removeSpecialty = (i: number) => {
    setDraft((d) => ({
      ...d,
      specialties:
        d.specialties.length > 1 ? d.specialties.filter((_, j) => j !== i) : [""],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const speaker = draftToSpeaker(draft);
    if (!speaker.name) return;
    onSave(speaker, photoFile);
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
        aria-labelledby="speaker-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-mini-modal__head">
          <h2 id="speaker-modal-title" className="admin-mini-modal__title">
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
            <span>Ad soyad *</span>
            <input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              required
              autoFocus
            />
          </label>

          <div className="admin-field admin-field--full">
            <AdminCropImageField
              label="Portre görseli (opsiyonel)"
              help={`Kare (1:1) kırpma önerilir. En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
              value={draft.photoUrl}
              aspect={1}
              thumbClass="admin-training-image-field__thumb--speaker"
              onChange={(previewUrl) =>
                setDraft((d) => ({ ...d, photoUrl: previewUrl }))
              }
              onFileChange={(file) => setPhotoFile(file)}
            />
          </div>

          <div className="admin-field admin-field--full">
            <span>Üniversite / eğitim</span>
            <p className="admin-field__help">Birden fazla satır ekleyebilirsiniz.</p>
            <div className="admin-repeat-list">
              {draft.education.map((line, i) => (
                <div key={`edu-${i}`} className="admin-repeat-row">
                  <input
                    value={line}
                    onChange={(e) => setEducation(i, e.target.value)}
                    placeholder="Örn. üniversite veya unvan"
                  />
                  <button
                    type="button"
                    className="admin-repeat-remove"
                    onClick={() => removeEducation(i)}
                    aria-label="Satırı kaldır"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--small"
                onClick={addEducation}
              >
                + Satır ekle
              </button>
            </div>
          </div>

          <div className="admin-field admin-field--full">
            <span>Uzmanlık alanları</span>
            <p className="admin-field__help">
              Her satır ayrı bir uzmanlık olarak kaydedilir.
            </p>
            <div className="admin-repeat-list">
              {draft.specialties.map((line, i) => (
                <div key={`sp-${i}`} className="admin-repeat-row">
                  <input
                    value={line}
                    onChange={(e) => setSpecialty(i, e.target.value)}
                    placeholder="Uzmanlık alanı"
                  />
                  <button
                    type="button"
                    className="admin-repeat-remove"
                    onClick={() => removeSpecialty(i)}
                    aria-label="Satırı kaldır"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--small"
                onClick={addSpecialty}
              >
                + Uzmanlık ekle
              </button>
            </div>
          </div>

          <label className="admin-field admin-field--full">
            <span>Kendisi hakkında</span>
            <textarea
              rows={4}
              value={draft.bio}
              onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
              placeholder="Kısa biyografi paragrafı…"
            />
          </label>

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
