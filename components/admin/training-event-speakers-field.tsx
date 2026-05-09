"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { InstructorRecord } from "@/lib/instructor-types";
import { instructorToSpeaker } from "@/lib/instructor-types";
import type { Speaker } from "@/lib/training-events-types";
import { InstructorPickerModal } from "./instructor-picker-modal";

export type SpeakerWithFile = Speaker;

type Props = {
  speakers: SpeakerWithFile[];
  onChange: (speakers: SpeakerWithFile[]) => void;
};

export function TrainingEventSpeakersField({ speakers, onChange }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [catalog, setCatalog] = useState<InstructorRecord[]>([]);

  const loadCatalog = useCallback(async () => {
    const res = await fetch("/api/admin/instructors", { credentials: "include" });
    const data = (await res.json()) as { instructors?: InstructorRecord[] };
    if (res.ok && data.instructors) setCatalog(data.instructors);
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const excludeIds = useMemo(() => {
    const ids = new Set<number>();
    for (const sp of speakers) {
      if (sp.instructorId != null && sp.instructorId > 0) ids.add(sp.instructorId);
    }
    return ids;
  }, [speakers]);

  const remove = (index: number) => {
    onChange(speakers.filter((_, i) => i !== index));
  };

  const onPick = (record: InstructorRecord) => {
    if (excludeIds.has(record.id)) return;
    const entry: SpeakerWithFile = {
      ...instructorToSpeaker(record),
      instructorId: record.id,
    };
    onChange([...speakers, entry]);
  };

  return (
    <div className="admin-field admin-field--full admin-speakers-field">
      <span>Konuşmacılar</span>
      <p className="admin-field__help">
        Eğitmenleri{" "}
        <Link href="/admin-panel/egitmenler" className="admin-table-link">
          Eğitmenler
        </Link>{" "}
        sayfasından yönetir; burada etkinliğe eklemek üzere seçersiniz. Seçim
        eğitmen kaydına bağlanır; kütüphanede yapılan güncellemeler geçmiş ve
        yeni tüm etkinlik sayfalarında otomatik yansır. Sıra ve kaldırma yalnızca
        bu eğitime uygulanır.
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

      <div className="admin-speakers-field__actions">
        <button
          type="button"
          className="admin-btn admin-btn--secondary"
          onClick={() => setPickerOpen(true)}
        >
          + Eğitmenden ekle
        </button>
        <Link href="/admin-panel/egitmenler" className="admin-btn admin-btn--ghost">
          Eğitmenleri yönet →
        </Link>
        <button
          type="button"
          className="admin-btn admin-btn--ghost admin-btn--small"
          onClick={() => void loadCatalog()}
        >
          Listeyi yenile
        </button>
      </div>

      <InstructorPickerModal
        open={pickerOpen}
        instructors={catalog}
        excludeIds={excludeIds}
        onClose={() => setPickerOpen(false)}
        onPick={onPick}
      />
    </div>
  );
}
