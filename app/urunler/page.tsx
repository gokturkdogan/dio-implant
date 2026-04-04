import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/common/footer";
import { buildProductCatalogTree } from "@/lib/product-catalog-tree";
import type { Product } from "@/db/schema/product";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";
import {
  ProductCarousel,
  type CarouselProduct,
} from "@/components/products/product-carousel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ürünler | DIO Implant",
  description:
    "DIO Implant ürün kataloğu: ana ve alt kategoriler altında implant sistemleri ve klinik çözümler. Ürün detaylarına buradan ulaşın.",
};

function toCarouselProducts(items: Product[]): CarouselProduct[] {
  return items.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    excerpt: p.excerpt,
    imageUrl: p.imageUrl,
  }));
}

export default async function UrunlerIndexPage() {
  const [categories, products] = await Promise.all([
    categoryService.listAll(),
    productService.listAll(),
  ]);

  const tree = buildProductCatalogTree(categories, products);

  return (
    <>
      <main className="products-index-page">
        <section className="pi-hero" aria-labelledby="pi-hero-title">
          {/* Ambient background */}
          <div className="pi-hero-ambient" aria-hidden="true">
            <span className="pi-hero-orb pi-hero-orb--a" />
            <span className="pi-hero-orb pi-hero-orb--b" />
            <span className="pi-hero-orb pi-hero-orb--c" />
            <span className="pi-hero-grid-lines" />
            {/* Floating hexagons */}
            <span className="pi-hero-hex pi-hero-hex--1" />
            <span className="pi-hero-hex pi-hero-hex--2" />
            <span className="pi-hero-hex pi-hero-hex--3" />
            {/* Animated ring */}
            <span className="pi-hero-ring" />
          </div>

          <div className="pi-inner pi-hero-inner">
            <div className="pi-hero-center">
              <div className="pi-hero-badge">
                <span className="pi-hero-badge-dot" aria-hidden="true" />
                <span>Ürün kataloğu</span>
              </div>

              <h1 id="pi-hero-title" className="pi-hero-title">
                İmplant ve protez <em>çözümleri</em>
              </h1>

              <p className="pi-hero-lead">
                Cerrahi setlerden dijital iş akışlarına kadar tüm ürün portföyümüzü keşfedin.
                Her ürün için teknik detay, görsel galeri ve katalog tek sayfada.
              </p>

              {tree.length > 0 ? (
                <div className="pi-hero-actions">
                  <a href="#pi-katalog" className="pi-hero-btn pi-hero-btn--primary">
                    <span className="pi-hero-btn-glow" aria-hidden="true" />
                    <span className="pi-hero-btn-label">Kataloğu keşfet</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 5v14M5 12l7 7 7-7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </div>
              ) : null}
            </div>
          </div>

        </section>

        {tree.length > 0 ? (
          <>
            <div id="pi-katalog" className="pi-catalog">
              <div className="pi-inner">
                {tree.map((node) => {
                  const id = `kategori-${node.root.slug}`;
                  if (node.kind === "flat") {
                    const count = node.products.length;
                    return (
                      <section
                        key={node.root.id}
                        id={id}
                        className="pi-block"
                        aria-labelledby={`${id}-title`}
                      >
                        <header className="pi-block-head">
                          <h2 id={`${id}-title`} className="pi-block-title">
                            {node.root.name}
                          </h2>
                          <span className="pi-block-meta">
                            {count} ürün
                          </span>
                        </header>
                        <ProductCarousel products={toCarouselProducts(node.products)} />
                      </section>
                    );
                  }

                  const total = node.subBlocks.reduce((n, b) => n + b.products.length, 0);
                  return (
                    <section
                      key={node.root.id}
                      id={id}
                      className="pi-block"
                      aria-labelledby={`${id}-title`}
                    >
                      <header className="pi-block-head">
                        <h2 id={`${id}-title`} className="pi-block-title">
                          {node.root.name}
                        </h2>
                        <span className="pi-block-meta">
                          {node.subBlocks.length} alt grup · {total} ürün
                        </span>
                      </header>
                      {node.subBlocks.map(({ sub, products: plist }) => (
                        <div key={sub.id} className="pi-subsection">
                          <h3 className="pi-subtitle">{sub.name}</h3>
                          <ProductCarousel products={toCarouselProducts(plist)} />
                        </div>
                      ))}
                    </section>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="pi-empty pi-inner">
            <h1>Henüz listelenecek ürün yok</h1>
            <p>Kategoriler ve ürünler eklendikten sonra bu sayfa otomatik dolacaktır.</p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
