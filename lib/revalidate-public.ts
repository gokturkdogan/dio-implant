import "server-only";
import { revalidatePath } from "next/cache";
import type { AdminAuditResourceType } from "@/lib/admin-audit";

/**
 * Public sayfalar ISR ile CDN'de tutulur. Admin panelinden bir içerik değiştiğinde
 * yalnızca o içeriği gösteren sayfalar anında yenilenir; böylece hem site her zaman
 * güncel kalır hem de gereksiz yere tüm sitenin önbelleği boşaltılmaz.
 *
 * Bağımlılık haritası (hangi sayfa hangi veriyi okuyor):
 * - Navbar menüsü (TÜM public sayfalarda) → kategoriler + ürünler
 * - Bakım modu (TÜM public sayfalarda)     → site_maintenance
 * - /urunler, /urunler/[slug]               → kategoriler + ürünler
 * - /dio-akademi/egitim-takvimi(/[slug])    → eğitimler + eğitmenler (join)
 * - /iletisim                               → bayiler + bölge ofisleri + iletişim bilgileri
 * - /kataloglar                             → kataloglar
 * - /dijital-kutuphane                      → dijital kütüphane
 * - / (ana sayfa)                           → ana sayfa popup'ı
 *
 * Yeni bir public sayfa veri okumaya başlarsa bu haritaya eklenmelidir.
 */
/*
 * Next.js önbellek etiketleri dosya yolundan üretilir ve route group adını içerir
 * (ör. `/(site)/dio-akademi/layout`). Bu yüzden:
 * - ["/", "layout"]      → kök layout etiketi; TÜM sayfalarla eşleşir.
 * - ["/iletisim"]        → tip verilmeden: URL etiketiyle eşleşir (tek sayfa).
 * - ["/(site)/x", "layout"] → x altındaki tüm sayfalar (dinamik [slug]'lar dahil).
 */
const PATHS_BY_RESOURCE: Partial<
  Record<AdminAuditResourceType, Array<[path: string, type?: "layout" | "page"]>>
> = {
  // Navbar menüsü her sayfada olduğundan ürün/kategori değişikliği tüm siteyi yeniler.
  category: [["/", "layout"]],
  product: [["/", "layout"]],
  site_maintenance: [["/", "layout"]],
  training: [["/(site)/dio-akademi", "layout"]],
  instructor: [["/(site)/dio-akademi", "layout"]],
  dealer: [["/iletisim"]],
  regional_office: [["/iletisim"]],
  site_contact: [["/iletisim"]],
  site_catalog: [["/kataloglar"]],
  digital_library: [["/dijital-kutuphane"]],
  site_popup: [["/"]],
};

/** İlgili public sayfaların önbelleğini temizler. Hata fırlatmaz. */
export function revalidateForResource(resourceType: AdminAuditResourceType): void {
  const paths = PATHS_BY_RESOURCE[resourceType];
  if (!paths) return;
  for (const [path, type] of paths) {
    try {
      revalidatePath(path, type);
    } catch (err) {
      console.error("[revalidateForResource]", resourceType, path, err);
    }
  }
}
