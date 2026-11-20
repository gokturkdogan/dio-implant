import { jsonError, jsonOk } from "@/lib/http";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";

/**
 * Navbar "Ürünler" menüsü verisi. Her sayfa yüklemesinde çağrıldığı için
 * ISR ile önbelleğe alınır (CDN'den sunulur, fonksiyon/DB çalışmaz).
 * Admin panelindeki değişiklikler `revalidatePublicSite()` ile anında yansır.
 */
export const revalidate = 3600;

export async function GET() {
  try {
    const [categories, products] = await Promise.all([
      categoryService.listAll(),
      productService.listAll(),
    ]);
    return jsonOk({
      categories,
      // Menü yalnızca bu alanları kullanıyor; açıklama/görsel alanlarını taşımaya gerek yok.
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        categoryId: p.categoryId,
      })),
    });
  } catch (error) {
    return jsonError(error);
  }
}
