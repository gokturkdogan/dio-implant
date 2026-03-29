import { notFound } from "next/navigation";
import { TrainingEventEditor } from "../../../../../components/admin/training-event-editor";
import { AdminPanelShell } from "../../../../../components/admin/admin-panel-shell";
import { getTrainingBySlug } from "../../../../../lib/academy-training-events";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const ev = await getTrainingBySlug(decodeURIComponent(slug));
  return {
    title: ev
      ? `Düzenle: ${ev.title} | Yönetim Paneli | DIO Implant`
      : "Eğitim düzenle | Yönetim Paneli | DIO Implant",
  };
}

export default async function AdminEgitimDuzenlePage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const ev = await getTrainingBySlug(slug);
  if (!ev) notFound();

  return (
    <AdminPanelShell title="Eğitimi düzenle" activeHref="/admin-panel/egitimler">
      <div className="admin-grid admin-grid--wide">
        <TrainingEventEditor mode="edit" initialEvent={ev} originalSlug={ev.slug} />
      </div>
    </AdminPanelShell>
  );
}
