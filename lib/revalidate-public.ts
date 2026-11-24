import "server-only";
import { revalidatePath } from "next/cache";

/**
 * Public sayfalar ISR ile önbelleğe alınıyor (bkz. sayfalardaki `revalidate`).
 * Admin panelinden public içeriği etkileyen bir değişiklik yapıldığında bu fonksiyon
 * tüm site önbelleğini geçersiz kılar; böylece değişiklik anında yansır.
 * Admin mutasyonları seyrek olduğundan tüm siteyi temizlemek hem güvenli hem ucuzdur.
 * Hata fırlatmaz.
 */
export function revalidatePublicSite(): void {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/api/navbar-menu");
  } catch (err) {
    console.error("[revalidatePublicSite]", err);
  }
}

/** Bakım modu durumu değiştiğinde middleware'in okuduğu önbellekli ucu temizler. */
export function revalidateSiteMaintenance(): void {
  try {
    revalidatePath("/api/public/site-maintenance");
  } catch (err) {
    console.error("[revalidateSiteMaintenance]", err);
  }
}

/** Ana sayfa popup'ı değiştiğinde önbellekli public ucu temizler. */
export function revalidateHomepagePopup(): void {
  try {
    revalidatePath("/api/public/homepage-popup");
  } catch (err) {
    console.error("[revalidateHomepagePopup]", err);
  }
}
