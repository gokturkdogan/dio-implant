import { notFound } from "next/navigation";
import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminProductsEditor } from "@/components/admin/admin-products-editor";
import { categoryService } from "@/services/category.service";
import { productService } from "@/services/product.service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isFinite(pid) || pid < 1) {
    return { title: "Ürün düzenle | Yönetim Paneli | DIO Implant" };
  }
  try {
    const p = await productService.getById(pid);
    return { title: `Düzenle: ${p.name} | Yönetim Paneli | DIO Implant` };
  } catch {
    return { title: "Ürün düzenle | Yönetim Paneli | DIO Implant" };
  }
}

export default async function AdminUrunDuzenlePage({ params }: Props) {
  const { id } = await params;
  const pid = Number(id);
  if (!Number.isFinite(pid) || pid < 1) notFound();

  const [product, categories] = await Promise.all([
    productService.getById(pid),
    categoryService.listAll(),
  ]);

  return (
    <AdminPanelShell title="Ürünü düzenle" activeHref="/admin-panel/urunler">
      <div className="admin-grid admin-grid--wide">
        <AdminProductsEditor mode="edit" categories={categories} initialProduct={product} />
      </div>
    </AdminPanelShell>
  );
}

