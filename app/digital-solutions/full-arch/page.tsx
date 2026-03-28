import type { Metadata } from "next";
import { Footer } from "../../../components/common/footer";
import { FullArchHero } from "../../../components/dio-navi/full-arch-hero";
import { FullArchEnhancements } from "../../../components/dio-navi/full-arch-enhancements";

export const metadata: Metadata = {
  title: "DIO NAVI Full Arch | DIO Implant",
  description:
    "Dijital edentül rehabilitasyon: DIO NAVI Full Arch ile tam çene implant-protez iş akışı, kılavuzlu cerrahi ve öngörülebilir sonuçlar.",
};

type WorkflowIconId =
  | "planning"
  | "design"
  | "guide"
  | "position"
  | "provisional"
  | "final";

const WORKFLOW_STEPS: {
  title: string;
  body: string;
  icon: WorkflowIconId;
}[] = [
  {
    title: "Dijital planlama",
    body: "Tomografi ve tarama ile 3D model.",
    icon: "planning",
  },
  {
    title: "Protez tasarımı",
    body: "Hedef gülüş ve oklüzyon simülasyonu.",
    icon: "design",
  },
  {
    title: "Cerrahi kılavuz",
    body: "Kişiye özel guide üretimi.",
    icon: "guide",
  },
  {
    title: "İmplant pozisyonu",
    body: "Önceden tanımlı açı ve derinlik.",
    icon: "position",
  },
  {
    title: "Geçici protez",
    body: "Aynı gün veya erken yükleme seçenekleri.",
    icon: "provisional",
  },
  {
    title: "Final restorasyon",
    body: "Definitif köprü ve kontroller.",
    icon: "final",
  },
];

function FaWorkflowStepIcon({ id }: { id: WorkflowIconId }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "planning":
      return (
        <svg {...common}>
          <path d="M12 2 2 7l10 5 10-5-10-5Z" />
          <path d="m2 12 10 5 10-5" />
          <path d="m2 17 10 5 10-5" />
        </svg>
      );
    case "design":
      return (
        <svg {...common}>
          <path d="M12 19h7" />
          <path d="m16.5 3.5 4.5 4.5a2.1 2.1 0 0 1 0 3l-9.5 9.5L5 21l.5-6.5 9.5-9.5a2.1 2.1 0 0 1 3 0Z" />
        </svg>
      );
    case "guide":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
        </svg>
      );
    case "position":
      return (
        <svg {...common}>
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "provisional":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    case "final":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
  }
}

export default function FullArchPage() {
  return (
    <>
      <FullArchEnhancements />
      <main className="fa-page">
        <FullArchHero />

        <section
          className="fa-section fa-section--alt"
          id="fullarch-intro"
          aria-labelledby="fa-intro-title"
        >
          <div className="fa-inner">
            <div className="fa-intro-grid">
              <div data-fa-animate>
                <div className="section-tag fa-section-tag">
                  <span className="tag-line" />
                  <span className="tag-text">Full Arch rehber sistemi</span>
                </div>
                <h2 id="fa-intro-title" className="fa-section-title">
                  Tüm süreci <em>dijital</em> planlayın
                </h2>
                <p className="fa-prose">
                  DIO NAVI Full Arch; implant yerleşimi, protez bağlantı planı ve
                  laboratuvar aşamalarını aynı dijital hatta birleştirir. Ekstraoral
                  tarama ve tasarım verileriyle final restorasyon üretimine kadar
                  izlenebilir bir akış sunar.
                </p>
                <p className="fa-prose">
                  Klinik senaryoya uygun geçici ve definitif protez seçenekleriyle
                  hekim ve hasta için öngörülebilir bir tedavi yolu hedeflenir.
                </p>
              </div>
              <div className="fa-intro-visual" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-system-banner.webp"
                  alt="DIO NAVI Full Arch rehber sistemi — dijital planlama ve bileşenler"
                  width={1600}
                  height={900}
                  decoding="async"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="fa-section fa-section--dark" aria-labelledby="fa-dark-title">
          <div className="fa-inner">
            <div className="fa-showcase-grid">
              <div data-fa-animate>
                <div className="section-tag fa-section-tag">
                  <span className="tag-line" />
                  <span className="tag-text">Teknik derinlik</span>
                </div>
                <h2 id="fa-dark-title" className="fa-section-title">
                  Anatomi ile <em>uyumlu</em> plan
                </h2>
                <p className="fa-prose">
                  Çene kemği ve protez bileşenlerinin birlikte modellenmesi, implant
                  dağılımı ve oklüzal hedeflerin aynı sahnede değerlendirilmesini
                  sağlar.
                </p>
              </div>
              <div className="fa-showcase-img fa-glow-ring" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-tech-1.webp"
                  alt="Full Arch teknik derinlik — implant ve çene planlama görselleştirmesi"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <div className="fa-showcase-grid" style={{ marginTop: "3rem" }}>
              <div className="fa-showcase-img" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-tech-2.webp"
                  alt="Full Arch teknik derinlik — anatomi ve protez ilişkisi"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div data-fa-animate>
                <h3 className="fa-section-title" style={{ fontSize: "1.35rem" }}>
                  Şeffaf anatomi, net <em>hedef</em>
                </h3>
                <p className="fa-prose">
                  Görsel iletişimde kemik, yumuşak doku ve protez ilişkisi hasta ve
                  ekip için anlaşılır hale gelir; dijital planın klinik uygulamaya
                  köprüsü güçlenir.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="fa-section" aria-labelledby="fa-features-title">
          <div className="fa-inner">
            <div data-fa-animate>
              <div className="section-tag">
                <span className="tag-line" />
                <span className="tag-text">Öne çıkanlar</span>
              </div>
              <h2 id="fa-features-title" className="fa-section-title">
                Neden{" "}
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/dio-navi-full-arch-logo.webp"
                  alt="Full Arch"
                  className="fa-features-title-logo"
                  width={280}
                  height={56}
                  decoding="async"
                  loading="lazy"
                />
                ?
              </h2>
              <p className="fa-prose">
                Dijital planlama, kılavuz destekli cerrahi ve modüler protez
                bileşenleriyle tam çene vakalarında tekrarlanabilir protokoller.
              </p>
            </div>

            <div className="fa-features">
              <article className="fa-feature" data-fa-animate>
                <div className="fa-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3>Uçtan uca dijital</h3>
                <p>Tarama, plan, guide ve restorasyon verisi tek çizgide ilerler.</p>
              </article>
              <article className="fa-feature" data-fa-animate>
                <div className="fa-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <h3>Öngörülebilir süre</h3>
                <p>Önceden tanımlı implant ve protez adımları ile planlı ilerleme.</p>
              </article>
              <article className="fa-feature" data-fa-animate>
                <div className="fa-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                  </svg>
                </div>
                <h3>Kılavuzlu hassasiyet</h3>
                <p>3D baskı cerrahi rehber ile pozisyon ve açı kontrolü.</p>
              </article>
              <article className="fa-feature" data-fa-animate>
                <div className="fa-feature-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                  </svg>
                </div>
                <h3>Hasta deneyimi</h3>
                <p>Daha az invaziv protokollerle konfor ve güven odaklı yaklaşım.</p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="fa-section fa-section--dark fa-section--workflow"
          aria-labelledby="fa-flow-title"
        >
          <div className="fa-inner">
            <div data-fa-animate>
              <div className="section-tag fa-section-tag">
                <span className="tag-line" />
                <span className="tag-text">İş akışı</span>
              </div>
              <h2
                id="fa-flow-title"
                className="fa-section-title fa-section-title--workflow-logo"
              >
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/dio-navi-full-arch-light-logo.webp"
                  alt="DIO NAVI Full Arch"
                  className="fa-workflow-title-logo"
                  width={360}
                  height={72}
                  decoding="async"
                  loading="lazy"
                />{" "}
                <em>adımları</em>
              </h2>
              <p className="fa-prose">
                Tipik bir dijital Full Arch protokolünde izlenen fazların özeti.
                Klinik protokol hekim tercihine göre değişebilir.
              </p>
            </div>
            <div className="fa-workflow">
              {WORKFLOW_STEPS.map((step) => (
                <div key={step.title} className="fa-workflow-step" data-fa-animate>
                  <div className="fa-workflow-step-icon">
                    <FaWorkflowStepIcon id={step.icon} />
                  </div>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="fa-section fa-section--alt" aria-labelledby="fa-bento-title">
          <div className="fa-inner">
            <div data-fa-animate>
              <div className="section-tag">
                <span className="tag-line" />
                <span className="tag-text">Sistem bileşenleri</span>
              </div>
              <h2 id="fa-bento-title" className="fa-section-title">
                Laboratuvardan <em>cerrahiye</em>
              </h2>
            </div>
            <div className="fa-bento">
              <div className="fa-bento-cell fa-bento-cell--tall" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-components-1.webp"
                  alt="Full Arch sistem bileşenleri — genel görünüm"
                  width={900}
                  height={1100}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="fa-bento-cell" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-components-2.webp"
                  alt="Full Arch sistem bileşenleri — ürün seti ve kılavuz"
                  width={800}
                  height={520}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="fa-bento-cell" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-components-3.webp"
                  alt="Full Arch sistem bileşenleri — laboratuvar ve parçalar"
                  width={800}
                  height={520}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="fa-section" aria-labelledby="fa-split-title">
          <div className="fa-inner">
            <div className="fa-intro-grid">
              <div className="fa-intro-visual" data-fa-animate>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-bridge.webp"
                  alt="Full Arch protez entegrasyonu — köprü ve bağlantı tasarımı"
                  width={1200}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div data-fa-animate>
                <div className="section-tag">
                  <span className="tag-line" />
                  <span className="tag-text">Protez entegrasyonu</span>
                </div>
                <h2 id="fa-split-title" className="fa-section-title">
                  Köprü ve bağlantı <em>tasarımı</em>
                </h2>
                <p className="fa-prose">
                  Abutment ve üst yapı seçenekleri, vaka tipine göre modüler
                  planlanır; geçici ve definitif fazlar arasında süreklilik korunur.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
