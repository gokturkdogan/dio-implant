import type { ReactNode } from "react";
import { Navbar } from "@/components/common/navbar";
import { NavbarEnhancements } from "@/components/common/navbar-enhancements";
import { MaintenanceView } from "@/components/maintenance/maintenance-view";
import { getNavbarMenuData } from "@/lib/navbar-menu";
import { siteMaintenanceService } from "@/services/site-maintenance.service";

/**
 * Public sitenin ortak çerçevesi: navbar (menü verisi HTML'e gömülü) ve bakım modu.
 *
 * `app/(site)/layout.tsx` tarafından kullanılır; 404 sayfası da bu layout içinde
 * render edildiğinden navbar ve bakım modu orada da geçerlidir.
 *
 * Veriler sayfa ISR ile üretilirken okunur; ziyaretçi başına istek atılmaz.
 * Senkronizasyon: ürün/kategori/bakım modu değiştiğinde tüm public sayfalar
 * anında yenilenir (bkz. lib/revalidate-public.ts).
 */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const [maintenanceEnabled, menu] = await Promise.all([
    siteMaintenanceService.isEnabled(),
    getNavbarMenuData(),
  ]);

  if (maintenanceEnabled) {
    return <MaintenanceView />;
  }

  return (
    <>
      <Navbar menu={menu} />
      <NavbarEnhancements />
      {children}
    </>
  );
}
