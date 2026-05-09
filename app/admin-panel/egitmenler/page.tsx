import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { InstructorsList } from "@/components/admin/instructors-list";
import { instructorService } from "@/services/instructor.service";

export default async function AdminEgitmenlerPage() {
  const initialInstructors = await instructorService.listAll();

  return (
    <AdminPanelShell title="Eğitmenler" activeHref="/admin-panel/egitmenler">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Eğitmen kütüphanesi</div>
              <div className="admin-card__sub">
                Kayıtlar veritabanındaki <code>instructors</code> tablosunda tutulur;
                görseller Cloudinary üzerinde <code>Instructors</code> kökünde her kayıt
                için <code>id</code> ile ayrı klasörde saklanır. Eğitim formlarında
                konuşmacı seçmek için kullanılır.
              </div>
            </div>
          </div>

          <div className="admin-card__body">
            <InstructorsList initialInstructors={initialInstructors} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
