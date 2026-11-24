import { HomepageContent } from "@/components/home/homepage-content";
import type { HomepagePopupData } from "@/components/home/homepage-popup";
import { isAppError } from "@/lib/errors";
import { sitePopupService } from "@/services/site-popup.service";

/**
 * Ana sayfa popup verisi ISR sırasında okunur ve HTML'e gömülür; ziyaretçi başına
 * ayrı bir API isteği atılmaz. Admin panelinden popup güncellendiğinde ana sayfa
 * anında yenilenir (bkz. lib/revalidate-public.ts).
 */
async function getHomepagePopup(): Promise<HomepagePopupData | null> {
  try {
    const row = await sitePopupService.getByKey("homepage");
    return { enabled: row.enabled, imageUrl: row.imageUrl };
  } catch (error) {
    // Popup kaydı hiç yoksa popup gösterilmez; diğer hatalar fırlatılır ki
    // ISR önbellekteki son sağlam sayfayı sunmaya devam etsin.
    if (isAppError(error) && error.statusCode === 404) return null;
    throw error;
  }
}

export default async function HomePage() {
  const popup = await getHomepagePopup();
  return <HomepageContent popup={popup} />;
}
