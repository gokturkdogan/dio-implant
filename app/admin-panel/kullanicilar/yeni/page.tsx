import Link from "next/link";
import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminInviteUserForm } from "@/components/admin/admin-invite-user-form";
import { requireSuperAdminPage } from "@/lib/require-super-admin-page";

export const metadata = {
  title: "Yeni kullanıcı | Yönetim Paneli | DIO Implant",
};

export default async function AdminYeniKullaniciPage() {
  await requireSuperAdminPage();

  return (
    <AdminPanelShell
      title="Yeni kullanıcı"
      activeHref="/admin-panel/kullanicilar"
    >
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Kullanıcı daveti</div>
              <div className="admin-card__sub">
                Ad, soyad ve e-posta ile davet gönderin. Kullanıcı e-postadaki
                bağlantıdan parolasını belirler.
              </div>
            </div>
            <Link
              href="/admin-panel/kullanicilar"
              className="admin-btn admin-btn--ghost admin-card__head-action"
            >
              ← Kullanıcılar
            </Link>
          </div>
          <div className="admin-card__body">
            <AdminInviteUserForm />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
