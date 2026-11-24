import type { ReactNode } from "react";
import { SiteChrome } from "@/components/common/site-chrome";

/**
 * Tüm public sayfaların ortak layout'u (route group — URL'leri etkilemez).
 *
 * Navbar menüsü ve bakım modu durumu sayfa ISR ile üretilirken okunur ve HTML'e
 * gömülür (bkz. components/common/site-chrome.tsx). Böylece ziyaretçi başına ne ayrı
 * bir API isteği ne de middleware kontrolü gerekir; sayfalar doğrudan CDN'den sunulur.
 *
 * Günlük yenileme yalnızca emniyet payıdır; admin değişiklikleri anında yansır.
 * Veritabanı geçici olarak erişilemezse hata fırlatılır; ISR bu durumda önbellekteki
 * son sağlam sayfayı sunmaya devam eder.
 */
export const revalidate = 86400;

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
