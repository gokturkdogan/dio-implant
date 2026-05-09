"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SiteCatalog } from "@/db/schema/site-catalog";
import { MAX_ADMIN_IMAGE_UPLOAD_MB } from "@/lib/admin-image-upload";
import { AdminCropImageField } from "./admin-crop-image-field";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  initialCatalogs: SiteCatalog[];
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

async function uploadCatalogCoverImage(file: File, catalogId: number): Promise<void> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("catalogId", String(catalogId));
  const res = await fetch("/api/admin/site-catalogs/upload-image", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = (await res.json()) as { error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Kapak yüklenemedi.");
  }
}

export function AdminSiteCatalogsManager({ initialCatalogs }: Props) {
  const { showToast } = useAdminToast();
  const [catalogs, setCatalogs] = useState<SiteCatalog[]>(initialCatalogs);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [title, setTitle] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  /** HTTPS veya blob: önizleme (kategori akışı ile aynı) */
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const initialStoredImageRef = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);

  const syncList = useCallback(
    async (opts?: { quiet?: boolean }) => {
      const res = await fetch("/api/admin/site-catalogs", { credentials: "include" });
      const data = (await res.json()) as { catalogs?: SiteCatalog[]; error?: string };
      if (res.ok && data.catalogs) {
        setCatalogs(data.catalogs);
        if (!opts?.quiet) showToast("Liste güncellendi.", "success");
      } else if (!opts?.quiet) {
        showToast(formatApiError(data, "Liste yüklenemedi."), "error");
      }
    },
    [showToast],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void syncList({ quiet: true });
  }, [syncList]);

  const resetImageFields = useCallback(() => {
    setImagePreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
    setImageFile(null);
    initialStoredImageRef.current = null;
  }, []);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setSortOrder(0);
    setTitle("");
    setPdfUrl("");
    resetImageFields();
    setModalOpen(true);
  };

  const openEdit = (c: SiteCatalog) => {
    setModalMode("edit");
    setEditingId(c.id);
    setSortOrder(c.sortOrder);
    setTitle(c.title);
    setPdfUrl(c.pdfUrl);
    setImagePreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return c.coverImageUrl?.trim() ?? "";
    });
    setImageFile(null);
    initialStoredImageRef.current = c.coverImageUrl?.trim() || null;
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setTitle("");
    setPdfUrl("");
    setSortOrder(0);
    resetImageFields();
  };

  const handleSave = async () => {
    const t = title.trim();
    const p = pdfUrl.trim();
    if (!t) {
      showToast("Başlık zorunludur.", "error");
      return;
    }
    if (!p) {
      showToast("PDF URL zorunludur.", "error");
      return;
    }

    const storedInitial = initialStoredImageRef.current;
    const clearingImage = !imageFile && !imagePreview.trim() && Boolean(storedInitial);

    setSaving(true);
    try {
      const body = { sortOrder, title: t, pdfUrl: p };

      if (modalMode === "create") {
        const res = await fetch("/api/admin/site-catalogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { catalog?: SiteCatalog; error?: string };
        if (!res.ok || !data.catalog) {
          showToast(formatApiError(data, "Katalog eklenemedi."), "error");
          return;
        }
        let created = data.catalog;
        if (imageFile) {
          try {
            await uploadCatalogCoverImage(imageFile, created.id);
          } catch (e) {
            showToast(
              e instanceof Error ? e.message : "Kapak yüklenemedi.",
              "error",
            );
            await syncList();
            closeModal();
            return;
          }
        }
        showToast("Katalog eklendi.", "success");
      } else if (editingId != null) {
        if (clearingImage) {
          const delRes = await fetch(`/api/admin/site-catalogs/${editingId}/cover`, {
            method: "DELETE",
            credentials: "include",
          });
          const delData = await delRes.json();
          if (!delRes.ok) {
            showToast(formatApiError(delData, "Kapak kaldırılamadı."), "error");
            return;
          }
          initialStoredImageRef.current = null;
        }

        const res = await fetch(`/api/admin/site-catalogs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) {
          showToast(formatApiError(data, "Katalog güncellenemedi."), "error");
          return;
        }
        if (imageFile) {
          try {
            await uploadCatalogCoverImage(imageFile, editingId);
          } catch (e) {
            showToast(
              e instanceof Error ? e.message : "Kapak yüklenemedi.",
              "error",
            );
            await syncList();
            closeModal();
            return;
          }
        }
        showToast("Katalog güncellendi.", "success");
      }

      closeModal();
      await syncList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: SiteCatalog) => {
    if (!window.confirm(`“${c.title}” silinsin mi?`)) return;
    const res = await fetch(`/api/admin/site-catalogs/${c.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(formatApiError(data, "Silinemedi."), "error");
      return;
    }
    showToast("Katalog silindi.", "success");
    await syncList();
  };

  return (
    <>
      <div className="admin-egitimler-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Yeni katalog
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void syncList()}>
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{catalogs.length}</strong> katalog kaydı ·{" "}
        <code className="admin-code">site_catalogs</code> · Cloudinary{" "}
        <code className="admin-code">Catalogs/{"{baslik-slug}"}-{"{id}"}/cover.webp</code>
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th aria-label="Önizleme" />
              <th>Sıra</th>
              <th>Başlık</th>
              <th>PDF URL</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {catalogs.map((c) => (
              <tr key={c.id}>
                <td style={{ width: 56 }}>
                  {c.coverImageUrl?.trim() ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.coverImageUrl.trim()}
                      alt=""
                      width={31}
                      height={44}
                      style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid var(--admin-stroke)",
                        display: "block",
                      }}
                    />
                  ) : (
                    <span className="admin-muted" style={{ fontSize: 11 }}>
                      —
                    </span>
                  )}
                </td>
                <td>{c.sortOrder}</td>
                <td>{c.title}</td>
                <td>
                  <span className="admin-table-ellipsis" title={c.pdfUrl}>
                    {c.pdfUrl.length > 48 ? `${c.pdfUrl.slice(0, 48)}…` : c.pdfUrl}
                  </span>
                </td>
                <td className="admin-table-actions">
                  <button
                    type="button"
                    className="admin-table-action-btn"
                    onClick={() => openEdit(c)}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className="admin-table-action-btn admin-table-action-btn--danger"
                    onClick={() => void handleDelete(c)}
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
                className="admin-mini-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-catalog-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-mini-modal__head">
                  <h2 id="admin-catalog-modal-title" className="admin-mini-modal__title">
                    {modalMode === "create" ? "Yeni katalog" : "Kataloğu düzenle"}
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
                    e.stopPropagation();
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
                    <span>Başlık</span>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn. İmplant sistemleri kataloğu 2025"
                      maxLength={200}
                      autoFocus
                    />
                  </label>
                  <label className="admin-field admin-field--full">
                    <span>PDF URL</span>
                    <textarea
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                      placeholder="https://… (doğrudan PDF bağlantısı)"
                      rows={3}
                      maxLength={2048}
                    />
                  </label>
                  <AdminCropImageField
                    label="Kapak görseli (opsiyonel)"
                    help={`A4 dikey oranı (210:297). CDN: Catalogs/{baslik-slug}-{id}/cover.webp (üzerine yazar). En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
                    value={imagePreview}
                    aspect={210 / 297}
                    thumbClass="admin-training-image-field__thumb--catalog-a4"
                    onChange={(url) =>
                      setImagePreview((prev) => {
                        if (prev.startsWith("blob:") && prev !== url) {
                          URL.revokeObjectURL(prev);
                        }
                        return url;
                      })
                    }
                    onFileChange={setImageFile}
                  />
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
