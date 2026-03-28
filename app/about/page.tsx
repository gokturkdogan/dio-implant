import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AboutTimeline } from "../../components/about/about-timeline";
import { Footer } from "../../components/common/footer";

export const metadata: Metadata = {
  title: "Hakkımızda | DIO Implant",
  description:
    "DIO Implant: dijital diş hekimliği ve implant teknolojilerinde küresel deneyim, Ar-Ge odaklı üretim ve güvenilir çözüm ortaklığı.",
};

export default function AboutPage() {
  return (
    <>
      <main className="about-page">
        <section className="ab-hero" aria-labelledby="ab-hero-title">
          <div className="ab-hero-bg" aria-hidden="true">
            <Image
              src="https://res.cloudinary.com/drjz8v617/image/upload/aboutus-banner.webp"
              alt=""
              fill
              className="ab-hero-bg-img"
              sizes="100vw"
              priority
            />
          </div>
          <div className="ab-hero-overlay" aria-hidden="true" />
          <div className="ab-inner ab-hero-grid">
            <div>
              <div className="ab-hero-badge">
                <span className="ab-hero-badge-dot" aria-hidden="true" />
                <span>Hakkımızda</span>
              </div>
              <h1 id="ab-hero-title" className="ab-hero-title">
                İmplant ve dijital cerrahide <em>küresel ortağınız</em>
              </h1>
              <p className="ab-hero-lead">
                Güvenilir implant sistemleri, güçlü Ar-Ge ve dünya çapında
                destek.
              </p>
            </div>
          </div>
        </section>

        <div className="ab-inner ab-stats">
          <div className="ab-stats-row" role="list">
            <div className="ab-stat" role="listitem">
              <strong>35+</strong>
              <span>Yıllık sektör deneyimi</span>
            </div>
            <div className="ab-stat" role="listitem">
              <strong>70+</strong>
              <span>Ülkede varlık</span>
            </div>
            <div className="ab-stat" role="listitem">
              <strong>Ar-Ge</strong>
              <span>Sürekli ürün geliştirme</span>
            </div>
            <div className="ab-stat" role="listitem">
              <strong>DIO NAVI</strong>
              <span>Dijital cerrahi ekosistemi</span>
            </div>
          </div>
        </div>

        <section
          className="ab-section ab-section--alt"
          id="our-story"
          aria-labelledby="ab-story-title"
        >
          <div className="ab-inner">
            <div className="ab-story-grid">
              <div className="ab-story-col">
                <div className="ab-section-head ab-section-head--in-story">
                  <div className="section-tag">
                    <span className="tag-line" />
                    <span className="tag-text">Hikayemiz</span>
                  </div>
                  <h2 id="ab-story-title" className="ab-section-title">
                    Güven ve <em>teknoloji</em> odaklı büyüme
                  </h2>
                  <p className="ab-section-lead">
                    Kurulduğu günden bu yana DIO; titanyum implant sistemleri,
                    cerrahi setler, protez bileşenleri ve dijital planlama
                    çözümleriyle diş hekimliğinin dönüşümüne katkı sağlar.
                  </p>
                </div>
                <div className="ab-story-body">
                  <p>
                    Güney Kore merkezli küresel bir implant üreticisi olarak,
                    dünya genelinde klinik ihtiyaçlara uygun ürün portföyü ve
                    eğitim desteği sunarız. Hedefimiz; hekimlere tekrarlanabilir
                    cerrahi akışlar, hastalara ise uzun ömürlü ve estetik
                    sonuçlar kazandırmaktır.
                  </p>
                  <p>
                    Yüzey teknolojileri, dijital iş akışları ve klinik veriye
                    dayalı geliştirme anlayışımız; ürünlerimizin güvenlik ve
                    performans beklentileriyle uyumlu olmasını sağlar.
                  </p>
                </div>
              </div>
              <div className="ab-story-visuals">
                <div className="ab-story-visuals__ambient" aria-hidden="true" />
                <div className="ab-story-pin ab-story-pin--global">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/aboutus-float-1.png"
                    alt="Küresel ağ ve dijital bağlantı"
                    width={400}
                    height={520}
                    decoding="async"
                  />
                </div>
                <div className="ab-story-pin ab-story-pin--hq">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/aboutus-float-2.png"
                    alt="DIO Implant merkez ofis"
                    width={280}
                    height={360}
                    decoding="async"
                  />
                </div>
                <div className="ab-story-pin ab-story-pin--mark" aria-hidden="true">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/aboutus-float-3.png"
                    alt=""
                    width={192}
                    height={192}
                    decoding="async"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <AboutTimeline />

        <section
          className="ab-section ab-section--why"
          aria-labelledby="ab-pillars-title"
        >
          <div className="ab-inner">
            <div className="ab-section-head">
              <div className="section-tag">
                <span className="tag-line" />
                <span className="tag-text">Odak alanlarımız</span>
              </div>
              <h2
                id="ab-pillars-title"
                className="ab-section-title ab-section-title--with-inline-logo"
              >
                <span className="ab-section-title__lead">Neden</span>
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/dio-logo-original.webp"
                  alt="DIO"
                  className="ab-section-title__logo"
                  width={140}
                  height={40}
                  decoding="async"
                />
                <span className="ab-section-title__q" aria-hidden="true">
                  ?
                </span>
              </h2>
            </div>
            <div className="ab-pillars">
              <article className="ab-pillar">
                <div className="ab-pillar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                </div>
                <h3>Küresel ağ</h3>
                <p>
                  Dünya çapında dağıtım ve destek yapısıyla kliniklere yerel
                  ihtiyaçlara uygun çözümler sunarız.
                </p>
              </article>
              <article className="ab-pillar">
                <div className="ab-pillar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <h3>Ar-Ge ve kalite</h3>
                <p>
                  Materyal bilimi, yüzey işlemleri ve klinik geri bildirimle
                  sürekli iyileştirilen implant sistemleri geliştiririz.
                </p>
              </article>
              <article className="ab-pillar">
                <div className="ab-pillar-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <h3>Dijital cerrahi</h3>
                <p>
                  DIO NAVI ile planlama ve kılavuzlu cerrahide dijital iş
                  akışını uçtan uca destekleriz.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="ab-cta" aria-labelledby="ab-cta-title">
          <div className="ab-cta-bg" aria-hidden="true" />
          <div className="ab-inner ab-cta-inner">
            <div className="ab-cta-text">
              <h2 id="ab-cta-title">Dijital implantoloji ile tanışın</h2>
              <p>
                DIO NAVI; tam dijital planlama ve kılavuzlu cerrahi ile
                hassasiyeti artırır, operasyon süresini optimize eder ve hasta
                konforunu öne alır.
              </p>
            </div>
            <Link href="/digital-solutions/dio-navi" className="btn btn-primary">
              <span>DIO NAVI&apos;yi inceleyin</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>

        <section
          className="ab-section ab-section--alt"
          aria-labelledby="ab-values-title"
        >
          <div className="ab-inner">
            <div className="ab-section-head">
              <div className="section-tag">
                <span className="tag-line" />
                <span className="tag-text">Değerlerimiz</span>
              </div>
              <h2 id="ab-values-title" className="ab-section-title">
                Çalışma <em>ilkelerimiz</em>
              </h2>
            </div>
            <div className="ab-values">
              <div className="ab-value">
                <div className="ab-value-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </div>
                <div>
                  <h4>Hasta ve hekim önceliği</h4>
                  <p>
                    Kararlarımızı klinik güvenlik, öngörülebilir sonuçlar ve
                    sürdürülebilir bakım üzerine kurarız.
                  </p>
                </div>
              </div>
              <div className="ab-value">
                <div className="ab-value-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                </div>
                <div>
                  <h4>Şeffaf iletişim</h4>
                  <p>
                    Ürün bilgisi, eğitim ve teknik destekte net, erişilebilir
                    kanallar sunarız.
                  </p>
                </div>
              </div>
              <div className="ab-value">
                <div className="ab-value-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div>
                  <h4>Sürekli öğrenme</h4>
                  <p>
                    Akademi ve saha geri bildirimiyle bilgiyi paylaşır,
                    uygulamayı geliştiririz.
                  </p>
                </div>
              </div>
              <div className="ab-value">
                <div className="ab-value-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div>
                  <h4>Uzun vadeli ortaklık</h4>
                  <p>
                    Bayi ve kliniklerle uzun soluklu iş birlikleri kurarak
                    büyümeyi birlikte planlarız.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
