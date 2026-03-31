"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Category } from "@/db/schema/category";
import { MAX_ADMIN_IMAGE_UPLOAD_MB } from "@/lib/admin-image-upload";
import { AdminCropImageField } from "./admin-crop-image-field";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";

type Props = {
  initialCategories: Category[];
};

async function uploadCategoryImage(file: File, slug: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  const res = await fetch("/api/admin/categories/upload-image", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Görsel yüklenemedi.");
  }
  if (!data.url) {
    throw new Error("Görsel yüklenemedi.");
  }
  return data.url;
}

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

export function AdminCategoriesManager({ initialCategories }: Props) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [toast, setToast] = useState<AdminToastState>(null);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  /** Boş string = kök kategori; sayı string = üst kategori id */
  const [parentIdDraft, setParentIdDraft] = useState("");
  /** HTTPS veya blob: önizleme */
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const initialStoredImageRef = useRef<string | null>(null);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const syncList = useCallback(async () => {
    const res = await fetch("/api/admin/categories", { credentials: "include" });
    const data = (await res.json()) as { categories?: Category[]; error?: string };
    if (res.ok && data.categories) setCategories(data.categories);
  }, []);

  const roots = useMemo(
    () =>
      categories
        .filter((c) => c.parentId == null)
        .sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [categories],
  );

  const byId = useMemo(() => {
    const m = new Map<number, Category>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const editing = editingId != null ? byId.get(editingId) : undefined;
  const editingHasChildren =
    editingId != null && categories.some((c) => c.parentId === editingId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void syncList();
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
    setNameDraft("");
    setParentIdDraft("");
    resetImageFields();
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setModalMode("edit");
    setEditingId(c.id);
    setNameDraft(c.name);
    setParentIdDraft(c.parentId == null ? "" : String(c.parentId));
    setImagePreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return c.imageUrl?.trim() ?? "";
    });
    setImageFile(null);
    initialStoredImageRef.current = c.imageUrl?.trim() || null;
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setNameDraft("");
    setParentIdDraft("");
    resetImageFields();
  };

  const parseParentId = (): number | null => {
    if (parentIdDraft === "") return null;
    const n = Number(parentIdDraft);
    return Number.isFinite(n) ? n : null;
  };

  const handleSave = async () => {
    const name = nameDraft.trim();
    if (!name) {
      showToast("Kategori adı zorunludur.", "error");
      return;
    }
    const parentId = parseParentId();
    if (parentId != null && roots.every((r) => r.id !== parentId)) {
      showToast("Geçersiz üst kategori.", "error");
      return;
    }

    setSaving(true);
    try {
      const storedInitial = initialStoredImageRef.current;
      const clearingImage =
        !imageFile && !imagePreview.trim() && Boolean(storedInitial);

      if (modalMode === "create") {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            ...(parentId == null ? {} : { parentId }),
          }),
        });
        const data = (await res.json()) as { category?: Category; error?: string };
        if (!res.ok || !data.category) {
          showToast(formatApiError(data, "Kategori oluşturulamadı."), "error");
          return;
        }
        let created = data.category;
        if (imageFile) {
          try {
            const url = await uploadCategoryImage(imageFile, created.slug);
            const putRes = await fetch(`/api/admin/categories/${created.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ imageUrl: url }),
            });
            const putData = await putRes.json();
            if (!putRes.ok) {
              showToast(
                formatApiError(
                  putData,
                  "Kategori oluştu ancak görsel kaydedilemedi — düzenleyerek tekrar yükleyin.",
                ),
                "error",
              );
              await syncList();
              closeModal();
              return;
            }
            created = (putData as { category?: Category }).category ?? created;
          } catch (e) {
            showToast(
              e instanceof Error ? e.message : "Görsel yüklenemedi.",
              "error",
            );
            await syncList();
            closeModal();
            return;
          }
        }
        showToast(
          parentId == null ? "Üst düzey kategori eklendi." : "Alt kategori eklendi.",
          "success",
        );
      } else if (editingId != null) {
        const isRootWithChildren = editing?.parentId == null && editingHasChildren;
        const body: {
          name: string;
          parentId?: number | null;
          imageUrl?: string | null;
        } = { name };

        if (!isRootWithChildren) {
          body.parentId = parentId;
        }

        if (!imageFile && clearingImage) {
          body.imageUrl = null;
        }
        /* Yeni dosya: ilk PUT’ta imageUrl yok; yükleme sonrası slug ile ikinci PUT */

        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(body),
        });
        const data = (await res.json()) as { category?: Category; error?: string };
        if (!res.ok || !data.category) {
          showToast(formatApiError(data, "Kategori güncellenemedi."), "error");
          return;
        }
        let updated = data.category;
        if (imageFile) {
          try {
            const url = await uploadCategoryImage(imageFile, updated.slug);
            const putRes = await fetch(`/api/admin/categories/${editingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ imageUrl: url }),
            });
            const putData = await putRes.json();
            if (!putRes.ok) {
              showToast(
                formatApiError(putData, "Kayıt güncellendi ancak görsel yüklenemedi."),
                "error",
              );
              await syncList();
              closeModal();
              return;
            }
            updated = (putData as { category?: Category }).category ?? updated;
          } catch (e) {
            showToast(
              e instanceof Error ? e.message : "Görsel yüklenemedi.",
              "error",
            );
            await syncList();
            closeModal();
            return;
          }
        }
        showToast("Kategori güncellendi.", "success");
      }
      closeModal();
      await syncList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (c: Category) => {
    const hint =
      c.parentId == null
        ? "Alt kategorisi veya ürün bağlantısı varsa silinmez."
        : "Ürün bağlantısı varsa silinmez.";
    if (!window.confirm(`“${c.name}” silinsin mi? ${hint}`)) return;
    const res = await fetch(`/api/admin/categories/${c.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(formatApiError(data, "Silinemedi."), "error");
      return;
    }
    showToast("Kategori silindi.", "success");
    await syncList();
  };

  const showParentSelect =
    modalMode === "create" ||
    (modalMode === "edit" &&
      editing &&
      !(editing.parentId == null && editingHasChildren));

  return (
    <>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-egitimler-toolbar">
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreate}>
          Yeni kategori
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void syncList()}>
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{categories.length}</strong> kayıt ·{" "}
        <strong>{roots.length}</strong> üst düzey,{" "}
        <strong>{categories.length - roots.length}</strong> alt kategori
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th aria-label="Önizleme" />
              <th>Tür</th>
              <th>Üst kategori</th>
              <th>Ad</th>
              <th>Slug</th>
              <th>Oluşturulma</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const isChild = c.parentId != null;
              const parentName =
                c.parentId != null ? byId.get(c.parentId)?.name ?? "—" : "—";
              return (
                <tr key={c.id}>
                  <td style={{ width: 56 }}>
                    {c.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.imageUrl}
                        alt=""
                        width={44}
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
                  <td>
                    {isChild ? (
                      <span className="admin-code">Alt kategori</span>
                    ) : (
                      <span className="admin-code">Üst kategori</span>
                    )}
                  </td>
                  <td>{parentName}</td>
                  <td>
                    {isChild ? (
                      <span style={{ paddingLeft: "0.5rem" }}>{c.name}</span>
                    ) : (
                      c.name
                    )}
                  </td>
                  <td>
                    <code className="admin-code">{c.slug}</code>
                  </td>
                  <td>
                    {new Date(c.createdAt).toLocaleString("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
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
                className="admin-mini-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-cat-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-mini-modal__head">
                  <h2 id="admin-cat-modal-title" className="admin-mini-modal__title">
                    {modalMode === "create"
                      ? "Yeni kategori"
                      : "Kategoriyi düzenle"}
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
                  {showParentSelect ? (
                    <label className="admin-field admin-field--full">
                      <span>Üst kategori</span>
                      <select
                        value={parentIdDraft}
                        onChange={(e) => setParentIdDraft(e.target.value)}
                      >
                        <option value="">— Üst düzey (kök kategori) —</option>
                        {roots
                          .filter((r) =>
                            modalMode === "edit" && editingId != null ? r.id !== editingId : true,
                          )
                          .map((r) => (
                            <option key={r.id} value={String(r.id)}>
                              {r.name}
                            </option>
                          ))}
                      </select>
                      <p className="admin-field__help" style={{ marginTop: 4 }}>
                        Boş bırakırsanız bu bir <strong>üst kategori</strong> olur. Bir üst
                        seçerseniz <strong>alt kategori</strong> oluşur (tek seviye).
                      </p>
                    </label>
                  ) : (
                    <p className="admin-field__help">
                      Bu üst kategorinin alt kategorileri var; üst bağlantısı değiştirilemez.
                      Yalnızca adı güncelleyebilirsiniz.
                    </p>
                  )}

                  <label className="admin-field admin-field--full">
                    <span>Kategori adı</span>
                    <input
                      value={nameDraft}
                      onChange={(e) => setNameDraft(e.target.value)}
                      placeholder="Örn. İmplant sistemleri"
                      maxLength={120}
                      autoFocus
                    />
                  </label>
                  <AdminCropImageField
                    label="Kategori görseli (opsiyonel)"
                    help={`Kare kırpma. CDN: Categories/{slug}/image.webp (üzerine yazar). En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
                    value={imagePreview}
                    aspect={1}
                    thumbClass="admin-training-image-field__thumb--category"
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
                  <p className="admin-field__help" style={{ marginTop: 0 }}>
                    Slug otomatik oluşturulur; isimden türetilir ve benzersiz kalır.
                  </p>
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
