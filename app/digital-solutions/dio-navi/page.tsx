import Link from "next/link";
import { Footer } from "../../../components/common/footer";
import { DioNaviEnhancements } from "../../../components/dio-navi/dio-navi-enhancements";

export default function DioNaviPage() {
  return (
    <>
      <DioNaviEnhancements />
      <main className="navi-page">
      <section className="np-hero" aria-labelledby="np-hero-title">
        <div className="np-hero-media">
          <video
            autoPlay
            muted
            loop
            playsInline
            poster="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner-bg.webp"
          >
            <source
              src="https://res.cloudinary.com/drjz8v617/video/upload/dionavi-banner-video.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="np-hero-overlay" aria-hidden="true" />
        <div
          className="np-hero-particles"
          id="npHeroParticles"
          aria-hidden="true"
        />

        <div className="np-inner np-hero-grid">
          <div className="np-hero-content">
            <div className="np-hero-badge">
              <span className="np-hero-badge-dot" aria-hidden="true" />
              <span>%100 Dijital Cerrahi Teknolojisi</span>
            </div>
            <h1 id="np-hero-title" className="np-hero-title">
              <span className="np-hero-title-sub">
                Geleceğin İmplant Teknolojisi
              </span>
              <img
                src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-logo-light.webp"
                alt="DIO NAVI"
                className="np-logo-hero"
              />
            </h1>
            <p className="np-hero-lead">
              Dikişsiz ve hatasız implant deneyimi. Ağrısız, hızlı ve güvenli
              gülüşler için tam dijital cerrahi planlama ve kılavuz sistemi.
            </p>
          </div>

          <div className="np-hero-right">
            <div className="np-hero-stats">
              <div className="np-hero-stat">
                <strong>%98</strong>
                <span>Hassasiyet</span>
              </div>
              <div className="np-hero-stat-div" aria-hidden="true" />
              <div className="np-hero-stat">
                <strong>3D</strong>
                <span>Planlama</span>
              </div>
              <div className="np-hero-stat-div" aria-hidden="true" />
              <div className="np-hero-stat">
                <strong>Flapless</strong>
                <span>Dikişsiz cerrahi</span>
              </div>
            </div>

            <div className="np-hero-actions">
              <a href="#nedir" className="btn btn-primary">
                <span>Keşfet</span>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="/bize-ulasin" className="btn np-btn-ghost">
                Bilgi Alın
              </a>
            </div>
          </div>
        </div>

        <div className="np-hero-scroll" aria-hidden="true">
          <div className="np-scroll-mouse">
            <div className="np-scroll-dot" />
          </div>
          <span>KEŞFET</span>
        </div>
      </section>

      <section className="np-section np-about" id="nedir">
        <div className="np-inner np-about-grid">
          <div className="np-about-text" data-animate>
            <div className="section-tag">
              <span className="tag-line" />
              <span className="tag-text">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-logo-dark.webp"
                  alt="DIO NAVI"
                  className="np-logo-tag"
                />{" "}
                Nedir?
              </span>
            </div>
            <h2 className="np-section-title">
              İmplant cerrahisinde <em className="text-gradient">dijital devrim</em>
            </h2>
            <p className="np-prose">
              DIOnavi, implant yerleştirme sürecini dijital ortamda planlayan ve
              cerrahi operasyonu kişiye özel hazırlanan rehberler (guide)
              aracılığıyla gerçekleştiren gelişmiş bir navigasyon sistemidir.
            </p>
            <p className="np-prose">
              Klasik yöntemlerin aksine, operasyon öncesinde bilgisayar üzerinde
              yapılan simülasyon sayesinde hata payı sıfıra indirilir.
            </p>
          </div>

          <figure className="np-about-figure" data-animate>
            <img
              src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-what.webp"
              alt="DIO NAVI dijital cerrahi planlama ekranı"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="np-cta-bar">
        <div className="np-inner np-cta-inner">
          <div className="np-cta-copy">
            <h2 className="np-cta-title">
              <img
                src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-logo-light.webp"
                alt="DIO NAVI"
                className="np-logo-inline np-logo-inline-light"
              />{" "}
              hakkında bilgi alın
            </h2>
            <p className="np-cta-desc">
              Uygulama süreçleri ve eğitim talepleriniz için bizimle iletişime
              geçebilirsiniz.
            </p>
          </div>
          <div className="np-cta-actions">
            <a href="#" className="btn btn-primary">
              <span>İletişim</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <Link href="/" className="btn np-btn-ghost">
              Anasayfaya dön
            </Link>
          </div>
        </div>
      </section>

      <section className="np-section np-features">
        <div className="np-inner">
          <div className="np-features-header" data-animate>
            <div className="section-tag">
              <span className="tag-line" />
              <span className="tag-text">Avantajlar</span>
            </div>
            <h2 className="np-section-title">
              Neden{" "}
              <img
                src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-logo-dark.webp"
                alt="DIO NAVI"
                className="np-logo-inline"
              />
              ?
            </h2>
          </div>

          <div className="np-features-grid">
            <article className="np-feature-card" data-animate>
              <span className="np-feature-ico" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </span>
              <h3>Dikişsiz Cerrahi</h3>
              <p>
                Diş etini boydan boya kesmeye gerek kalmadan, sadece implantın
                yerleşeceği noktada küçük bir yuva açılır. Kanama ve şişlik
                minimuma iner.
              </p>
            </article>

            <article className="np-feature-card" data-animate>
              <span className="np-feature-ico" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </span>
              <h3>Maksimum Hassasiyet</h3>
              <p>
                3D tomografi ve ağız içi tarama verileri birleştirilerek implant
                konumu milimetrik olarak belirlenir. Sinirlere zarar verme riski
                ortadan kalkar.
              </p>
            </article>

            <article className="np-feature-card" data-animate>
              <span className="np-feature-ico" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <h3>Hızlı İyileşme</h3>
              <p>
                Geleneksel yöntemde haftalar süren iyileşme süreci, dikişsiz
                yöntem sayesinde çok daha hızlı tamamlanır. Sosyal hayatınıza
                hemen dönebilirsiniz.
              </p>
            </article>

            <article className="np-feature-card" data-animate>
              <span className="np-feature-ico" aria-hidden="true">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <path d="M8 21h8M12 17v4" />
                  <path d="M7 8h2M7 12h4" />
                </svg>
              </span>
              <h3>Geçici Diş Hazır</h3>
              <p>
                Dijital planlama sayesinde, implantın üzerine takılacak geçici
                dişler operasyon anında hazır olabilir.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="np-showcase" aria-label="DIO NAVI görsel">
        <div className="np-showcase-bg">
          <img
            src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner.webp"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="np-showcase-overlay" aria-hidden="true" />
        <div className="np-inner np-showcase-inner">
          <blockquote className="np-showcase-quote" data-animate>
            <p>
              %100 dijital planlama ile
              <br />
              <strong>sıfır hata payı</strong>
            </p>
          </blockquote>
        </div>
      </section>

      <section className="np-section np-workflow" id="surec">
        <div className="np-inner">
          <div className="np-workflow-header" data-animate>
            <div className="section-tag">
              <span className="tag-line" />
              <span className="tag-text">İş Akışı</span>
            </div>
            <h2 className="np-section-title">
              Süreç nasıl <em className="text-gradient">işler?</em>
            </h2>
          </div>

          <div className="np-workflow-timeline">
            <div className="np-wf-step" data-animate>
              <div className="np-wf-step-num">
                <span>01</span>
              </div>
              <div className="np-wf-step-body">
                <figure className="np-wf-step-img">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-workflow-1.webp"
                    alt="Dijital Tarama"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <h3>Dijital Tarama</h3>
                <p>
                  Hastanın ağız içi 3D tarayıcılar (Intraoral Scanner) ile
                  taranır ve CBCT (Tomografi) görüntüleri alınır.
                </p>
              </div>
            </div>

            <div className="np-wf-step" data-animate>
              <div className="np-wf-step-num">
                <span>02</span>
              </div>
              <div className="np-wf-step-body">
                <figure className="np-wf-step-img">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-workflow-2.webp"
                    alt="Kişiye Özel Planlama"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <h3>Kişiye Özel Planlama</h3>
                <p>
                  Hekim, dijital veriler üzerinde implantın en ideal açısını ve
                  derinliğini simüle eder.
                </p>
              </div>
            </div>

            <div className="np-wf-step" data-animate>
              <div className="np-wf-step-num">
                <span>03</span>
              </div>
              <div className="np-wf-step-body">
                <figure className="np-wf-step-img">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-workflow-3.webp"
                    alt="Cerrahi Rehber Üretimi"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <h3>Cerrahi Rehber Üretimi</h3>
                <p>
                  3D yazıcılar ile hastanın ağız yapısına tam uyumlu bir cerrahi
                  rehber üretilir.
                </p>
              </div>
            </div>

            <div className="np-wf-step" data-animate>
              <div className="np-wf-step-num">
                <span>04</span>
              </div>
              <div className="np-wf-step-body">
                <figure className="np-wf-step-img">
                  <img
                    src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-workflow-4.webp"
                    alt="Hızlı Uygulama"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
                <h3>Hızlı Uygulama</h3>
                <p>
                  Rehber ağza yerleştirilir ve implantlar planlanan noktalardan
                  tek seferde, hatasız bir şekilde yerleştirilir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="np-gallery" aria-label="DIO NAVI galeri">
        <div className="np-gallery-track">
          <div className="np-gallery-item">
            <img
              src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-slider-1.webp"
              alt="DIO NAVI Cerrahi Rehber"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="np-gallery-item">
            <img
              src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-slider-2.webp"
              alt="DIO NAVI UV Plus Abutment"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="np-gallery-item">
            <img
              src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-slider-3.webp"
              alt="DIO NAVI Konnektör"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="np-gallery-item">
            <img
              src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-slider-4.webp"
              alt="DIO NAVI Initial Drill"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="np-gallery-item">
            <img
              src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-slider-5.webp"
              alt="DIO NAVI Yüzey Teknolojisi"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </section>

      <section className="np-section np-ideal" id="kimler">
        <div className="np-inner np-ideal-grid">
          <div className="np-ideal-text" data-animate>
            <div className="section-tag">
              <span className="tag-line" />
              <span className="tag-text">Kimler için ideal?</span>
            </div>
            <h2 className="np-section-title">
              <img
                src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-logo-dark.webp"
                alt="DIO NAVI"
                className="np-logo-inline"
              />{" "}
              kimlere <em className="text-gradient">uygun?</em>
            </h2>
          </div>

          <ul className="np-ideal-list" data-animate>
            <li className="np-ideal-item">
              <span className="np-ideal-ico" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <strong>Dişçi korkusu olanlar</strong>
                <p>
                  Ağrıdan çekinen hastaların en rahat şekilde tedavi olmasını
                  sağlar.
                </p>
              </div>
            </li>
            <li className="np-ideal-item">
              <span className="np-ideal-ico" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <strong>Sistemik rahatsızlığı olanlar</strong>
                <p>
                  Şeker, tansiyon vb. hastalıklarda hızlı iyileşme kritik
                  önemdedir.
                </p>
              </div>
            </li>
            <li className="np-ideal-item">
              <span className="np-ideal-ico" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <strong>Zamanı kısıtlı kişiler</strong>
                <p>
                  Kısa sürede çözüm arayanlar için ideal; operasyon süresi önemli
                  ölçüde kısalır.
                </p>
              </div>
            </li>
            <li className="np-ideal-item">
              <span className="np-ideal-ico" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <div>
                <strong>Tam dişsizlik vakaları</strong>
                <p>
                  En doğru protez açısını arayan hastalarda en yüksek hassasiyeti
                  sunar.
                </p>
              </div>
            </li>
          </ul>
        </div>
      </section>
      </main>
      <Footer />
    </>
  );
}

