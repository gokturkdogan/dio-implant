"use client";

import { useCallback, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Category } from "@/db/schema/category";
import type { Product } from "@/db/schema/product";
import {
  MAX_ADMIN_IMAGE_UPLOAD_MB,
} from "@/lib/admin-image-upload";
import { AdminCropImageField } from "./admin-crop-image-field";
import { useAdminToast } from "./admin-toast-provider";

type Props = {
  mode: "create" | "edit";
  categories: Category[];
  initialProduct?: Product;
};

type PosterSlot = {
  id: string;
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

type SectionKey = "productInfo" | "images" | "technical";

const LIST_HREF = "/admin-panel/urunler";

function buildCategorySelectOptions(cats: Category[]) {
  const roots = cats.filter((c) => c.parentId == null).sort((a, b) => a.name.localeCompare(b.name, "tr"));
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
    if (!seen.has(c.id)) out.push({ id: c.id, label: c.name });
  }
  return out;
}

function formatApiError(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string") {
    return (data as { error: string }).error;
  }
  return fallback;
}

function newPosterSlot(): PosterSlot {
  return { id: crypto.randomUUID(), preview: "", file: null, remoteUrl: null };
}

function newCarouselSlot(): CarouselSlot {
  return { id: crypto.randomUUID(), preview: "", file: null, remoteUrl: null };
}

function posterSlotFromStored(item: unknown, _idx: number): PosterSlot {
  if (typeof item === "string") {
    const url = item.trim();
    return { id: crypto.randomUUID(), preview: url, file: null, remoteUrl: url || null };
  }
  if (item && typeof item === "object") {
    const rec = item as { url?: unknown };
    const url = String(rec.url ?? "").trim();
    return { id: crypto.randomUUID(), preview: url, file: null, remoteUrl: url || null };
  }
  return newPosterSlot();
}

async function uploadProductImage(
  file: File,
  slug: string,
  kind: "main" | "poster" | "carousel",
  index?: number,
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("slug", slug);
  fd.append("kind", kind);
  if ((kind === "poster" || kind === "carousel") && index !== undefined) {
    fd.append("index", String(index));
  }
  const res = await fetch("/api/admin/products/upload-image", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = (await res.json()) as { url?: string; error?: string };
  if (!res.ok) throw new Error(typeof data.error === "string" ? data.error : "Dosya yüklenemedi.");
  if (!data.url) throw new Error("Dosya yüklenemedi.");
  return data.url;
}

function IconBox() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M21 8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.73Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>;
}
function IconImage() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>;
}
function IconFile() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8M16 17H8M10 9H8"/></svg>;
}
function IconChevron({ open }: { open: boolean }) {
  return <svg className={`ate-section__chevron ${open ? "ate-section__chevron--open" : ""}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
}
function IconX() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>;
}

function AccordionSection({
  id,
  icon,
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  id: SectionKey;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: (id: SectionKey) => void;
  children: ReactNode;
}) {
  return (
    <div className={`ate-section ${open ? "ate-section--open" : ""}`}>
      <button type="button" className="ate-section__trigger" aria-expanded={open} onClick={() => onToggle(id)}>
        <span className="ate-section__icon">{icon}</span>
        <span className="ate-section__label">
          <span className="ate-section__title">{title}</span>
          {subtitle ? <span className="ate-section__subtitle">{subtitle}</span> : null}
        </span>
        <IconChevron open={open} />
      </button>
      {open ? <div className="ate-section__panel"><div className="ate-grid">{children}</div></div> : null}
    </div>
  );
}

export function AdminProductsEditor({ mode, categories, initialProduct }: Props) {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [saving, setSaving] = useState(false);

  const categoryOptions = useMemo(() => buildCategorySelectOptions(categories), [categories]);
  const defaultCategoryId = categoryOptions[0]?.id;

  const [nameDraft, setNameDraft] = useState(initialProduct?.name ?? "");
  const [categoryIdDraft, setCategoryIdDraft] = useState(
    initialProduct?.categoryId ? String(initialProduct.categoryId) : (defaultCategoryId ? String(defaultCategoryId) : ""),
  );
  const [excerptDraft, setExcerptDraft] = useState(initialProduct?.excerpt ?? "");
  const [descriptionDraft, setDescriptionDraft] = useState(initialProduct?.description ?? "");
  const [mainPreview, setMainPreview] = useState(initialProduct?.imageUrl ?? "");
  const [mainFile, setMainFile] = useState<File | null>(null);
  const [posterSlots, setPosterSlots] = useState<PosterSlot[]>(
    ((initialProduct?.posterUrls ?? []) as unknown[]).map(posterSlotFromStored).filter((s) => s.preview.trim() !== ""),
  );
  const [carouselSlots, setCarouselSlots] = useState<CarouselSlot[]>(
    (initialProduct?.carouselImages ?? [])
      .slice(0, 3)
      .map((u) => ({ id: crypto.randomUUID(), preview: String(u).trim(), file: null, remoteUrl: String(u).trim() || null }))
      .filter((s) => s.preview.length > 0),
  );
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    productInfo: true,
    images: false,
    technical: false,
  });

  const toggleSection = useCallback((key: SectionKey) => {
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const buildPosterUrlsAfterUploads = useCallback(async (slug: string) => {
    const out: Array<{ title: string; url: string }> = [];
    for (let i = 0; i < posterSlots.length; i++) {
      const s = posterSlots[i]!;
      const title = `Afiş ${i + 1}`;
      if (s.file) out.push({ title, url: await uploadProductImage(s.file, slug, "poster", i) });
      else if (s.remoteUrl) out.push({ title, url: s.remoteUrl });
    }
    return out;
  }, [posterSlots]);

  const buildCarouselUrlsAfterUploads = useCallback(async (slug: string) => {
    const out: string[] = [];
    for (let i = 0; i < carouselSlots.length; i++) {
      const s = carouselSlots[i]!;
      if (s.file) out.push(await uploadProductImage(s.file, slug, "carousel", i));
      else if (s.remoteUrl) out.push(s.remoteUrl);
    }
    return out.slice(0, 3);
  }, [carouselSlots]);

  const onSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const name = nameDraft.trim();
    const catId = Number(categoryIdDraft);
    if (!name) return showToast("Ürün adı zorunludur.", "error");
    if (!Number.isFinite(catId) || catId < 1) return showToast("Kategori seçin.", "error");

    setSaving(true);
    try {
      if (mode === "create") {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            categoryId: catId,
            excerpt: excerptDraft.trim() || undefined,
            description: descriptionDraft.trim() || undefined,
            posterUrls: [],
            carouselImages: [],
          }),
        });
        const data = (await res.json()) as { product?: Product; error?: string };
        if (!res.ok || !data.product) return showToast(formatApiError(data, "Ürün oluşturulamadı."), "error");
        const created = data.product;
        const slug = created.slug;

        if (mainFile) {
          const imageUrl = await uploadProductImage(mainFile, slug, "main");
          await fetch(`/api/admin/products/${created.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ imageUrl }),
          });
        }
        const posterUrls = await buildPosterUrlsAfterUploads(slug);
        if (posterUrls.length > 0) {
          await fetch(`/api/admin/products/${created.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ posterUrls }),
          });
        }
        const carouselImages = await buildCarouselUrlsAfterUploads(slug);
        if (carouselImages.length > 0) {
          await fetch(`/api/admin/products/${created.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ carouselImages }),
          });
        }
        showToast("Ürün oluşturuldu.", "success");
      } else if (initialProduct) {
        const coreRes = await fetch(`/api/admin/products/${initialProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name,
            categoryId: catId,
            excerpt: excerptDraft.trim() || null,
            description: descriptionDraft.trim() || null,
          }),
        });
        const coreData = await coreRes.json();
        if (!coreRes.ok) return showToast(formatApiError(coreData, "Ürün güncellenemedi."), "error");

        if (mainFile) {
          const imageUrl = await uploadProductImage(mainFile, initialProduct.slug, "main");
          await fetch(`/api/admin/products/${initialProduct.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ imageUrl }),
          });
        } else if (!mainPreview.trim()) {
          await fetch(`/api/admin/products/${initialProduct.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ imageUrl: null }),
          });
        }

        const posterUrls = await buildPosterUrlsAfterUploads(initialProduct.slug);
        await fetch(`/api/admin/products/${initialProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ posterUrls }),
        });

        const carouselImages = await buildCarouselUrlsAfterUploads(initialProduct.slug);
        await fetch(`/api/admin/products/${initialProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ carouselImages }),
        });

        showToast("Ürün güncellendi.", "success");
      }
      setTimeout(() => {
        router.push(LIST_HREF);
        router.refresh();
      }, 450);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "İşlem başarısız.", "error");
    } finally {
      setSaving(false);
    }
  }, [
    mode, initialProduct, nameDraft, categoryIdDraft, excerptDraft, descriptionDraft, mainFile, mainPreview,
    buildPosterUrlsAfterUploads, buildCarouselUrlsAfterUploads, showToast, router,
  ]);

  return (
    <div className="admin-training-editor">
      <div className="admin-training-editor__head">
        <Link href={LIST_HREF} className="admin-training-editor__back">← Ürün listesine dön</Link>
        <h1 className="admin-training-editor__title">{mode === "create" ? "Yeni ürün" : "Ürünü düzenle"}</h1>
      </div>

      <form className="ate-form" onSubmit={onSubmit}>
        <AccordionSection
          id="productInfo"
          icon={<IconBox />}
          title="Ürün bilgileri"
          subtitle="Temel içerik alanları"
          open={openSections.productInfo}
          onToggle={toggleSection}
        >
          <label className="admin-field admin-field--full">
            <span>Ürün adı *</span>
            <input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} required maxLength={160} />
          </label>
          <label className="admin-field">
            <span>Kategori *</span>
            <select value={categoryIdDraft} onChange={(e) => setCategoryIdDraft(e.target.value)} required>
              {categoryOptions.map((o) => <option key={o.id} value={String(o.id)}>{o.label}</option>)}
            </select>
          </label>
          <label className="admin-field admin-field--full">
            <span>Liste özeti</span>
            <textarea value={excerptDraft} onChange={(e) => setExcerptDraft(e.target.value)} rows={3} maxLength={800} />
          </label>
          <label className="admin-field admin-field--full">
            <span>Detay açıklaması</span>
            <textarea value={descriptionDraft} onChange={(e) => setDescriptionDraft(e.target.value)} rows={6} maxLength={50000} />
          </label>
        </AccordionSection>

        <AccordionSection
          id="images"
          icon={<IconImage />}
          title="Görseller"
          subtitle="Ana görsel ve carousel"
          open={openSections.images}
          onToggle={toggleSection}
        >
          <div className="admin-field admin-field--full">
            <AdminCropImageField
              label="Ana görsel"
              help={`Products/{slug}/main.webp — en fazla ${MAX_ADMIN_IMAGE_UPLOAD_MB} MB.`}
              value={mainPreview}
              thumbClass="admin-training-image-field__thumb--category"
              onChange={(url) => setMainPreview(url)}
              onFileChange={setMainFile}
            />
          </div>
          <div className="admin-field admin-field--full">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Carousel görselleri (max 3)</span>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setCarouselSlots((s) => s.length >= 3 ? s : [...s, newCarouselSlot()])} disabled={carouselSlots.length >= 3}>
                + Carousel satırı
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {carouselSlots.map((slot, idx) => (
                <div key={slot.id} className="admin-media-card">
                  <p className="admin-muted" style={{ margin: 0, fontSize: 12 }}>Carousel {idx + 1}</p>
                  <AdminCropImageField
                    label=""
                    help=""
                    value={slot.preview}
                    aspect={1}
                    thumbClass="admin-training-image-field__thumb--category"
                    onChange={(url) => setCarouselSlots((rows) => rows.map((r) => r.id === slot.id ? { ...r, preview: url, remoteUrl: url.startsWith("https://") ? url : null } : r))}
                    onFileChange={(file) => setCarouselSlots((rows) => rows.map((r) => r.id === slot.id ? { ...r, file, remoteUrl: file ? null : r.remoteUrl } : r))}
                  />
                  <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => setCarouselSlots((rows) => rows.filter((r) => r.id !== slot.id))}>
                    <IconX /> Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>

        <AccordionSection
          id="technical"
          icon={<IconFile />}
          title="Teknik bilgiler"
          subtitle="Afiş görselleri"
          open={openSections.technical}
          onToggle={toggleSection}
        >
          <div className="admin-field admin-field--full">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 13 }}>Afiş görselleri</span>
              <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPosterSlots((s) => [...s, newPosterSlot()])}>
                + Afiş satırı
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {posterSlots.map((slot, idx) => (
                <div key={slot.id} className="admin-media-card">
                  <p className="admin-muted" style={{ margin: "0 0 8px", fontSize: 12 }}>Afiş {idx + 1}</p>
                  <AdminCropImageField
                    label=""
                    help=""
                    value={slot.preview}
                    thumbClass="admin-training-image-field__thumb--poster"
                    onChange={(url) => setPosterSlots((rows) => rows.map((r) => r.id === slot.id ? { ...r, preview: url, remoteUrl: url.startsWith("https://") ? url : null } : r))}
                    onFileChange={(file) => setPosterSlots((rows) => rows.map((r) => r.id === slot.id ? { ...r, file, remoteUrl: file ? null : r.remoteUrl } : r))}
                  />
                  <button type="button" className="admin-icon-btn admin-icon-btn--danger" onClick={() => setPosterSlots((rows) => rows.filter((r) => r.id !== slot.id))}>
                    <IconX /> Kaldır
                  </button>
                </div>
              ))}
            </div>
          </div>
        </AccordionSection>

        <div className="ate-footer">
          <Link href={LIST_HREF} className="admin-btn admin-btn--ghost">Vazgeç</Link>
          <button type="submit" className="admin-btn admin-btn--primary" disabled={saving}>
            {saving ? "Kaydediliyor…" : mode === "create" ? "Oluştur" : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

