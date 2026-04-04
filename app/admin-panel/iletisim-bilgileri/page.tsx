import { AdminPanelShell } from "@/components/admin/admin-panel-shell";
import { AdminSiteContactForm } from "@/components/admin/admin-site-contact-form";
import type { SiteContact } from "@/db/schema/site-contact";
import { siteContactService } from "@/services/site-contact.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "İletişim bilgileri | Yönetim Paneli | DIO Implant",
};

const EMPTY_CONTACT: SiteContact = {
  id: 1,
  companyName: "",
  centerLabel: "",
  address: "",
  phone: "",
  email: "",
  hours: "",
  mapDirectionsUrl: "",
  mapEmbedUrl: "",
  updatedAt: new Date(0),
};

export default async function AdminIletisimBilgileriPage() {
  const row = await siteContactService.get();
  const initial = row ?? EMPTY_CONTACT;

  return (
    <AdminPanelShell title="İletişim bilgileri" activeHref="/admin-panel/iletisim-bilgileri">
      <div className="admin-grid">
        <div className="admin-card">
          <div className="admin-card__head">
            <div>
              <div className="admin-card__title">Genel merkez</div>
              <div className="admin-card__sub">
                Tek kayıt: <code>site_contact</code> tablosu (id=1). Değişiklikler doğrudan{" "}
                <a href="/iletisim" target="_blank" rel="noopener noreferrer">
                  iletişim sayfasına
                </a>{" "}
                yansır.
              </div>
            </div>
          </div>
          <div className="admin-card__body">
            <AdminSiteContactForm initial={initial} />
          </div>
        </div>
      </div>
    </AdminPanelShell>
  );
}
