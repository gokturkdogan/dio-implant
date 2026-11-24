import "server-only";
import type { NavbarMenuData } from "@/lib/navbar-menu-types";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";

/**
 * Navbar menü verisi — `app/(site)/layout.tsx` içinde ISR sırasında okunur ve HTML'e
 * gömülür; ziyaretçi başına ayrı bir API isteği atılmaz. Ürün/kategori değiştiğinde
 * `revalidateForResource()` (lib/revalidate-public.ts) tüm public sayfaları yeniler (bkz. lib/admin-audit.ts).
 * Hata yutulmaz: ISR yenilemesi başarısız olursa önbellekteki son sağlam sayfa
 * (dolu menüyle) sunulmaya devam eder; boş menülü bir sayfa önbelleğe girmez.
 */
export async function getNavbarMenuData(): Promise<NavbarMenuData> {
  const [categories, products] = await Promise.all([
    categoryService.listAll(),
    productService.listAll(),
  ]);
  return {
    categories,
    // Menü yalnızca bu alanları kullanıyor; HTML'i şişirmemek için gerisi atılır.
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
    })),
  };
}
