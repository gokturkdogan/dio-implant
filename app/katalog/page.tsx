import Link from "next/link";
import { Footer } from "@/components/common/footer";
import { CatalogDownloadButton } from "@/components/catalog/catalog-download-button";
import { productService } from "@/services/product.service";

type Props = {
  searchParams: Promise<{ urun?: string }>;
};

function isHttpUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

function toDrivePreviewUrl(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/i);
  if (!m?.[1]) return url;
  return `https://drive.google.com/file/d/${m[1]}/preview`;
}

export default async function KatalogPage({ searchParams }: Props) {
  const { urun } = await searchParams;
  const slug = String(urun ?? "").trim();

  if (!slug) {
    return (
      <>
        <main className="catalog-page">
          <section className="catalog-empty">
            <h1>Katalog bulunamadi</h1>
            <p>Bu sayfaya bir urun secimi ile gelmelisiniz.</p>
            <Link href="/urunler" className="catalog-btn">Urunlere don</Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  let product = null;
  try {
    product = await productService.getBySlug(slug);
  } catch {
    product = null;
  }

  const catalogUrl = String(product?.catalogUrl ?? "").trim();
  const hasCatalog = isHttpUrl(catalogUrl);
  const viewerUrl = toDrivePreviewUrl(catalogUrl);

  if (!product || !hasCatalog) {
    return (
      <>
        <main className="catalog-page">
          <section className="catalog-empty">
            <h1>Katalog henuz eklenmemis</h1>
            <p>Bu urun icin katalog linki tanimli degil.</p>
            <Link href={product ? `/urunler/${product.slug}` : "/urunler"} className="catalog-btn">
              Urun detayina don
            </Link>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="catalog-page">
        <section className="catalog-hero">
          <div className="catalog-hero-inner">
            <div className="catalog-hero-copy">
              <p className="catalog-eyebrow">Katalog Onizleme</p>
              <h1>{product.name}</h1>
              <p>Teknik PDF dokumanini sayfa icerisinde inceleyebilirsiniz.</p>
            </div>
            <div className="catalog-actions">
              <CatalogDownloadButton slug={product.slug} fileName={`${product.slug}-katalog.pdf`} />
              <Link href={`/urunler/${product.slug}`} className="catalog-btn catalog-btn--ghost">
                Urune geri don
              </Link>
            </div>
          </div>
        </section>

        <section className="catalog-viewer-wrap">
          <div className="catalog-viewer">
            <iframe
              src={viewerUrl}
              title={`${product.name} katalog`}
              className="catalog-iframe"
              loading="lazy"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

