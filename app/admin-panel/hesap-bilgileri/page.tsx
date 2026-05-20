import { AdminAccountPage } from "@/components/admin/admin-account-page";
import { AdminPanelShell } from "@/components/admin/admin-panel-shell";

export const metadata = {
  title: "Hesap Bilgileri | Yönetim Paneli | DIO Implant",
};

export default function AdminHesapBilgileriPage() {
  return (
    <AdminPanelShell title="Hesap Bilgileri" activeHref="/admin-panel/hesap-bilgileri">
      <AdminAccountPage />
    </AdminPanelShell>
  );
}
