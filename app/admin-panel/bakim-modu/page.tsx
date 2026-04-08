import { AdminMaintenanceManager } from "@/components/admin/admin-maintenance-manager";
import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { siteMaintenanceService } from "@/services/site-maintenance.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bakım modu | Yönetim Paneli | DIO Implant",
};

export default async function AdminBakimModuPage() {
  const setting = await siteMaintenanceService.get();

  return (
    <AdminPanelShell title="Bakım modu" activeHref="/admin-panel/bakim-modu">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Site bakım modu</div>
              <div className="admin-card__sub">
                Bu ayar açıkken public sayfalar <code>/maintenance</code>{" "}
                sayfasına yönlendirilir.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminMaintenanceManager
              initialEnabled={setting?.enabled ?? false}
              initialMessage={setting?.message ?? ""}
            />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}

