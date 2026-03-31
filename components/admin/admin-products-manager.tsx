"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import type { Category } from "@/db/schema/category";
import type { Product } from "@/db/schema/product";
import { MAX_ADMIN_IMAGE_UPLOAD_MB } from "@/lib/admin-image-upload";
import { AdminCropImageField } from "./admin-crop-image-field";
import { AdminToast, type AdminToastState, type AdminToastVariant } from "./admin-toast";

type Props = {
  initialProducts: Product[];
  initialCategories: Category[];
};

type PosterSlot = {
  id: string;
  title: string;
  preview: string;
  file: File | null;
  remoteUrl: string | null;
};

type CarouselSlot = {
  id: string;
  preview: string;
  file: File | null;
  remoteUrl: string | null;
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

function buildCategorySelectOptions(cats: Category[]) {
  const roots = cats
    .filter((c) => c.parentId == null)
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const children = cats.filter((c) => c.parentId != null);
  const out: { id: number; label: string }[] = [];
  const seen = new Set<number>();

  for (const r of roots) {
    out.push({ id: r.id, label: r.name });
    seen.add(r.id);
    children
      .filter((c) => c.parentId === r.id)
      .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      .forEach((c) => {
        out.push({ id: c.id, label: `↳ ${c.name}` });
        seen.add(c.id);
      });
  }

  for (const c of cats) {
    if (!seen.has(c.id)) {
      out.push({ id: c.id, label: c.name });
    }
  }
  return out;
}

function truncate(s: string, max: number): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

async function uploadProductImage(
  file: File,
  slug: string,
  kind: "main" | "poster" | "carousel",
  posterIndex?: number,
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  fd.append("kind", kind);
  if ((kind === "poster" || kind === "carousel") && posterIndex !== undefined) {
    fd.append("index", String(posterIndex));
  }
  const res = await fetch("/api/admin/products/upload-image", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Görsel yüklenemedi.");
  }
  if (!data.url) throw new Error("Görsel yüklenemedi.");
  return data.url;
}

function newPosterSlot(): PosterSlot {
  return {
    id: crypto.randomUUID(),
    title: "",
    preview: "",
    file: null,
    remoteUrl: null,
  };
}

function newCarouselSlot(): CarouselSlot {
  return {
    id: crypto.randomUUID(),
    preview: "",
    file: null,
    remoteUrl: null,
  };
}

/** API / DB’de eski düz string[] veya eksik alanlı kayıtlar için */
function posterSlotFromStored(item: unknown, idx: number): PosterSlot {
  if (typeof item === "string") {
    const url = item.trim();
    return {
      id: crypto.randomUUID(),
      title: `Afiş ${idx + 1}`,
      preview: url,
      file: null,
      remoteUrl: url ? url : null,
    };
  }
  if (item && typeof item === "object") {
    const rec = item as { title?: unknown; url?: unknown };
    const url = String(rec.url ?? "").trim();
    const titleRaw = String(rec.title ?? "").trim();
    const title = titleRaw || `Afiş ${idx + 1}`;
    return {
      id: crypto.randomUUID(),
      title,
      preview: url,
      file: null,
      remoteUrl: url ? url : null,
    };
  }
  return newPosterSlot();
}

export function AdminProductsManager({ initialProducts, initialCategories }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [toast, setToast] = useState<AdminToastState>(null);
  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [nameDraft, setNameDraft] = useState("");
  const [categoryIdDraft, setCategoryIdDraft] = useState("");
  const [excerptDraft, setExcerptDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [carouselSlots, setCarouselSlots] = useState<CarouselSlot[]>([]);
  const [mainPreview, setMainPreview] = useState("");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const initialMainRef = useRef<string | null>(null);
  const [posterSlots, setPosterSlots] = useState<PosterSlot[]>([]);
  const [saving, setSaving] = useState(false);

  const showToast = useCallback((message: string, variant: AdminToastVariant) => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const categoryOptions = useMemo(
    () => buildCategorySelectOptions(categories),
    [categories],
  );

  const byCategoryId = useMemo(() => {
    const m = new Map<number, Category>();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const syncList = useCallback(async () => {
    const [pr, cat] = await Promise.all([
      fetch("/api/admin/products", { credentials: "include" }),
      fetch("/api/admin/categories", { credentials: "include" }),
    ]);
    const pData = (await pr.json()) as { products?: Product[]; error?: string };
    const cData = (await cat.json()) as { categories?: Category[]; error?: string };
    if (pr.ok && pData.products) setProducts(pData.products);
    if (cat.ok && cData.categories) setCategories(cData.categories);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    void syncList();
  }, [syncList]);

  const defaultCategoryId = categoryOptions[0]?.id;

  const resetImageState = useCallback(() => {
    setMainPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
    setMainFile(null);
    initialMainRef.current = null;
    setPosterSlots([]);
  }, []);

  const openCreate = () => {
    setModalMode("create");
    setEditingId(null);
    setNameDraft("");
    setCategoryIdDraft(defaultCategoryId != null ? String(defaultCategoryId) : "");
    setExcerptDraft("");
    setDescriptionDraft("");
    setCarouselSlots([]);
    resetImageState();
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setModalMode("edit");
    setEditingId(p.id);
    setNameDraft(p.name);
    setCategoryIdDraft(String(p.categoryId));
    setExcerptDraft(p.excerpt ?? "");
    setDescriptionDraft(p.description ?? "");
    setCarouselSlots(
      Array.isArray(p.carouselImages)
        ? p.carouselImages
            .slice(0, 3)
            .map((url) => ({
              id: crypto.randomUUID(),
              preview: String(url ?? "").trim(),
              file: null,
              remoteUrl: String(url ?? "").trim() || null,
            }))
            .filter((s) => s.preview.length > 0)
        : [],
    );
    setMainPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return p.imageUrl?.trim() ?? "";
    });
    setMainFile(null);
    initialMainRef.current = p.imageUrl?.trim() || null;
    setPosterSlots(
      (p.posterUrls ?? [])
        .map(posterSlotFromStored)
        .filter((s) => (s.preview ?? "").trim() !== "" || (s.remoteUrl ?? "").trim() !== ""),
    );
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setMainPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return "";
    });
    setMainFile(null);
    setCarouselSlots((slots) => {
      slots.forEach((s) => {
        const pv = s.preview ?? "";
        if (pv.startsWith("blob:")) URL.revokeObjectURL(pv);
      });
      return [];
    });
    setPosterSlots((slots) => {
      slots.forEach((s) => {
        const pv = s.preview ?? "";
        if (pv.startsWith("blob:")) URL.revokeObjectURL(pv);
      });
      return [];
    });
    initialMainRef.current = null;
  };

  const addPosterRow = () => {
    if (posterSlots.length >= 40) return;
    setPosterSlots((s) => [...s, newPosterSlot()]);
  };

  const removePosterRow = (id: string) => {
    setPosterSlots((rows) => {
      const row = rows.find((r) => r.id === id);
      const pv = row?.preview ?? "";
      if (pv.startsWith("blob:")) URL.revokeObjectURL(pv);
      return rows.filter((r) => r.id !== id);
    });
  };

  const buildPosterUrlsAfterUploads = async (
    slug: string,
    slots: PosterSlot[],
  ): Promise<Array<{ title: string; url: string }>> => {
    const out: Array<{ title: string; url: string }> = [];
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      const title = s.title.trim() || `Afiş ${i + 1}`;
      if (s.file) {
        out.push({
          title,
          url: await uploadProductImage(s.file, slug, "poster", i),
        });
      } else if (s.remoteUrl) {
        out.push({ title, url: s.remoteUrl });
      }
    }
    return out;
  };

  const buildCarouselUrlsAfterUploads = async (
    slug: string,
    slots: CarouselSlot[],
  ): Promise<string[]> => {
    const out: string[] = [];
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (s.file) {
        out.push(await uploadProductImage(s.file, slug, "carousel", i));
      } else if (s.remoteUrl) {
        out.push(s.remoteUrl);
      }
    }
    return out.slice(0, 3);
  };

  const handleSave = async () => {
    const name = nameDraft.trim();
    if (!name) {
      showToast("Ürün adı zorunludur.", "error");
      return;
    }
    const catId = Number(categoryIdDraft);
    if (!Number.isFinite(catId) || catId < 1) {
      showToast("Kategori seçin.", "error");
      return;
    }

    const storedMain = initialMainRef.current;
    const mainCleared = !mainFile && !mainPreview.trim() && Boolean(storedMain);
    const mainTouched = Boolean(mainFile) || mainCleared;
    const currentEditing = products.find((x) => x.id === editingId);
    const existingPosters = currentEditing?.posterUrls ?? [];
    const existingCarousel = currentEditing?.carouselImages ?? [];

    const posterTouched =
      modalMode === "create"
        ? posterSlots.some((s) => s.file)
        : posterSlots.some((s) => s.file) ||
          posterSlots.length !== existingPosters.length ||
          posterSlots.some((slot, idx) => {
            const old = existingPosters[idx];
            if (!old) return true;
            const newTitle = slot.title.trim() || `Afiş ${idx + 1}`;
            const newUrl = slot.remoteUrl ?? "";
            return old.title !== newTitle || old.url !== newUrl;
          });

    const carouselTouched =
      modalMode === "create"
        ? carouselSlots.some((s) => s.file)
        : carouselSlots.some((s) => s.file) ||
          carouselSlots.length !== existingCarousel.length ||
          carouselSlots.some((slot, idx) => {
            const old = String(existingCarousel[idx] ?? "");
            const next = slot.remoteUrl ?? "";
            return old !== next;
          });

    setSaving(true);
    try {
      if (modalMode === "create") {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            categoryId: catId,
            excerpt: excerptDraft.trim() || undefined,
            description: descriptionDraft.trim() || undefined,
            carouselImages: [],
            posterUrls: [],
          }),
        });
        const data = (await res.json()) as { product?: Product; error?: string };
        if (!res.ok || !data.product) {
          showToast(formatApiError(data, "Ürün oluşturulamadı."), "error");
          return;
        }
        let created = data.product;
        const slug = created.slug;

        try {
          if (mainFile) {
            const url = await uploadProductImage(mainFile, slug, "main");
            const putRes = await fetch(`/api/admin/products/${created.id}`, {
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
                  "Ürün oluştu ancak ana görsel kaydedilemedi.",
                ),
                "error",
              );
              await syncList();
              closeModal();
              return;
            }
            created = (putData as { product?: Product }).product ?? created;
          }

          const posterUrls = await buildPosterUrlsAfterUploads(slug, posterSlots);
          if (posterUrls.length > 0) {
            const putRes = await fetch(`/api/admin/products/${created.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ posterUrls }),
            });
            const putData = await putRes.json();
            if (!putRes.ok) {
              showToast(
                formatApiError(putData, "Afiş görselleri kaydedilemedi."),
                "error",
              );
              await syncList();
              closeModal();
              return;
            }
          }

          const carouselImages = await buildCarouselUrlsAfterUploads(slug, carouselSlots);
          if (carouselImages.length > 0) {
            const putRes = await fetch(`/api/admin/products/${created.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ carouselImages }),
            });
            const putData = await putRes.json();
            if (!putRes.ok) {
              showToast(
                formatApiError(putData, "Carousel görselleri kaydedilemedi."),
                "error",
              );
              await syncList();
              closeModal();
              return;
            }
          }
        } catch (e) {
          showToast(e instanceof Error ? e.message : "Görsel yüklenemedi.", "error");
          await syncList();
          closeModal();
          return;
        }

        showToast("Ürün eklendi.", "success");
      } else if (editingId != null) {
        const hasDeferredImage = mainTouched || posterTouched || carouselTouched;

        const coreBody = {
          name,
          categoryId: catId,
          excerpt: excerptDraft.trim() || null,
          description: descriptionDraft.trim() || null,
          carouselImages: carouselSlots
            .map((s) => (s.remoteUrl ?? "").trim())
            .filter(Boolean)
            .slice(0, 3),
        };

        const imagePosterPayload: {
          imageUrl?: string | null;
          posterUrls?: Array<{ title: string; url: string }>;
        } = {};

        if (!hasDeferredImage) {
          imagePosterPayload.imageUrl =
            mainPreview.trim() === "" ? null : mainPreview.trim();
          imagePosterPayload.posterUrls = posterSlots
            .map((s, idx) =>
              s.remoteUrl
                ? { title: s.title.trim() || `Afiş ${idx + 1}`, url: s.remoteUrl }
                : null,
            )
            .filter((u): u is { title: string; url: string } => Boolean(u));
        }

        const res = await fetch(`/api/admin/products/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            ...coreBody,
            ...(hasDeferredImage ? {} : imagePosterPayload),
          }),
        });
        const data = (await res.json()) as { product?: Product; error?: string };
        if (!res.ok || !data.product) {
          showToast(formatApiError(data, "Ürün güncellenemedi."), "error");
          return;
        }

        let updated = data.product;
        const slug = updated.slug;

        if (hasDeferredImage) {
          try {
            if (mainFile) {
              const url = await uploadProductImage(mainFile, slug, "main");
              const putRes = await fetch(`/api/admin/products/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ imageUrl: url }),
              });
              const putData = await putRes.json();
              if (!putRes.ok) {
                showToast(formatApiError(putData, "Ana görsel yüklenemedi."), "error");
                await syncList();
                closeModal();
                return;
              }
              updated = (putData as { product?: Product }).product ?? updated;
            } else if (mainCleared) {
              const putRes = await fetch(`/api/admin/products/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ imageUrl: null }),
              });
              if (!putRes.ok) {
                const putData = await putRes.json();
                showToast(formatApiError(putData, "Ana görsel kaldırılamadı."), "error");
                await syncList();
                closeModal();
                return;
              }
            }

            if (posterTouched) {
              const posterUrls = await buildPosterUrlsAfterUploads(slug, posterSlots);
              const putRes = await fetch(`/api/admin/products/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ posterUrls }),
              });
              const putData = await putRes.json();
              if (!putRes.ok) {
                showToast(formatApiError(putData, "Afişler güncellenemedi."), "error");
                await syncList();
                closeModal();
                return;
              }
              updated = (putData as { product?: Product }).product ?? updated;
            }

            if (carouselTouched) {
              const carouselImages = await buildCarouselUrlsAfterUploads(slug, carouselSlots);
              const putRes = await fetch(`/api/admin/products/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ carouselImages }),
              });
              const putData = await putRes.json();
              if (!putRes.ok) {
                showToast(
                  formatApiError(putData, "Carousel görselleri güncellenemedi."),
                  "error",
                );
                await syncList();
                closeModal();
                return;
              }
              updated = (putData as { product?: Product }).product ?? updated;
            }
          } catch (e) {
            showToast(e instanceof Error ? e.message : "Görsel yüklenemedi.", "error");
            await syncList();
            closeModal();
            return;
          }
        }

        showToast("Ürün güncellendi.", "success");
      }
      closeModal();
      await syncList();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`“${p.name}” silinsin mi? Bu işlem geri alınamaz.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(formatApiError(data, "Silinemedi."), "error");
      return;
    }
    showToast("Ürün silindi.", "success");
    await syncList();
  };

  const editingSlug =
    editingId != null ? products.find((x) => x.id === editingId)?.slug : undefined;

  return (
    <>
      <AdminToast toast={toast} onClose={() => setToast(null)} />

      <div className="admin-egitimler-toolbar">
        <Link href="/admin-panel/urunler/yeni" className="admin-btn admin-btn--primary">
          Yeni ürün
        </Link>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void syncList()}>
          Listeyi yenile
        </button>
      </div>

      <p className="admin-egitimler-count">
        Toplam <strong>{products.length}</strong> ürün
      </p>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th aria-label="Önizleme" />
              <th>Ad</th>
              <th>Slug</th>
              <th>Kategori</th>
              <th>Özet</th>
              <th>Afiş</th>
              <th>Oluşturulma</th>
              <th aria-label="İşlemler" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const cat = byCategoryId.get(p.categoryId);
              const posterCount = (p.posterUrls ?? []).length;
              return (
                <tr key={p.id}>
                  <td style={{ width: 56 }}>
                    {p.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.imageUrl}
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
                  <td>{p.name}</td>
                  <td>
                    <code className="admin-code">{p.slug}</code>
                  </td>
                  <td>{cat?.name ?? "—"}</td>
                  <td>
                    <span className="admin-muted" title={p.excerpt ?? ""}>
                      {p.excerpt ? truncate(p.excerpt, 48) : "—"}
                    </span>
                  </td>
                  <td>{posterCount > 0 ? `${posterCount} görsel` : "—"}</td>
                  <td>
                    {new Date(p.createdAt).toLocaleString("tr-TR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="admin-table-actions">
                    <Link
                      href={`/admin-panel/urunler/duzenle/${p.id}`}
                      className="admin-table-action-btn"
                    >
                      Düzenle
                    </Link>
                    <button
                      type="button"
                      className="admin-table-action-btn admin-table-action-btn--danger"
                      onClick={() => void handleDelete(p)}
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
              className="admin-modal-backdrop"
              role="presentation"
              onClick={closeModal}
            >
              <div
                className="admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-product-modal-title"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="admin-modal__head">
                  <h2 id="admin-product-modal-title" className="admin-modal__title">
                    {modalMode === "create" ? "Yeni ürün" : "Ürünü düzenle"}
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
                  className="admin-modal__body"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSave();
                  }}
                >
                  {modalMode === "edit" && editingSlug ? (
                    <p className="admin-field__help" style={{ margin: 0 }}>
                      Slug: <code className="admin-code">{editingSlug}</code> — CDN klasörü{" "}
                      <code className="admin-code">Products/{editingSlug}</code>
                    </p>
                  ) : null}

                  <div className="admin-modal__grid">
                    <label className="admin-field">
                      <span>Ürün adı</span>
                      <input
                        value={nameDraft}
                        onChange={(e) => setNameDraft(e.target.value)}
                        placeholder="Örn. DIO SM Torque Rachet"
                        maxLength={160}
                        autoFocus
                      />
                    </label>

                    <label className="admin-field">
                      <span>Kategori</span>
                      <select
                        value={categoryIdDraft}
                        onChange={(e) => setCategoryIdDraft(e.target.value)}
                        disabled={categoryOptions.length === 0}
                      >
                        {categoryOptions.length === 0 ? (
                          <option value="">— Önce kategori ekleyin —</option>
                        ) : null}
                        {categoryOptions.map((o) => (
                          <option key={o.id} value={String(o.id)}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-field admin-field--full">
                      <span>Liste özeti (opsiyonel)</span>
                      <textarea
                        value={excerptDraft}
                        onChange={(e) => setExcerptDraft(e.target.value)}
                        placeholder="Kısa kart / liste metni"
                        maxLength={800}
                        rows={3}
                      />
                    </label>

                    <label className="admin-field admin-field--full">
                      <span>Detay açıklama (opsiyonel)</span>
                      <textarea
                        value={descriptionDraft}
                        onChange={(e) => setDescriptionDraft(e.target.value)}
                        placeholder="Ürün sayfası için uzun metin"
                        maxLength={50_000}
                        rows={6}
                      />
                    </label>

                    <div className="admin-field admin-field--full">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          Carousel görselleri (opsiyonel, en fazla 3)
                        </span>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          onClick={() =>
                            setCarouselSlots((prev) =>
                              prev.length >= 3 ? prev : [...prev, newCarouselSlot()],
                            )
                          }
                          disabled={carouselSlots.length >= 3}
                        >
                          + Carousel satırı
                        </button>
                      </div>
                      <p className="admin-field__help" style={{ marginTop: 0 }}>
                        Kırpma + WebP. CDN: <code className="admin-code">Products/{"{slug}"}/carusel-1.webp</code> …
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {carouselSlots.length === 0 ? (
                          <p className="admin-muted" style={{ fontSize: 13, margin: 0 }}>
                            Henüz carousel görseli yok.
                          </p>
                        ) : null}
                        {carouselSlots.map((slot, idx) => (
                          <div
                            key={slot.id}
                            style={{
                              border: "1px solid var(--admin-stroke)",
                              borderRadius: "var(--admin-radius-md)",
                              padding: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <span className="admin-muted" style={{ fontSize: 12 }}>
                                Carousel {idx + 1}
                              </span>
                            </div>
                            <AdminCropImageField
                              label=""
                              help={`Serbest kırpma. En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
                              value={slot.preview}
                              thumbClass="admin-training-image-field__thumb--cover"
                              onChange={(url) => {
                                setCarouselSlots((rows) =>
                                  rows.map((r) => {
                                    if (r.id !== slot.id) return r;
                                    const prevPv = r.preview ?? "";
                                    if (prevPv.startsWith("blob:") && prevPv !== url) {
                                      URL.revokeObjectURL(prevPv);
                                    }
                                    return {
                                      ...r,
                                      preview: url,
                                      remoteUrl: url.startsWith("https://") ? url : null,
                                    };
                                  }),
                                );
                              }}
                              onFileChange={(file) => {
                                setCarouselSlots((rows) =>
                                  rows.map((r) =>
                                    r.id === slot.id
                                      ? { ...r, file, remoteUrl: file ? null : r.remoteUrl }
                                      : r,
                                  ),
                                );
                              }}
                            />
                            <button
                              type="button"
                              className="admin-btn admin-btn--ghost"
                              style={{ whiteSpace: "nowrap" }}
                              onClick={() =>
                                setCarouselSlots((rows) => {
                                  const row = rows.find((r) => r.id === slot.id);
                                  const pv = row?.preview ?? "";
                                  if (pv.startsWith("blob:")) URL.revokeObjectURL(pv);
                                  return rows.filter((r) => r.id !== slot.id);
                                })
                              }
                            >
                              Kaldır
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="admin-field admin-field--full">
                      <AdminCropImageField
                        label="Ana görsel (opsiyonel)"
                        help={`Products/{slug}/main.webp — serbest kırpma + WebP, en fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
                        value={mainPreview}
                        thumbClass="admin-training-image-field__thumb--category"
                        onChange={(url) =>
                          setMainPreview((prev) => {
                            if (prev.startsWith("blob:") && prev !== url) {
                              URL.revokeObjectURL(prev);
                            }
                            return url;
                          })
                        }
                        onFileChange={setMainFile}
                      />
                    </div>

                    <div className="admin-field admin-field--full">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                          Afiş görselleri (opsiyonel, en fazla 40)
                        </span>
                        <button
                          type="button"
                          className="admin-btn admin-btn--ghost"
                          onClick={addPosterRow}
                          disabled={posterSlots.length >= 40}
                        >
                          + Afiş satırı
                        </button>
                      </div>
                      <p className="admin-field__help" style={{ marginTop: 0 }}>
                        Her satır Products/{"{slug}"}/poster-1 … sırasıyla yüklenir; satır
                        kaldırınca fazla CDN dosyası silinir.
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 16,
                          maxHeight: 320,
                          overflowY: "auto",
                        }}
                      >
                        {posterSlots.length === 0 ? (
                          <p className="admin-muted" style={{ fontSize: 13, margin: 0 }}>
                            Henüz afiş yok. «+ Afiş satırı» ile ekleyin.
                          </p>
                        ) : null}
                        {posterSlots.map((slot, idx) => (
                          <div
                            key={slot.id}
                            style={{
                              border: "1px solid var(--admin-stroke)",
                              borderRadius: "var(--admin-radius-md)",
                              padding: 12,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 8,
                              }}
                            >
                              <span className="admin-muted" style={{ fontSize: 12 }}>
                                Afiş {idx + 1}
                              </span>
                              <button
                                type="button"
                                className="admin-btn admin-btn--ghost"
                                style={{ fontSize: 12, padding: "4px 10px" }}
                                onClick={() => removePosterRow(slot.id)}
                              >
                                Satırı kaldır
                              </button>
                            </div>
                            <label className="admin-field admin-field--full" style={{ marginBottom: 8 }}>
                              <span>Afiş başlığı</span>
                              <input
                                value={slot.title}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  setPosterSlots((rows) =>
                                    rows.map((r) =>
                                      r.id === slot.id ? { ...r, title: value } : r,
                                    ),
                                  );
                                }}
                                placeholder={`Afiş ${idx + 1}`}
                                maxLength={120}
                              />
                            </label>
                            <AdminCropImageField
                              label=""
                              help={`Serbest kırpma. En fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
                              value={slot.preview}
                              thumbClass="admin-training-image-field__thumb--poster"
                              onChange={(url) => {
                                setPosterSlots((rows) =>
                                  rows.map((r) => {
                                    if (r.id !== slot.id) return r;
                                    const prevPv = r.preview ?? "";
                                    if (prevPv.startsWith("blob:") && prevPv !== url) {
                                      URL.revokeObjectURL(prevPv);
                                    }
                                    return {
                                      ...r,
                                      preview: url,
                                      remoteUrl: url.startsWith("https://") ? url : null,
                                    };
                                  }),
                                );
                              }}
                              onFileChange={(file) => {
                                setPosterSlots((rows) =>
                                  rows.map((r) =>
                                    r.id === slot.id
                                      ? { ...r, file, remoteUrl: file ? null : r.remoteUrl }
                                      : r,
                                  ),
                                );
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="admin-modal__footer">
                    <button type="button" className="admin-btn admin-btn--ghost" onClick={closeModal}>
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      className="admin-btn admin-btn--primary"
                      disabled={saving || categoryOptions.length === 0}
                    >
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
