import { TrainingEventsList } from "../../../components/admin/training-events-list";
import { AdminPanelShell } from "../../../components/admin/admin-panel-shell";
import { getTrainingEventsSorted } from "../../../lib/academy-training-events";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eğitimler | Yönetim Paneli | DIO Implant",
};

export default async function AdminEgitimlerPage() {
  const events = await getTrainingEventsSorted();

  return (
    <AdminPanelShell title="Eğitimler" activeHref="/admin-panel/egitimler">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Eğitim takvimi</div>
              <div className="admin-card__sub">
                Kayıtlar veritabanındaki <code>seminars</code> tablosundan
                okunur.
              </div>
            </div>
            <a
              className="admin-btn admin-btn--secondary"
              href="/dio-akademi/egitim-takvimi"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canlı sayfayı aç
            </a>
          </div>

          <div className="admin-card__body">
            <TrainingEventsList initialEvents={events} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
