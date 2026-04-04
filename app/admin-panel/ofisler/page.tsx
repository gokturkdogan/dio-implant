import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminRegionalOfficesManager } from "@/components/admin/admin-regional-offices-manager";
import { regionalOfficeService } from "@/services/regional-office.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bölge ofisleri | Yönetim Paneli | DIO Implant",
};

export default async function AdminOfislerPage() {
  const offices = await regionalOfficeService.listAll();

  return (
    <AdminPanelShell title="Bölge ofisleri" activeHref="/admin-panel/ofisler">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Bölge müdürlükleri / ofisler</div>
              <div className="admin-card__sub">
                Kayıtlar <code>regional_offices</code> tablosunda tutulur; sıra alanı listeleme
                önceliğini belirler.
              </div>
            </div>
            <a
              className="admin-btn admin-btn--secondary"
              href="/iletisim#bolge-mudurlukler"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canlı sayfayı aç
            </a>
          </div>
          <div className="admin-card__body">
            <AdminRegionalOfficesManager initialOffices={offices} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
