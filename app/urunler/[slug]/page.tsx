import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "../../../components/common/footer";
import type { Product } from "@/db/schema/product";
import type { Category } from "@/db/schema/category";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { ProductPageClient } from "./product-page-client";

function normalizePosters(raw: unknown): Array<{ title: string; url: string }> {
  if (!Array.isArray(raw)) return [];
  const out: Array<{ title: string; url: string }> = [];
  raw.forEach((item, idx) => {
    if (typeof item === "string") {
      const url = item.trim();
      if (url) out.push({ title: `Afiş ${idx + 1}`, url });
      return;
    }
    if (item && typeof item === "object") {
      const rec = item as { title?: unknown; url?: unknown };
      const url = String(rec.url ?? "").trim();
      const title = String(rec.title ?? "").trim();
      if (!url) return;
      out.push({ title: title || `Afiş ${idx + 1}`, url });
    }
  });
  return out;
}

function normalizeCarousel(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((u) => String(u ?? "").trim())
    .filter((u) => u.length > 0)
    .slice(0, 3);
}

interface Breadcrumb {
  label: string;
  href?: string;
}

async function buildBreadcrumbs(
  product: Product,
  category: Category | null,
  parentCategory: Category | null,
): Promise<Breadcrumb[]> {
  const crumbs: Breadcrumb[] = [
    { label: "Anasayfa", href: "/" },
    { label: "Ürünler", href: "/urunler" },
  ];

  if (parentCategory) {
    crumbs.push({ label: parentCategory.name });
  }
  if (category) {
    crumbs.push({ label: category.name });
  }
  crumbs.push({ label: product.name });

  return crumbs;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productService.getBySlug(slug);
    return {
      title: `${product.name} | Ürünler | DIO Implant`,
      description: product.excerpt ?? product.name,
    };
  } catch {
    return { title: "Ürün | DIO Implant" };
  }
}

export default async function UrunDetayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: Product;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    notFound();
  }

  let category: Category | null = null;
  let parentCategory: Category | null = null;
  try {
    category = await categoryService.getById(product.categoryId);
    if (category?.parentId) {
      parentCategory = await categoryService.getById(category.parentId);
    }
  } catch {
    /* category lookup is non-critical */
  }

  const posters = normalizePosters(product.posterUrls);
  const carouselImages = normalizeCarousel(product.carouselImages);
  const orbitImages = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...carouselImages.slice(0, 3),
  ]
    .map((u) => String(u ?? "").trim())
    .filter((u) => u.startsWith("http://") || u.startsWith("https://"))
    .slice(0, 4);
  const breadcrumbs = await buildBreadcrumbs(product, category, parentCategory);

  const categoryImageUrl = category?.imageUrl ?? parentCategory?.imageUrl ?? null;
  const heroImageUrl = product.imageUrl?.trim()
    ? product.imageUrl
    : categoryImageUrl;

  return (
    <>
      <main className="pd-page">
        {/* ── Hero ── */}
        <section className="pd-hero">
          <div className="pd-hero-bg">
            <Image
              src="https://res.cloudinary.com/drjz8v617/image/upload/product-banner.webp"
              alt=""
              fill
              className="pd-hero-bg-img"
              priority
              sizes="100vw"
            />
          </div>
          <div className="pd-hero-overlay" />

          {/* Decorative elements */}
          <div className="pd-hero-decor pd-hero-decor--1" />
          <div className="pd-hero-decor pd-hero-decor--2" />

          <div className="pd-hero-inner pd-inner">
            <div className="pd-hero-grid">
              {/* Left — Product main image (fallback: category) */}
              <div className="pd-hero-media" data-pd-animate="fade-right">
                {heroImageUrl ? (
                  <div className="pd-hero-img-frame">
                    <Image
                      src={heroImageUrl}
                      alt={
                        product.imageUrl?.trim()
                          ? product.name
                          : category?.name ?? "Kategori"
                      }
                      width={520}
                      height={520}
                      className="pd-hero-cat-img"
                      sizes="(max-width: 768px) 280px, 440px"
                      priority
                    />
                    <div className="pd-hero-img-glow" />
                  </div>
                ) : (
                  <div className="pd-hero-img-placeholder">
                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Right — Breadcrumbs, title, CTA */}
              <div className="pd-hero-content" data-pd-animate="fade-left">
                {/* Badge breadcrumbs */}
                <nav className="pd-breadcrumbs" aria-label="Gezinti">
                  {breadcrumbs.map((crumb, i) => (
                    <span key={i} className="pd-breadcrumb-item">
                      {i > 0 && (
                        <svg className="pd-breadcrumb-sep" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      )}
                      {crumb.href ? (
                        <Link href={crumb.href} className="pd-breadcrumb-link">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={`pd-breadcrumb-badge ${i === breadcrumbs.length - 1 ? "pd-breadcrumb-badge--active" : ""}`}>
                          {crumb.label}
                        </span>
                      )}
                    </span>
                  ))}
                </nav>

                <h1 className="pd-hero-title">{product.name}</h1>

                {product.excerpt && (
                  <p className="pd-hero-excerpt">{product.excerpt}</p>
                )}

                <div className="pd-hero-actions">
                  <Link href="/kataloglar" className="pd-btn pd-btn--outline">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Katalog Görüntüle
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="pd-hero-wave">
            <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
              <path d="M0 40C360 80 720 0 1080 40C1260 60 1380 60 1440 50V80H0V40Z" fill="var(--section-light, #fff)" />
            </svg>
          </div>
        </section>

        {/* ── Description ── */}
        {product.description && (
          <section className="pd-desc">
            <div className="pd-inner">
              <div className="pd-desc-grid">
                {/* Left — visual column */}
                <div className="pd-desc-visual" data-pd-animate="fade-right">
                  <div className="pd-desc-visual-inner">
                    {/* Decorative rings */}
                    <div className="pd-desc-ring pd-desc-ring--1" />
                    <div className="pd-desc-ring pd-desc-ring--2" />
                    <div className="pd-desc-ring pd-desc-ring--3" />

                    <div className="pd-desc-visual-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
                        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                      </svg>
                    </div>

                    <div className="pd-desc-orbit-track" style={{ "--orbit-count": orbitImages.length } as React.CSSProperties}>
                      {orbitImages.map((url, idx) => (
                        <div
                          key={`${url}-${idx}`}
                          className="pd-desc-orbit"
                          style={{ "--i": idx, "--n": orbitImages.length } as React.CSSProperties}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="pd-desc-orbit-img" />
                        </div>
                      ))}
                    </div>

                    <span className="pd-desc-visual-label"></span>

                  </div>
                </div>

                {/* Right — text column */}
                <div className="pd-desc-body" data-pd-animate="fade-left">
                  <h2 className="pd-desc-title">
                  <div className="pd-desc-eyebrow">
                    <span className="pd-desc-eyebrow-dot" />
                  </div>
                    <span className="pd-desc-title-product">{product.name}</span>
                    {" "}Nedir?
                  </h2>
                  <div className="pd-desc-divider" />
                  <div className="pd-desc-text">{product.description}</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Catalog CTA Banner ── */}
        <section className="pd-cta-banner">
          {/* Background decorations */}
          <div className="pd-cta-bg">
            <div className="pd-cta-orb pd-cta-orb--1" />
            <div className="pd-cta-orb pd-cta-orb--2" />
            <div className="pd-cta-orb pd-cta-orb--3" />
            <div className="pd-cta-grid-pattern" />
          </div>

          <div className="pd-inner">
            <div className="pd-cta-content">
              <div className="pd-cta-left" data-pd-animate="fade-right">
                <div className="pd-cta-icon-stack">
                  <div className="pd-cta-icon-card pd-cta-icon-card--back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="pd-cta-icon-card pd-cta-icon-card--front">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="pd-cta-center" data-pd-animate="fade-up">
                <div className="pd-cta-eyebrow">
                  <span className="pd-cta-eyebrow-line" />
                  Katalog
                  <span className="pd-cta-eyebrow-line" />
                </div>
                <h2 className="pd-cta-title">
                  Ürün Kataloğumuzu <em>İnceleyin</em>
                </h2>
                <p className="pd-cta-subtitle">
                  Tüm teknik detaylar, ölçüler ve klinik verilere tek bir dokümandan ulaşın.
                </p>
                <div className="pd-cta-actions">
                  <Link href="/kataloglar" className="pd-btn pd-btn--primary pd-btn--lg">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Katalog Görüntüle
                  </Link>
                </div>
              </div>

              <div className="pd-cta-right" data-pd-animate="fade-left">
                <div className="pd-cta-stats">
                  <div className="pd-cta-stat">
                    <span className="pd-cta-stat-value">35+</span>
                    <span className="pd-cta-stat-label">Yıllık Deneyim</span>
                  </div>
                  <div className="pd-cta-stat">
                    <span className="pd-cta-stat-value">100+</span>
                    <span className="pd-cta-stat-label">Ülkede Kullanım</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Posters ── */}
        {posters.length > 0 && (
          <section className="pd-posters">
            <div className="pd-inner">
              <div className="pd-posters-list">
                {posters.map((poster, i) => (
                  <div
                    key={`${poster.url}-${i}`}
                    className="pd-poster-item"
                    data-pd-animate="fade-up"
                    style={{ "--pd-delay": `${i * 0.12}s` } as React.CSSProperties}
                  >
                    <div className="pd-poster-frame">
                      <Image
                        src={poster.url}
                        alt={`${product.name} — afiş ${i + 1}`}
                        width={1200}
                        height={800}
                        className="pd-poster-img"
                        sizes="(max-width: 768px) 100vw, 1100px"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <ProductPageClient />
      <Footer />
    </>
  );
}
