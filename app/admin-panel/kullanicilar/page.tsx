import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminUsersList } from "@/components/admin/admin-users-list";
import { requireSuperAdminPage } from "@/lib/require-super-admin-page";
import { userService } from "@/services/user.service";

export const metadata = {
  title: "Kullanıcılar | Yönetim Paneli | DIO Implant",
};

export default async function AdminKullanicilarPage() {
  await requireSuperAdminPage();
  const initialUsers = await userService.listForAdmin();

  return (
    <AdminPanelShell title="Kullanıcılar" activeHref="/admin-panel/kullanicilar">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Panel kullanıcıları</div>
              <div className="admin-card__sub">
                Yönetim paneline giriş yapabilen hesaplar{" "}
                <code>users</code> tablosundan listelenir.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminUsersList initialUsers={initialUsers} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
