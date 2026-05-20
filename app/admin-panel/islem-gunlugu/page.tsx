import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminAuditLogList } from "@/components/admin/admin-audit-log-list";
import { requireSuperAdminPage } from "@/lib/require-super-admin-page";
import { adminAuditService } from "@/services/admin-audit.service";

export const metadata = {
  title: "İşlem günlüğü | Yönetim Paneli | DIO Implant",
};

export default async function AdminIslemGunluguPage() {
  await requireSuperAdminPage();
  const { logs, total } = await adminAuditService.listForSuperAdmin(80, 0);

  return (
    <AdminPanelShell
      title="İşlem günlüğü"
      activeHref="/admin-panel/islem-gunlugu"
    >
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Panel işlem kayıtları</div>
              <div className="admin-card__sub">
                Yönetim panelinde yapılan ekleme, güncelleme ve silme işlemleri
                burada listelenir.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminAuditLogList initialLogs={logs} initialTotal={total} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
