import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminSiteCatalogsManager } from "@/components/admin/admin-site-catalogs-manager";
import { siteCatalogService } from "@/services/site-catalog.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kataloglar | Yönetim Paneli | DIO Implant",
};

export default async function AdminKataloglarPage() {
  const catalogs = await siteCatalogService.listAll();

  return (
    <AdminPanelShell title="Kataloglar" activeHref="/admin-panel/kataloglar">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Site katalogları (PDF)</div>
              <div className="admin-card__sub">
                Kayıtlar <code>site_catalogs</code> tablosunda tutulur. Her satır için başlık ve tam
                PDF URL’si girin; <a href="/kataloglar">/kataloglar</a> sayfasında listelenir.                 Kapak: görsel yükleyin (WebP + Cloudinary, klasör{" "}
                <code className="admin-code">Catalogs/{"{baslik}"}-{"{id}"}</code>
                ). PDF alanı yalnızca bağlantı metnidir.
              </div>
            </div>
            <a
              className="admin-btn admin-btn--secondary"
              href="/kataloglar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canlı sayfayı aç
            </a>
          </div>
          <div className="admin-card__body">
            <AdminSiteCatalogsManager initialCatalogs={catalogs} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
