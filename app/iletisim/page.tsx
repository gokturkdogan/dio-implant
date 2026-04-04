import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/common/footer";

export const metadata: Metadata = {
  title: "İletişim & Bayi Ağı | DIO Implant",
  description:
    "DIO Implant Türkiye genel merkez, bölge müdürlükleri ve yetkili bayi iletişim bilgileri.",
};

/* ───────── Mock Data ───────── */

const HQ = {
  name: "DIO Implant Türkiye Genel Merkez",
  address: "Esentepe Mah. Büyükdere Cad. No:201 Kat:8, Şişli / İstanbul",
  phone: "+90 212 555 00 00",
  email: "info@dioimplant.com.tr",
  hours: "Pazartesi – Cuma: 09:00 – 18:00 · Cumartesi: 09:00 – 13:00",
  mapUrl:
    "https://www.google.com/maps/dir/?api=1&destination=41.0766,29.0114",
};

const REGIONAL_OFFICES = [
  {
    name: "Marmara Bölge Müdürlüğü",
    coverage: ["İstanbul", "Kocaeli", "Bursa", "Tekirdağ", "Edirne", "Balıkesir"],
    phone: "+90 212 555 01 01",
    email: "marmara@dioimplant.com.tr",
    address: "Ataşehir Finans Merkezi, Kat:3, Ataşehir / İstanbul",
    mapUrl: "https://www.google.com/maps/dir/?api=1&destination=40.9923,29.1244",
  },
  {
    name: "İç Anadolu Bölge Müdürlüğü",
    coverage: ["Ankara", "Konya", "Eskişehir", "Kayseri", "Sivas"],
    phone: "+90 312 444 02 02",
    email: "icanadolu@dioimplant.com.tr",
    address: "Çankaya İş Merkezi, B Blok No:12, Çankaya / Ankara",
    mapUrl: "https://www.google.com/maps/dir/?api=1&destination=39.9208,32.8541",
  },
  {
    name: "Ege Bölge Müdürlüğü",
    coverage: ["İzmir", "Aydın", "Muğla", "Denizli", "Manisa"],
    phone: "+90 232 555 03 03",
    email: "ege@dioimplant.com.tr",
    address: "Alsancak İş Kuleleri, Kat:5, Konak / İzmir",
    mapUrl: "https://www.google.com/maps/dir/?api=1&destination=38.4347,27.1428",
  },
  {
    name: "Karadeniz Bölge Müdürlüğü",
    coverage: ["Trabzon", "Rize", "Artvin", "Ordu", "Samsun", "Giresun"],
    phone: "+90 462 555 04 04",
    email: "karadeniz@dioimplant.com.tr",
    address: "Forum Trabzon, Kat:2, Ortahisar / Trabzon",
    mapUrl: "https://www.google.com/maps/dir/?api=1&destination=41.0015,39.7178",
  },
];

const DEALERS = [
  {
    name: "Dental Medikal A.Ş.",
    region: "Antalya, Isparta, Burdur",
    contact: "Dr. Ahmet Yılmaz",
    phone: "+90 242 555 10 10",
    web: "https://dentalmedikal.com.tr",
  },
  {
    name: "Çukurova İmplant Ltd.",
    region: "Adana, Mersin, Hatay, Osmaniye",
    contact: "Mehmet Kara",
    phone: "+90 322 555 20 20",
    web: null,
  },
  {
    name: "Güneydoğu Dental",
    region: "Gaziantep, Şanlıurfa, Diyarbakır, Mardin",
    contact: "Fatma Demir",
    phone: "+90 342 555 30 30",
    web: "https://guneydogudental.com",
  },
  {
    name: "Trakya Medikal",
    region: "Edirne, Kırklareli, Tekirdağ",
    contact: "Burak Özkan",
    phone: "+90 284 555 40 40",
    web: null,
  },
  {
    name: "Doğu Dental Çözümleri",
    region: "Erzurum, Kars, Ağrı, Van",
    contact: "Elif Aydın",
    phone: "+90 442 555 50 50",
    web: "https://dogudental.com.tr",
  },
  {
    name: "Batı Akdeniz Dental",
    region: "Muğla, Burdur, Denizli",
    contact: "Serkan Kılıç",
    phone: "+90 252 555 60 60",
    web: null,
  },
];

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

function IconUser() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg className="ct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2Z" stroke="currentColor" strokeWidth="1.8"/>
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

/* ───────── Page ───────── */

export default function IletisimPage() {
  return (
    <>
      <main className="ct-page">
        {/* Hero — katalog sayfası ile aynı banner yapı */}
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

        {/* ────── KATMAN 1: Genel Merkez ────── */}
        <section className="ct-section ct-hq" id="genel-merkez" aria-labelledby="ct-hq-title">
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag"><span className="tag-line" /><span className="tag-text">Genel Merkez</span></div>
              <h2 id="ct-hq-title" className="ct-section-title">{HQ.name}</h2>
            </div>

            <div className="ct-hq-grid">
              <div className="ct-hq-info">
                <ul className="ct-detail-list">
                  <li><IconPin /><span>{HQ.address}</span></li>
                  <li><IconPhone /><a href={`tel:${HQ.phone.replace(/\s/g, "")}`}>{HQ.phone}</a></li>
                  <li><IconMail /><a href={`mailto:${HQ.email}`}>{HQ.email}</a></li>
                  <li><IconClock /><span>{HQ.hours}</span></li>
                </ul>

                <a href={HQ.mapUrl} target="_blank" rel="noopener noreferrer" className="ct-map-btn">
                  <IconMap /> Yol tarifi al
                </a>
              </div>

              <div className="ct-hq-map-shell">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3007.123!2d29.0114!3d41.0766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDA0JzM1LjgiTiAyOcKwMDAnNDEuMCJF!5e0!3m2!1str!2str!4v1"
                  className="ct-hq-map"
                  title="DIO Implant Genel Merkez Harita"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>

        {/* ────── KATMAN 2: Bölge Müdürlükleri ────── */}
        <section className="ct-section ct-section--alt ct-offices" id="bolge-mudurlukler" aria-labelledby="ct-offices-title">
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag"><span className="tag-line" /><span className="tag-text">Bölge Müdürlükleri</span></div>
              <h2 id="ct-offices-title" className="ct-section-title">Türkiye genelinde <em>4 bölge ofisi</em></h2>
              <p className="ct-section-lead">Her bölge müdürlüğü kendi sorumluluk alanındaki illere satış ve teknik destek sağlar.</p>
            </div>

            <div className="ct-offices-grid">
              {REGIONAL_OFFICES.map((office) => (
                <article key={office.name} className="ct-office-card">
                  <h3 className="ct-office-name">{office.name}</h3>
                  <div className="ct-office-coverage">
                    <IconRegion />
                    <span>{office.coverage.join(", ")}</span>
                  </div>
                  <ul className="ct-detail-list ct-detail-list--compact">
                    <li><IconPin /><span>{office.address}</span></li>
                    <li><IconPhone /><a href={`tel:${office.phone.replace(/\s/g, "")}`}>{office.phone}</a></li>
                    <li><IconMail /><a href={`mailto:${office.email}`}>{office.email}</a></li>
                  </ul>
                  <a href={office.mapUrl} target="_blank" rel="noopener noreferrer" className="ct-map-btn ct-map-btn--sm">
                    <IconMap /> Yol tarifi
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ────── KATMAN 3: Yetkili Bayiler ────── */}
        <section className="ct-section ct-dealers" id="yetkili-bayiler" aria-labelledby="ct-dealers-title">
          <div className="ct-inner">
            <div className="ct-section-head">
              <div className="section-tag"><span className="tag-line" /><span className="tag-text">Yetkili Bayiler</span></div>
              <h2 id="ct-dealers-title" className="ct-section-title">Bölgesel <em>çözüm ortaklarımız</em></h2>
              <p className="ct-section-lead">Yetkili bayilerimiz aracılığıyla ürün temini, teknik destek ve eğitim hizmetlerine ulaşabilirsiniz.</p>
            </div>

            <div className="ct-dealers-grid">
              {DEALERS.map((d) => (
                <article key={d.name} className="ct-dealer-card">
                  <h3 className="ct-dealer-name">{d.name}</h3>
                  <div className="ct-dealer-region">
                    <IconRegion />
                    <span>{d.region}</span>
                  </div>
                  <div className="ct-dealer-meta">
                    {d.contact ? <span className="ct-dealer-meta-item"><IconUser /> {d.contact}</span> : null}
                    <span className="ct-dealer-meta-item">
                      <IconPhone />
                      <a href={`tel:${d.phone.replace(/\s/g, "")}`}>{d.phone}</a>
                    </span>
                    {d.web ? (
                      <span className="ct-dealer-meta-item">
                        <IconGlobe />
                        <a href={d.web} target="_blank" rel="noopener noreferrer">{d.web.replace(/^https?:\/\//, "")}</a>
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
