import { Footer } from "../common/footer";

export function HomepageContent() {
  return (
    <>
      <section className="hero" id="hero">
        <div className="hero-slides">
          <div className="hero-slide active" data-index="0">
            <div className="slide-bg">
              <img
                className="slide-hero-bg"
                src="https://res.cloudinary.com/drjz8v617/image/upload/banner-bg.webp"
                alt=""
              />
              <div className="slide-gradient" />
              <div className="slide-visual">
                <div className="digital-particles" id="particles-0" />
              </div>
            </div>
            <div className="slide-floats">
              <div className="slide-product">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/banner-carusel-1.webp"
                  alt="DIO Implant"
                />
              </div>
            </div>
          </div>

          <div className="hero-slide" data-index="1">
            <div className="slide-bg">
              <img
                className="slide-hero-bg"
                src="https://res.cloudinary.com/drjz8v617/image/upload/banner-bg.webp"
                alt=""
              />
              <div className="slide-gradient" />
              <div className="slide-visual">
                <div className="placeholder-visual visual-2">
                  <div className="circuit-lines" />
                  <div className="scan-overlay" />
                  <div className="digital-particles" id="particles-1" />
                </div>
              </div>
            </div>
            <div className="slide-floats">
              <div className="slide-product">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/banner-carusel-2.webp"
                  alt="DIO Implant"
                />
              </div>
            </div>
          </div>

          <div className="hero-slide" data-index="2">
            <div className="slide-bg">
              <img
                className="slide-hero-bg"
                src="https://res.cloudinary.com/drjz8v617/image/upload/banner-bg.webp"
                alt=""
              />
              <div className="slide-gradient" />
              <div className="slide-visual">
                <div className="placeholder-visual visual-3">
                  <div className="globe-mesh" />
                  <div className="orbit-rings" />
                  <div className="digital-particles" id="particles-2" />
                </div>
              </div>
            </div>
            <div className="slide-floats">
              <div className="slide-product">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/banner-carusel-3.webp"
                  alt="DIO UF Surgical Kit"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hero-content">
          <div className="hero-tag">
            <span className="tag-line" />
            <span className="tag-text">DIO IMPLANT</span>
          </div>
          <h1 className="hero-title">
            <span className="title-line line-1">Dijital Diş Hekimliğinde</span>
            <span className="title-line line-2">
              <em>Dünya Lideri</em>
            </span>
          </h1>
          <p className="hero-desc">
            Dijital cerrahi teknolojileriyle geleceğin implantolojisini bugünden
            deneyimleyin. Hassasiyet, güvenilirlik ve inovasyon bir arada.
          </p>
          <div className="hero-actions">
            <a href="#" className="btn btn-primary">
              <span>Ürünleri Gör</span>
            </a>
            <a href="#" className="btn btn-outline">
              <span>Katalog İndir</span>
            </a>
          </div>
        </div>

        <div className="hero-indicators">
          <button className="indicator active" data-slide="0">
            <span className="indicator-progress" />
          </button>
          <button className="indicator" data-slide="1">
            <span className="indicator-progress" />
          </button>
          <button className="indicator" data-slide="2">
            <span className="indicator-progress" />
          </button>
        </div>
      </section>

      <section className="core-tech" id="coreTech">
        <div className="core-tech-inner">
          <div className="core-tech-text">
            <div className="section-tag">
              <span className="tag-line" />
              <span className="tag-text">Neden DIO Implant</span>
            </div>
            <h2 className="core-tech-title">
              ÇEKİRDEK
              <br />
              <em>TEKNOLOJİ</em>
            </h2>
            <p className="core-tech-desc">
              DIO&apos;nun teknolojik uzmanlığı, sürdürülebilir Ar-Ge yatırımı ve
              küresel pazar anlayışıyla diş hekimliğinin paradigmasını yeniden
              tanımlar.
            </p>
          </div>

          <div className="core-tech-pins">
            <div className="ct-pin ct-pin-1" data-animate>
              <div className="pin-shape pin-lg">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/tech-bg-1.webp"
                  alt=""
                />
                <div className="pin-content">
                  <p className="pin-subtitle">DIO Implant Çift Yüzey İşlemi</p>
                  <h3 className="pin-title">Hibrit Yüzey Teknolojisi</h3>
                </div>
              </div>
            </div>
            <div className="ct-pin ct-pin-2" data-animate>
              <div className="pin-shape pin-md">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/tech-bg-3.webp"
                  alt=""
                />
                <div className="pin-content">
                  <p className="pin-subtitle">
                    DIO Vakum UV Aktivasyon Teknolojisi
                  </p>
                  <h3 className="pin-title">UV Implant</h3>
                </div>
              </div>
            </div>
            <div className="ct-pin ct-pin-3" data-animate>
              <div className="pin-shape pin-md">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/tech-bg-2.webp"
                  alt=""
                />
                <div className="pin-content">
                  <p className="pin-subtitle">
                    Tam dijital implant cerrahi sistemi.
                  </p>
                  <h3 className="pin-title">DIO NAVI Kılavuz Sistemi</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dionavi-banner" id="dioNavi">
        <div className="dionavi-bg-img">
          <img
            src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner-bg.webp"
            alt=""
          />
        </div>
        <div className="dionavi-bg">
          <div className="dionavi-grid" />
          <div className="dionavi-glow glow-1" />
          <div className="dionavi-glow glow-2" />
          <div className="dionavi-scanline" />
          <div className="dionavi-particles" id="naviParticles" />
        </div>
        <div className="dionavi-inner">
          <div className="dionavi-text">
            <div className="dionavi-badge">
              <span className="dionavi-badge-dot" />
              <span>Dijital Cerrahi Teknolojisi</span>
            </div>
            <h2 className="dionavi-title">
              <span className="dionavi-title-sub">Geleceğin Cerrahisi</span>
              DIO <em>NAVI</em>
            </h2>
            <p className="dionavi-desc">
              Tam dijital implant cerrahi planlama ve kılavuz sistemi. Hassas,
              öngörülebilir ve minimal invaziv tedavi deneyimi.
            </p>
            <div className="dionavi-stats">
              <div className="dionavi-stat">
                <span className="dionavi-stat-val">%98</span>
                <span className="dionavi-stat-label">Hassasiyet</span>
              </div>
              <div className="dionavi-stat-divider" />
              <div className="dionavi-stat">
                <span className="dionavi-stat-val">3D</span>
                <span className="dionavi-stat-label">Planlama</span>
              </div>
              <div className="dionavi-stat-divider" />
              <div className="dionavi-stat">
                <span className="dionavi-stat-val">Full</span>
                <span className="dionavi-stat-label">Dijital Akış</span>
              </div>
            </div>
            <a
              href="/digital-solutions/dio-navi"
              className="btn btn-primary dionavi-btn"
            >
              <span>DIO NAVI&apos;yi Keşfet</span>
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
          </div>
          <div className="dionavi-visual" data-animate>
            <div className="navi-carousel">
              <div className="navi-carousel-scene">
                <div className="navi-carousel-ring" id="naviRing">
                  <div className="navi-carousel-item">
                    <img
                      src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner-1.webp"
                      alt="DIO NAVI Cerrahi Planlama"
                    />
                  </div>
                  <div className="navi-carousel-item">
                    <img
                      src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner-2.webp"
                      alt="DIO NAVI İmplant Bağlantı"
                    />
                  </div>
                  <div className="navi-carousel-item">
                    <img
                      src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner-3.webp"
                      alt="DIO NAVI UV Plus Abutment"
                    />
                  </div>
                  <div className="navi-carousel-item">
                    <img
                      src="https://res.cloudinary.com/drjz8v617/image/upload/dionavi-banner-4.webp"
                      alt="DIO NAVI Initial Drill"
                    />
                  </div>
                </div>
              </div>
              <div className="navi-carousel-dots" id="naviDots">
                <button className="navi-dot active" data-index="0" />
                <button className="navi-dot" data-index="1" />
                <button className="navi-dot" data-index="2" />
                <button className="navi-dot" data-index="3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="product-cats" id="productCats">
        <div className="product-cats-inner">
          <div className="pcat-tabs">
            <div className="section-tag">
              <span className="tag-line" />
              <span className="tag-text">Ürün Kategorileri</span>
            </div>
            <h2 className="pcat-title">
              Ürün
              <br />
              <em>Portföyü</em>
            </h2>

            <div className="pcat-tab-list">
              <button className="pcat-tab active" data-tab="implant">
                <div className="pcat-tab-info">
                  <span className="pcat-tab-name">İmplant Sistemleri</span>
                  <span className="pcat-tab-desc">
                    UF II, UF III, Narrow ve daha fazlası
                  </span>
                </div>
                <span className="pcat-tab-arrow">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              <button className="pcat-tab" data-tab="dijital">
                <div className="pcat-tab-info">
                  <span className="pcat-tab-name">Dijital Çözümler</span>
                  <span className="pcat-tab-desc">
                    DIO Navi, tarama ve planlama
                  </span>
                </div>
                <span className="pcat-tab-arrow">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>

              <button className="pcat-tab" data-tab="cerrahi">
                <div className="pcat-tab-info">
                  <span className="pcat-tab-name">Cerrahi Setler</span>
                  <span className="pcat-tab-desc">
                    Cerrahi kitler ve yardımcı ekipmanlar
                  </span>
                </div>
                <span className="pcat-tab-arrow">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          <div className="pcat-display">
            <div className="pcat-panel active" data-panel="implant">
              <div className="pcat-image-wrap">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/portfoy-implant.webp"
                  alt="İmplant Sistemleri"
                />
                <div className="pcat-image-glow" />
              </div>
              <a href="#" className="btn btn-primary pcat-btn">
                <span>Daha Fazla Görüntüle</span>
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
            </div>

            <div className="pcat-panel" data-panel="dijital">
              <div className="pcat-image-wrap">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/portfoy-digital.webp"
                  alt="Dijital Çözümler"
                />
                <div className="pcat-image-glow" />
              </div>
              <a href="#" className="btn btn-primary pcat-btn">
                <span>Daha Fazla Görüntüle</span>
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
            </div>

            <div className="pcat-panel" data-panel="cerrahi">
              <div className="pcat-image-wrap">
                <img
                  src="https://res.cloudinary.com/drjz8v617/image/upload/portfoy-kits.webp"
                  alt="Cerrahi Setler"
                />
                <div className="pcat-image-glow" />
              </div>
              <a href="#" className="btn btn-primary pcat-btn">
                <span>Daha Fazla Görüntüle</span>
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
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
