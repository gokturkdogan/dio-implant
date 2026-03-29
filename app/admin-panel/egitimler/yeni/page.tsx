import { TrainingEventEditor } from "../../../../components/admin/training-event-editor";
import { AdminPanelShell } from "../../../../components/admin/admin-panel-shell";

export const metadata = {
  title: "Yeni eğitim | Yönetim Paneli | DIO Implant",
};

export default function AdminEgitimYeniPage() {
  return (
    <AdminPanelShell title="Yeni eğitim" activeHref="/admin-panel/egitimler">
      <div className="admin-grid admin-grid--wide">
        <TrainingEventEditor mode="create" />
      </div>
    </AdminPanelShell>
  );
}
