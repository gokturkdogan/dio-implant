import { AdminPanelShell } from "../../components/admin/admin-panel-shell";
import { PopupImageManager } from "../../components/admin/popup-image-manager";

export default function AdminPanelRoot() {
  return (
    <AdminPanelShell title="Popup Yönetimi" activeHref="/admin-panel">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Anasayfa Popup</div>
              <div className="admin-card__sub">
                Görsel + göster/gizle yönetimi
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <PopupImageManager />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
