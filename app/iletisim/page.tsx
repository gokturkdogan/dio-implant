import type { Metadata } from "next";
import { Footer } from "@/components/common/footer";
import { ContactDealerMapPanel } from "@/components/contact/contact-dealer-map-panel";
import { authorizedDealerService } from "@/services/authorized-dealer.service";
import { regionalOfficeService } from "@/services/regional-office.service";
import { siteContactService } from "@/services/site-contact.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "İletişim & Bayi Ağı | DIO Implant",
  description:
    "DIO Implant Türkiye genel merkez, bölge müdürlükleri ve yetkili bayi iletişim bilgileri.",
};

function isDirectionsUrl(s: string) {
  const t = s.trim();
  return t.startsWith("http://") || t.startsWith("https://");
}

function isEmbedUrl(s: string) {
  return s.trim().startsWith("https://");
}

/* ───────── Icons ───────── */

function IconPin() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" fill="currentColor"/>
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconMail() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="m2 7 10 6 10-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconMap() {
  return (
    <svg className="ct-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRegion() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 2v16M16 6v16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

export default async function IletisimPage() {
  const [contact, offices, dealers] = await Promise.all([
    siteContactService.get(),
    regionalOfficeService.listAll(),
    authorizedDealerService.listAll(),
  ]);

  const hqTitle = contact?.companyName?.trim() || "Genel merkez";
  const centerLabel = contact?.centerLabel?.trim() ?? "";
  const hqAddress = contact?.address?.trim() ?? "";
  const hqPhone = contact?.phone?.trim() ?? "";
  const hqEmail = contact?.email?.trim() ?? "";
  const hqHours = contact?.hours?.trim() ?? "";
  const mapDirections = contact?.mapDirectionsUrl?.trim() ?? "";
  const mapEmbed = contact?.mapEmbedUrl?.trim() ?? "";

  return (
    <>
      <main className="ct-page">
        <section className="ct-hero">
          <div className="ct-hero-inner">
            <div className="ct-hero-copy">
              <p className="ct-eyebrow">İletişim & Bayi Ağı</p>
              <h1>Size en yakın <em>DIO Implant</em> noktası</h1>
              <p>Genel merkez, bölge müdürlükleri ve yetkili bayilerimiz ile Türkiye genelinde yanınızdayız.</p>
            </div>
            <div className="ct-hero-actions">
              <a href="#genel-merkez" className="ct-hero-btn ct-hero-btn--primary">Genel Merkez</a>
              <a href="#bolge-mudurlukler" className="ct-hero-btn ct-hero-btn--ghost">Bölge Ofisleri</a>
              <a href="#yetkili-bayiler" className="ct-hero-btn ct-hero-btn--ghost">Yetkili Bayiler</a>
            </div>
          </div>
        </section>

        <section className="ct-section ct-hq" id="genel-merkez" aria-labelledby="ct-hq-title">
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag"><span className="tag-line" /><span className="tag-text">Genel Merkez</span></div>
              <h2 id="ct-hq-title" className="ct-section-title">{hqTitle}</h2>
              {centerLabel ? <p className="ct-hq-center-label">{centerLabel}</p> : null}
            </div>

            <div className="ct-hq-grid">
              <div className="ct-hq-info">
                <ul className="ct-detail-list">
                  {hqAddress ? (
                    <li><IconPin /><span>{hqAddress}</span></li>
                  ) : null}
                  {hqPhone ? (
                    <li><IconPhone /><a href={`tel:${hqPhone.replace(/\s/g, "")}`}>{hqPhone}</a></li>
                  ) : null}
                  {hqEmail ? (
                    <li><IconMail /><a href={`mailto:${hqEmail}`}>{hqEmail}</a></li>
                  ) : null}
                  {hqHours ? (
                    <li><IconClock /><span>{hqHours}</span></li>
                  ) : null}
                </ul>

                {!hqAddress && !hqPhone && !hqEmail && !hqHours ? (
                  <p className="ct-empty-inline">İletişim bilgileri yönetim panelinden eklenebilir.</p>
                ) : null}

                {isDirectionsUrl(mapDirections) ? (
                  <a href={mapDirections} target="_blank" rel="noopener noreferrer" className="ct-map-btn">
                    <IconMap /> Yol tarifi al
                  </a>
                ) : null}
              </div>

              <div className="ct-hq-map-shell">
                {isEmbedUrl(mapEmbed) ? (
                  <iframe
                    src={mapEmbed}
                    className="ct-hq-map"
                    title="Genel merkez haritası"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                ) : (
                  <div className="ct-hq-map ct-hq-map--placeholder" role="img" aria-label="Harita önizlemesi yok" />
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="ct-section ct-section--alt ct-offices" id="bolge-mudurlukler" aria-labelledby="ct-offices-title">
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag"><span className="tag-line" /><span className="tag-text">Bölge Müdürlükleri</span></div>
              <h2 id="ct-offices-title" className="ct-section-title">
                Türkiye genelinde <em>{offices.length} bölge ofisi</em>
              </h2>
              <p className="ct-section-lead">Her bölge müdürlüğü kendi sorumluluk alanındaki illere satış ve teknik destek sağlar.</p>
            </div>

            {offices.length === 0 ? (
              <p className="ct-empty-block">Henüz kayıtlı bölge ofisi yok.</p>
            ) : (
              <div className="ct-offices-grid">
                {offices.map((office) => (
                  <article key={office.id} className="ct-office-card">
                    <h3 className="ct-office-name">{office.name}</h3>
                    <div className="ct-office-coverage">
                      <IconRegion />
                      <span>{office.coverage}</span>
                    </div>
                    <ul className="ct-detail-list ct-detail-list--compact">
                      <li><IconPin /><span>{office.address}</span></li>
                      <li><IconPhone /><a href={`tel:${office.phone.replace(/\s/g, "")}`}>{office.phone}</a></li>
                      <li><IconMail /><a href={`mailto:${office.email}`}>{office.email}</a></li>
                    </ul>
                    {isDirectionsUrl(office.mapDirectionsUrl) ? (
                      <a href={office.mapDirectionsUrl} target="_blank" rel="noopener noreferrer" className="ct-map-btn ct-map-btn--sm">
                        <IconMap /> Yol tarifi
                      </a>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="ct-section ct-dealers" id="yetkili-bayiler" aria-labelledby="ct-dealers-title">
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag"><span className="tag-line" /><span className="tag-text">Yetkili Bayiler</span></div>
              <h2 id="ct-dealers-title" className="ct-section-title">Bölgesel <em>çözüm ortaklarımız</em></h2>
              <p className="ct-section-lead">
                {dealers.length === 0
                  ? "Henüz kayıtlı yetkili bayi bulunmuyor."
                  : "Detaylar için lütfen herhangi bir şehre tıklayınız."}
              </p>
            </div>

            <ContactDealerMapPanel
              dealers={dealers.map((d) => ({
                id: d.id,
                name: d.name,
                phone: d.phone,
                contactPerson: d.contactPerson ?? null,
                color: d.color ?? null,
                provinceCodes: (d.provinces ?? []).map((p) => p.code),
                website: d.website ?? null,
                serviceRegion: d.serviceRegion,
                provinces: (d.provinces ?? []).map((p) => ({
                  code: p.code,
                  name: p.name,
                })),
              }))}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
