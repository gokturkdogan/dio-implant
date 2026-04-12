import { AdminPanelShell } from "../../../components/admin/admin-panel-shell";
import { AdminCategoriesManager } from "../../../components/admin/admin-categories-manager";
import { categoryService } from "../../../services/category.service";
import { productService } from "../../../services/product.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kategoriler | Yönetim Paneli | DIO Implant",
};

export default async function AdminKategorilerPage() {
  const [categories, productCounts] = await Promise.all([
    categoryService.listAll(),
    productService.countByCategoryId(),
  ]);

  return (
    <AdminPanelShell title="Kategoriler" activeHref="/admin-panel/kategoriler">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Ürün kategorileri</div>
              <div className="admin-card__sub">
                <code>categories</code> tablosunda üst düzey ve tek seviye{" "}
                <strong>alt kategori</strong> (<code>parent_id</code>) vardır. Ürünler
                hem üst hem alt kategoriye bağlanabilir. Slug isimden üretilir.{" "}
                <strong>Menü sırası</strong> sütunundaki oklar ile aynı gruptaki sıra
                (navbar Ürünler menüsü ve ürünler sayfası) ayarlanır.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminCategoriesManager
              initialCategories={categories}
              initialProductCounts={productCounts}
            />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
