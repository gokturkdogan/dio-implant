import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminProductsEditor } from "@/components/admin/admin-products-editor";
import { categoryService } from "@/services/category.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yeni ürün | Yönetim Paneli | DIO Implant",
};

export default async function AdminUrunYeniPage() {
  const categories = await categoryService.listAll();
  return (
    <AdminPanelShell title="Yeni ürün" activeHref="/admin-panel/urunler">
      <div className="admin-grid admin-grid--wide">
        <AdminProductsEditor mode="create" categories={categories} />
      </div>
    </AdminPanelShell>
  );
}

