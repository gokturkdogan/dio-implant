import { AdminDigitalLibraryManager } from "@/components/admin/admin-digital-library-manager";
import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { digitalLibraryService } from "@/services/digital-library.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dijital kütüphane | Yönetim Paneli | DIO Implant",
};

export default async function AdminDijitalKutuphanePage() {
  const row = await digitalLibraryService.get();

  return (
    <AdminPanelShell
      title="Dijital kütüphane"
      activeHref="/admin-panel/dijital-kutuphane"
    >
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">İndirme bağlantıları</div>
              <div className="admin-card__sub">
                <code>/dijital-kutuphane</code> sayfasındaki ZIP ve PPT
                butonları bu adreslere gider. Veritabanı tablosu:{" "}
                <code>digital_library</code>.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminDigitalLibraryManager
              initialZipUrl={row?.zipUrl ?? ""}
              initialPptUrl={row?.pptUrl ?? ""}
            />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
