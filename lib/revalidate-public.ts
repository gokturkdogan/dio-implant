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
