"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Province } from "@/db/schema/province";
import type { AuthorizedDealerWithProvinces } from "@/services/authorized-dealer.service";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";
import { ColorInput } from "./color-input";
import {
  SearchableMultiSelect,
  type SearchableOption,
} from "./searchable-multi-select";

type Props = {
  initialDealers: AuthorizedDealerWithProvinces[];
  initialProvinces: Province[];
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

function randomVivid(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 65 + Math.floor(Math.random() * 18);
  const l = 50 + Math.floor(Math.random() * 14);
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l / 100 - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

export function AdminDealersManager({ initialDealers, initialProvinces }: Props) {
  const [dealers, setDealers] = useState<AuthorizedDealerWithProvinces[]>(initialDealers);
  const [provinces] = useState<Province[]>(initialProvinces);
  const [toast, setToast] = useState<AdminToastState>(null);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [name, setName] = useState("");
  const [provinceIds, setProvinceIds] = useState<number[]>([]);
  const [color, setColor] = useState("#5B8DEF");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const syncList = useCallback(async () => {
    const res = await fetch("/api/admin/dealers", { credentials: "include" });
    const data = (await res.json()) as {
      dealers?: AuthorizedDealerWithProvinces[];
      error?: string;
    };
    if (res.ok && data.dealers) setDealers(data.dealers);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void syncList();
  }, [syncList]);

  /**
   * Hangi il başka bayilerde kullanılıyor → o il select içinde "disabled" görünsün
   * (düzenleme modundaysa, kendi bayisindeki iller disabled olmasın).
   */
  const usedProvinceIdToDealerName = useMemo(() => {
    const map = new Map<number, string>();
    for (const d of dealers) {
      if (modalMode === "edit" && d.id === editingId) continue;
      for (const p of d.provinces) map.set(p.id, d.name);
    }
    return map;
  }, [dealers, editingId, modalMode]);

  const provinceOptions: SearchableOption[] = useMemo(
    () =>
      provinces.map((p) => {
        const usedBy = usedProvinceIdToDealerName.get(p.id);
        return {
          value: p.id,
          label: p.name,
          code: p.code,
          disabled: Boolean(usedBy),
          disabledReason: usedBy ? `${usedBy} bayisinde kayıtlı` : undefined,
        };
      }),
    [provinces, usedProvinceIdToDealerName],
  );

  const closeModal = () => setModalOpen(false);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setSortOrder(0);
    setName("");
    setProvinceIds([]);
    setColor(randomVivid());
    setContactPerson("");
    setPhone("");
    setWebsite("");
    setModalOpen(true);
  };

  const openEdit = (d: AuthorizedDealerWithProvinces) => {
    setModalMode("edit");
    setEditingId(d.id);
    setSortOrder(d.sortOrder);
    setName(d.name);
    setProvinceIds(d.provinces.map((p) => p.id));
    setColor((d.color || "#5B8DEF").toUpperCase());
    setContactPerson(d.contactPerson ?? "");
    setPhone(d.phone);
    setWebsite(d.website ?? "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (provinceIds.length === 0) {
      showToast("En az bir il seçin.", "error");
      return;
    }
    setSaving(true);
    try {
      const body = {
        sortOrder,
        name: name.trim(),
        provinceIds,
        color,
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

  const handleDelete = async (d: AuthorizedDealerWithProvinces) => {
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
              <th aria-label="Renk" />
              <th>Bayi</th>
              <th>İller</th>
              <th>Telefon</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {dealers.map((d) => {
              const regionLabel = d.provinces.length > 0
                ? d.provinces.map((p) => p.name).join(", ")
                : d.serviceRegion;
              const truncated =
                regionLabel.length > 48 ? `${regionLabel.slice(0, 48)}…` : regionLabel;
              return (
                <tr key={d.id}>
                  <td>{d.sortOrder}</td>
                  <td>
                    <span
                      className="admin-color-dot"
                      style={{ background: d.color || "#5B8DEF" }}
                      title={d.color || "#5B8DEF"}
                    />
                  </td>
                  <td>{d.name}</td>
                  <td>
                    <span className="admin-table-ellipsis" title={regionLabel}>
                      {d.provinces.length > 0 ? (
                        <>
                          <span className="admin-province-count">{d.provinces.length} il</span>{" "}
                          <span className="admin-province-preview">{truncated}</span>
                        </>
                      ) : (
                        truncated || "—"
                      )}
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
              );
            })}
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

                  <div className="admin-field admin-field--full">
                    <span>Sorumlu iller</span>
                    <SearchableMultiSelect
                      options={provinceOptions}
                      value={provinceIds}
                      onChange={(next) => setProvinceIds(next.map((v) => Number(v)))}
                      placeholder="İl seçin (örn. İstanbul, Ankara…)"
                      searchPlaceholder="İl veya plaka ara…"
                      emptyText="Eşleşen il yok"
                    />
                    <p className="admin-field__help">
                      Bir il yalnızca tek bir bayide kayıtlı olabilir. Diğer bayilerde kullanılan
                      iller listede pasif görünür.
                    </p>
                  </div>

                  <div className="admin-field admin-field--full">
                    <span>Harita rengi</span>
                    <ColorInput value={color} onChange={setColor} />
                    <p className="admin-field__help">
                      Türkiye haritasında bu bayinin illeri seçilen renkle boyanır.
                    </p>
                  </div>

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
