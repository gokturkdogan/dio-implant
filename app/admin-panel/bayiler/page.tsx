import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminDealersManager } from "@/components/admin/admin-dealers-manager";
import { authorizedDealerService } from "@/services/authorized-dealer.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Yetkili bayiler | Yönetim Paneli | DIO Implant",
};

export default async function AdminBayilerPage() {
  const dealers = await authorizedDealerService.listAll();

  return (
    <AdminPanelShell title="Yetkili bayiler" activeHref="/admin-panel/bayiler">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Yetkili bayiler</div>
              <div className="admin-card__sub">
                Kayıtlar <code>authorized_dealers</code> tablosunda tutulur.
              </div>
            </div>
            <a
              className="admin-btn admin-btn--secondary"
              href="/iletisim#yetkili-bayiler"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canlı sayfayı aç
            </a>
          </div>
          <div className="admin-card__body">
            <AdminDealersManager initialDealers={dealers} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
