import type { Category } from "@/db/schema/category";
import type { ProductCatalogItem } from "@/lib/product-catalog-tree";

/** Navbar "Ürünler" menüsü için sunucuda hazırlanıp sayfa HTML'ine gömülen veri. */
export type NavbarMenuData = {
  categories: Category[];
  products: ProductCatalogItem[];
};
