import { AdminPanelShell } from "../../../components/admin/admin-panel-shell";
import { AdminProductsManager } from "../../../components/admin/admin-products-manager";
import { categoryService } from "../../../services/category.service";
import { productService } from "../../../services/product.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Ürünler | Yönetim Paneli | DIO Implant",
};

export default async function AdminUrunlerPage() {
  const [products, categories] = await Promise.all([
    productService.listAll(),
    categoryService.listAll(),
  ]);

  return (
    <AdminPanelShell title="Ürünler" activeHref="/admin-panel/urunler">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Ürün yönetimi</div>
              <div className="admin-card__sub">
                Kayıtlar <code>products</code> tablosundan okunur; kategori seçimi{" "}
                <code>categories</code> ile eşleşir. Slug, ürün adından otomatik ve
                benzersiz üretilir.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminProductsManager initialProducts={products} initialCategories={categories} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
