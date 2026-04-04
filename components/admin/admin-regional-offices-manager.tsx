"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { RegionalOffice } from "@/db/schema/regional-office";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";

type Props = {
  initialOffices: RegionalOffice[];
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

export function AdminRegionalOfficesManager({ initialOffices }: Props) {
  const [offices, setOffices] = useState<RegionalOffice[]>(initialOffices);
  const [toast, setToast] = useState<AdminToastState>(null);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [name, setName] = useState("");
  const [coverage, setCoverage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mapDirectionsUrl, setMapDirectionsUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const syncList = useCallback(async () => {
    const res = await fetch("/api/admin/regional-offices", { credentials: "include" });
    const data = (await res.json()) as { offices?: RegionalOffice[]; error?: string };
    if (res.ok && data.offices) setOffices(data.offices);
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
    setCoverage("");
    setPhone("");
    setEmail("");
    setAddress("");
    setMapDirectionsUrl("");
    setModalOpen(true);
  };

  const openEdit = (o: RegionalOffice) => {
    setModalMode("edit");
    setEditingId(o.id);
    setSortOrder(o.sortOrder);
    setName(o.name);
    setCoverage(o.coverage);
    setPhone(o.phone);
    setEmail(o.email);
    setAddress(o.address);
    setMapDirectionsUrl(o.mapDirectionsUrl);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        sortOrder,
        name: name.trim(),
        coverage: coverage.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        mapDirectionsUrl: mapDirectionsUrl.trim(),
      };
      if (modalMode === "create") {
        const res = await fetch("/api/admin/regional-offices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(formatApiError(data, "Ofis eklenemedi."), "error");
          return;
        }
        showToast("Bölge ofisi eklendi.", "success");
      } else if (editingId != null) {
        const res = await fetch(`/api/admin/regional-offices/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(formatApiError(data, "Ofis güncellenemedi."), "error");
          return;
        }
        showToast("Bölge ofisi güncellendi.", "success");
      }
      closeModal();
      await syncList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (o: RegionalOffice) => {
    if (!window.confirm(`“${o.name}” silinsin mi?`)) return;
    const res = await fetch(`/api/admin/regional-offices/${o.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(formatApiError(data, "Silinemedi."), "error");
      return;
    }
    showToast("Ofis silindi.", "success");
    await syncList();
  };

  return (
    <>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-egitimler-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Yeni ofis
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void syncList()}>
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{offices.length}</strong> bölge ofisi
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Ad</th>
              <th>Hizmet alanı</th>
              <th>Telefon</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {offices.map((o) => (
              <tr key={o.id}>
                <td>{o.sortOrder}</td>
                <td>{o.name}</td>
                <td>
                  <span className="admin-table-ellipsis" title={o.coverage}>
                    {o.coverage.length > 48 ? `${o.coverage.slice(0, 48)}…` : o.coverage}
                  </span>
                </td>
                <td>{o.phone}</td>
                <td className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-table-action-btn"
                    onClick={() => openEdit(o)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => void handleDelete(o)}
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
                aria-labelledby="admin-office-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-mini-modal__head">
                  <h2 id="admin-office-modal-title" className="admin-mini-modal__title">
                    {modalMode === "create" ? "Yeni bölge ofisi" : "Ofisi düzenle"}
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
                    <span>Listede sıra (küçük önce)</span>
                    <input
                      type="number"
                      min={0}
                      max={99999}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Ofis adı</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Örn. Marmara Bölge Müdürlüğü"
                      maxLength={200}
                      autoFocus
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Hizmet alanı (iller / bölgeler)</span>
                    <textarea
                      value={coverage}
                      onChange={(e) => setCoverage(e.target.value)}
                      placeholder="İstanbul, Kocaeli, Bursa…"
                      rows={2}
                      maxLength={2000}
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Adres</span>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      maxLength={500}
                    />
                  </label>
                  <label className="admin-field">
                    <span>Telefon</span>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={80} />
                  </label>
                  <label className="admin-field">
                    <span>E-posta</span>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>Yol tarifi URL’si</span>
                    <input
                      value={mapDirectionsUrl}
                      onChange={(e) => setMapDirectionsUrl(e.target.value)}
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
