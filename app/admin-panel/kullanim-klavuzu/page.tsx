import { AdminUsageGuide } from "@/components/admin/admin-usage-guide";
import { AdminPanelShell } from "@/components/admin/admin-panel-shell";

export const metadata = {
  title: "Kullanım kılavuzu | Yönetim Paneli | DIO Implant",
};

export default function AdminKullanimKlavuzuPage() {
  return (
    <AdminPanelShell title="Kullanım kılavuzu" activeHref="/admin-panel/kullanim-klavuzu">
      <AdminUsageGuide />
    </AdminPanelShell>
  );
}
