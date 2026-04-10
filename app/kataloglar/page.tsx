import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteCatalogDownloadButton } from "@/components/catalog/site-catalog-download-button";
import { Footer } from "@/components/common/footer";
import { slugify } from "@/lib/slug";
import { siteCatalogService } from "@/services/site-catalog.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kataloglar | DIO Implant",
  description:
    "DIO Implant ürün ve teknik katalogları: PDF broşürler ve dokümanlar.",
};

function isHttpsCover(url: string | null | undefined): url is string {
  const t = String(url ?? "").trim();
  return t.startsWith("https://");
}

export default async function KataloglarPage() {
  const catalogs = await siteCatalogService.listAll();

  return (
    <>
      <main className="ct-page">
        <section className="ct-hero">
          <div className="ct-hero-inner">
            <div className="ct-hero-copy">
              <p className="ct-eyebrow">Kataloglar</p>
              <h1>
                Teknik dokümanlar ve <em>katalog arşivi</em>
              </h1>
              <p>
                Ürün katalogları ve referans PDF’lerine aşağıdaki listeden
                ulaşabilirsiniz.
              </p>
            </div>
            <div className="ct-hero-actions">
              <a
                href="#kataloglar-icerik"
                className="ct-hero-btn ct-hero-btn--primary"
              >
                İçeriğe geç
              </a>
              <Link
                href="/urunler"
                className="ct-hero-btn ct-hero-btn--ghost"
              >
                Ürün portföyü
              </Link>
            </div>
          </div>
        </section>

        <section
          className="ct-section ct-section--alt"
          id="kataloglar-icerik"
          aria-labelledby="kataloglar-main-title"
        >
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag">
                <span className="tag-line" />
                <span className="tag-text">Kataloglar</span>
              </div>
              <h2 id="kataloglar-main-title" className="ct-section-title">
                PDF <em>dokümanları</em>
              </h2>
            </div>

            {catalogs.length === 0 ? (
              <p className="ct-empty-block">
                Henüz yayınlanmış katalog yok. Kayıtlar yönetim paneli ·
                Kataloglar bölümünden eklenebilir.
              </p>
            ) : (
              <div className="ct-catalogs-grid">
                {catalogs.map((c) => (
                  <article key={c.id} className="ct-catalog-card">
                    <a
                      href={c.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ct-catalog-card__cover-link"
                      aria-label={`${c.title} PDF’ini yeni sekmede aç`}
                    >
                      {isHttpsCover(c.coverImageUrl) ? (
                        <div className="ct-catalog-card__cover ct-catalog-card__cover--image">
                          <Image
                            src={c.coverImageUrl}
                            alt={`${c.title} katalog kapağı`}
                            width={210}
                            height={297}
                            className="ct-catalog-card__cover-img"
                            sizes="(max-width: 768px) 50vw, min(360px, 40vw)"
                          />
                        </div>
                      ) : (
                        <div className="ct-catalog-card__cover ct-catalog-card__cover--fallback">
                          <span className="ct-catalog-card__cover-fallback-icon" aria-hidden="true">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="M10 12h4M10 16h4" />
                            </svg>
                          </span>
                          <span className="ct-catalog-card__cover-fallback-text">Kapak yok</span>
                        </div>
                      )}
                    </a>
                    <h3 className="ct-catalog-card__title">{c.title}</h3>
                    <div className="ct-catalog-card__actions">
                      <a
                        href={c.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ct-map-btn"
                      >
                        PDF’i aç
                      </a>
                      <SiteCatalogDownloadButton
                        catalogId={c.id}
                        fileName={`${slugify(c.title) || `katalog-${c.id}`}-katalog.pdf`}
                      />
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
