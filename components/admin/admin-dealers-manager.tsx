"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { AuthorizedDealer } from "@/db/schema/authorized-dealer";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";

type Props = {
  initialDealers: AuthorizedDealer[];
};

function formatApiError(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === "object" &&
    "error" in data &&
    typeof (data as { error: unknown }).error === "string"
  ) {
    return (data as { error: string }).error;
  }
  return fallback;
}

export function AdminDealersManager({ initialDealers }: Props) {
  const [dealers, setDealers] = useState<AuthorizedDealer[]>(initialDealers);
  const [toast, setToast] = useState<AdminToastState>(null);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [name, setName] = useState("");
  const [serviceRegion, setServiceRegion] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const syncList = useCallback(async () => {
    const res = await fetch("/api/admin/dealers", { credentials: "include" });
    const data = (await res.json()) as { dealers?: AuthorizedDealer[]; error?: string };
    if (res.ok && data.dealers) setDealers(data.dealers);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void syncList();
  }, [syncList]);

  const closeModal = () => setModalOpen(false);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setSortOrder(0);
    setName("");
    setServiceRegion("");
    setContactPerson("");
    setPhone("");
    setWebsite("");
    setModalOpen(true);
  };

  const openEdit = (d: AuthorizedDealer) => {
    setModalMode("edit");
    setEditingId(d.id);
    setSortOrder(d.sortOrder);
    setName(d.name);
    setServiceRegion(d.serviceRegion);
    setContactPerson(d.contactPerson ?? "");
    setPhone(d.phone);
    setWebsite(d.website ?? "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        sortOrder,
        name: name.trim(),
        serviceRegion: serviceRegion.trim(),
        contactPerson: contactPerson.trim(),
        phone: phone.trim(),
        website: website.trim(),
      };
      if (modalMode === "create") {
        const res = await fetch("/api/admin/dealers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(formatApiError(data, "Bayi eklenemedi."), "error");
          return;
        }
        showToast("Yetkili bayi eklendi.", "success");
      } else if (editingId != null) {
        const res = await fetch(`/api/admin/dealers/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(formatApiError(data, "Bayi güncellenemedi."), "error");
          return;
        }
        showToast("Bayi güncellendi.", "success");
      }
      closeModal();
      await syncList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (d: AuthorizedDealer) => {
    if (!window.confirm(`“${d.name}” silinsin mi?`)) return;
    const res = await fetch(`/api/admin/dealers/${d.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(formatApiError(data, "Silinemedi."), "error");
      return;
    }
    showToast("Bayi silindi.", "success");
    await syncList();
  };

  return (
    <>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-egitimler-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Yeni bayi
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void syncList()}>
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{dealers.length}</strong> yetkili bayi
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Bayi</th>
              <th>Bölge</th>
              <th>Telefon</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => (
              <tr key={d.id}>
                <td>{d.sortOrder}</td>
                <td>{d.name}</td>
                <td>
                  <span className="admin-table-ellipsis" title={d.serviceRegion}>
                    {d.serviceRegion.length > 40 ? `${d.serviceRegion.slice(0, 40)}…` : d.serviceRegion}
                  </span>
                </td>
                <td>{d.phone}</td>
                <td className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-table-action-btn"
                    onClick={() => openEdit(d)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => void handleDelete(d)}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && mounted
        ? createPortal(
            <div
              className="admin-modal-backdrop admin-mini-modal-backdrop"
              role="presentation"
              onClick={closeModal}
            >
              <div
                className="admin-mini-modal admin-mini-modal--wide"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-dealer-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-mini-modal__head">
                  <h2 id="admin-dealer-modal-title" className="admin-mini-modal__title">
                    {modalMode === "create" ? "Yeni yetkili bayi" : "Bayiyi düzenle"}
                  </h2>
                  <button
                    type="button"
                    className="admin-modal__close"
                    onClick={closeModal}
                    aria-label="Kapat"
                  >
                    ×
                  </button>
                </div>
                <form
                  className="admin-mini-modal__body"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSave();
                  }}
                >
                  <label className="admin-field">
                    <span>Listede sıra</span>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Bayi ticari ünvanı</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={200}
                      autoFocus
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Sorumlu bölge / iller</span>
                    <textarea
                      value={serviceRegion}
                      onChange={(e) => setServiceRegion(e.target.value)}
                      rows={2}
                      maxLength={2000}
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Yetkili kişi (opsiyonel)</span>
                    <input
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      maxLength={120}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Telefon</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={80} />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Web sitesi (opsiyonel)</span>
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://…"
                      maxLength={2048}
                    />
                  </label>
                  <div className="admin-mini-modal__footer">
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={closeModal}>
                      Vazgeç
                    </button>
                    <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
                      {saving ? "Kaydediliyor…" : "Kaydet"}
                    </button>
                  </div>
                </form>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
