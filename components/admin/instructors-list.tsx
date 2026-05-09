"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { InstructorRecord } from "@/lib/instructor-types";
import { instructorToSpeaker } from "@/lib/instructor-types";
import type { Speaker } from "@/lib/training-events-types";
import { SpeakerFormModal } from "./speaker-form-modal";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  initialInstructors: InstructorRecord[];
};

function speakerPayload(speaker: Speaker, photoFile: File | null): Speaker {
  return {
    name: speaker.name,
    photoUrl:
      !photoFile && speaker.photoUrl?.startsWith("https://")
        ? speaker.photoUrl
        : undefined,
    education: speaker.education,
    specialties: speaker.specialties,
    bio: speaker.bio,
  };
}

function formatApiError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function InstructorsList({ initialInstructors }: Props) {
  const { showToast } = useAdminToast();
  const [rows, setRows] = useState<InstructorRecord[]>(initialInstructors);
  const [clientReady, setClientReady] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Yeni eğitmen");
  const [editing, setEditing] = useState<InstructorRecord | null>(null);
  const [modalInitial, setModalInitial] = useState<Speaker | null>(null);

  const syncList = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const res = await fetch("/api/admin/instructors", { credentials: "include" });
      const data = (await res.json()) as { instructors?: InstructorRecord[]; error?: string };
      if (res.ok && data.instructors) {
        setRows(data.instructors);
        if (!opts?.quiet) showToast("Liste güncellendi.", "success");
      } else {
        showToast(formatApiError(data, "Liste yüklenemedi."), "error");
      }
    },
    [showToast],
  );

  useEffect(() => {
    setRows(initialInstructors);
  }, [initialInstructors]);

  useEffect(() => {
    setClientReady(true);
  }, []);

  useEffect(() => {
    if (!clientReady) return;
    void syncList({ quiet: true });
  }, [clientReady, syncList]);

  const openCreate = () => {
    setEditing(null);
    setModalTitle("Yeni eğitmen");
    setModalInitial(null);
    setModalOpen(true);
  };

  const openEdit = (r: InstructorRecord) => {
    setEditing(r);
    setModalTitle("Eğitmeni düzenle");
    setModalInitial(instructorToSpeaker(r));
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setModalInitial(null);
  };

  const onDelete = async (r: InstructorRecord) => {
    if (!window.confirm(`“${r.name}” silinsin mi? Bu işlem geri alınamaz.`)) return;
    const res = await fetch(`/api/admin/instructors/${r.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      showToast(typeof data?.error === "string" ? data.error : "Silinemedi", "error");
      return;
    }
    showToast("Eğitmen silindi.", "success");
    await syncList();
  };

  const handleSave = async (speaker: Speaker, photoFile: File | null) => {
    const body = speakerPayload(speaker, photoFile);
    const fd = new FormData();
    fd.append("instructor", JSON.stringify(body));
    if (photoFile) fd.append("photo", photoFile);

    if (editing) {
      const hadPhoto = !!editing.photoUrl;
      const stillHasHttps = !!speaker.photoUrl?.startsWith("https://");
      if (hadPhoto && !photoFile && !stillHasHttps) {
        fd.append("removePhoto", "1");
      }
      const res = await fetch(`/api/admin/instructors/${editing.id}`, {
        method: "PUT",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(typeof data?.error === "string" ? data.error : "Güncellenemedi", "error");
        return;
      }
      showToast("Eğitmen güncellendi.", "success");
    } else {
      const res = await fetch("/api/admin/instructors", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        showToast(typeof data?.error === "string" ? data.error : "Kayıt başarısız", "error");
        return;
      }
      showToast("Eğitmen eklendi.", "success");
    }

    closeModal();
    await syncList();
  };

  return (
    <>
      <div className="admin-egitimler-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Yeni eğitmen
        </button>
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => void syncList()}
        >
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{rows.length}</strong> eğitmen
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th aria-label="Görsel" />
              <th>Ad soyad</th>
              <th>Uzmanlık</th>
              <th>Biyografi</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ width: 56 }}>
                  {r.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photoUrl}
                      alt=""
                      className="admin-instructor-table-thumb"
                    />
                  ) : (
                    <span className="admin-instructor-table-thumb admin-instructor-table-thumb--empty">
                      —
                    </span>
                  )}
                </td>
                <td>
                  <span className="admin-instructor-name">{r.name}</span>
                </td>
                <td>
                  <span className="admin-table-ellipsis" title={r.specialties.join(", ")}>
                    {r.specialties.length ? r.specialties.join(", ") : "—"}
                  </span>
                </td>
                <td>
                  <span className="admin-table-ellipsis admin-table-ellipsis--bio" title={r.bio}>
                    {r.bio.trim() ? r.bio : "—"}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-table-action-btn"
                    onClick={() => openEdit(r)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => void onDelete(r)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="admin-field__help" style={{ marginTop: 16 }}>
        Bu listeden eklediğiniz eğitmenleri{" "}
        <Link href="/admin-panel/egitimler" className="admin-table-link">
          eğitim düzenlerken
        </Link>{" "}
        konuşmacı alanından seçebilirsiniz.
      </p>

      <SpeakerFormModal
        open={modalOpen}
        title={modalTitle}
        initial={modalInitial}
        onClose={closeModal}
        onSave={handleSave}
      />
    </>
  );
}
