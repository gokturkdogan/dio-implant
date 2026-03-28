import Link from "next/link";

export function Navbar() {
  return (
    <header className="header" id="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          <img
            src="https://res.cloudinary.com/drjz8v617/image/upload/dio-logo-light.webp"
            alt="DIO Implant"
            className="logo-img logo-img-light"
          />
          <img
            src="https://res.cloudinary.com/drjz8v617/image/upload/dio-logo-dark.webp"
            alt="DIO Implant"
            className="logo-img logo-img-dark"
          />
        </Link>

        <nav className="main-nav" id="mainNav">
          <ul className="nav-list">
            <li className="nav-item active">
              <Link href="/">Anasayfa</Link>
            </li>

            <li className="nav-item nav-item-dropdown">
              <div className="nav-dropdown-row">
                <a href="#" className="nav-dropdown-trigger">
                  Ürünler
                  <svg
                    className="nav-dropdown-caret"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </a>
                <button
                  type="button"
                  className="nav-dropdown-expand"
                  aria-expanded="false"
                  aria-controls="nav-submenu-urunler"
                  aria-label="Ürünler alt menüsünü aç / kapat"
                >
                  <svg
                    className="nav-dropdown-expand-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>

              <ul className="nav-dropdown" id="nav-submenu-urunler" role="menu">
                <li className="nav-dropdown-item nav-dropdown-item-has-children" role="none">
                  <div className="nav-dropdown-item-row">
                    <a href="#" className="nav-dropdown-link nav-dropdown-link-parent" role="menuitem">
                      İmplantlar
                      <svg className="nav-parent-has-children-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </a>
                    <button type="button" className="nav-submenu-expand" aria-expanded="false" aria-controls="nav-sub-implant" aria-label="İmplantlar alt menüsü">
                      <svg className="nav-submenu-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <ul className="nav-submenu" id="nav-sub-implant" role="menu">
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">Unicon</a>
                    </li>
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">VUV</a>
                    </li>
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">UFIII</a>
                    </li>
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">UFIII</a>
                    </li>
                  </ul>
                </li>
                <li className="nav-dropdown-item" role="none">
                  <a href="#" className="nav-dropdown-link" role="menuitem">
                    UV Aktif
                  </a>
                </li>
                <li className="nav-dropdown-item nav-dropdown-item-has-children" role="none">
                  <div className="nav-dropdown-item-row">
                    <a href="#" className="nav-dropdown-link nav-dropdown-link-parent" role="menuitem">
                      Tarayıcılar
                      <svg className="nav-parent-has-children-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </a>
                    <button type="button" className="nav-submenu-expand" aria-expanded="false" aria-controls="nav-sub-scanner" aria-label="Tarayıcılar alt menüsü">
                      <svg className="nav-submenu-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <ul className="nav-submenu" id="nav-sub-scanner" role="menu">
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">DIO iOS</a>
                    </li>
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">Medit i900</a>
                    </li>
                    <li role="none">
                      <a href="#" className="nav-dropdown-link" role="menuitem">Medit i700</a>
                    </li>
                  </ul>
                </li>
                <li className="nav-dropdown-item nav-dropdown-item-has-children" role="none">
                  <div className="nav-dropdown-item-row">
                    <a href="#" className="nav-dropdown-link nav-dropdown-link-parent" role="menuitem">
                      Cerrahi Kitler
                      <svg className="nav-parent-has-children-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </a>
                    <button type="button" className="nav-submenu-expand" aria-expanded="false" aria-controls="nav-sub-cerrahi-kits" aria-label="Cerrahi Kitler alt menüsü">
                      <svg className="nav-submenu-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <ul className="nav-submenu" id="nav-sub-cerrahi-kits" role="menu">
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Union Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Surgical Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Master Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Special Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Narrow Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Sinus Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Sas Kit</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Osteotomi Kit</a></li>
                  </ul>
                </li>
                <li className="nav-dropdown-item nav-dropdown-item-has-children" role="none">
                  <div className="nav-dropdown-item-row">
                    <a href="#" className="nav-dropdown-link nav-dropdown-link-parent" role="menuitem">
                      Görüntüleme Sistemleri
                      <svg className="nav-parent-has-children-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </a>
                    <button type="button" className="nav-submenu-expand" aria-expanded="false" aria-controls="nav-sub-goruntuleme" aria-label="Görüntüleme Sistemleri alt menüsü">
                      <svg className="nav-submenu-expand-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                  <ul className="nav-submenu" id="nav-sub-goruntuleme" role="menu">
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">HDX</a></li>
                    <li role="none"><a href="#" className="nav-dropdown-link" role="menuitem">RAY</a></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="nav-item nav-item-dropdown">
              <div className="nav-dropdown-row">
                <a href="#" className="nav-dropdown-trigger">
                  Dijital Çözümler
                  <svg className="nav-dropdown-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </a>
                <button type="button" className="nav-dropdown-expand" aria-expanded="false" aria-controls="nav-submenu-dijital" aria-label="Dijital Çözümler alt menüsünü aç / kapat">
                  <svg className="nav-dropdown-expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
              <ul className="nav-dropdown" id="nav-submenu-dijital" role="menu">
                <li className="nav-dropdown-item" role="none">
                  <Link
                    href="/digital-solutions/dio-navi"
                    className="nav-dropdown-link"
                    role="menuitem"
                  >
                    DIO NAVI
                  </Link>
                </li>
                <li className="nav-dropdown-item" role="none">
                  <a href="#" className="nav-dropdown-link" role="menuitem">DIO NAVI Full Arch</a>
                </li>
              </ul>
            </li>
            <li className="nav-item nav-item-dropdown">
              <div className="nav-dropdown-row">
                <a href="#" className="nav-dropdown-trigger">
                  DIO Akademi
                  <svg className="nav-dropdown-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </a>
                <button type="button" className="nav-dropdown-expand" aria-expanded="false" aria-controls="nav-submenu-akademi" aria-label="DIO Akademi alt menüsünü aç / kapat">
                  <svg className="nav-dropdown-expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
              <ul className="nav-dropdown" id="nav-submenu-akademi" role="menu">
                <li className="nav-dropdown-item" role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Eğitim Takvimi</a></li>
                <li className="nav-dropdown-item" role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Geçmiş Etkinlikler</a></li>
                <li className="nav-dropdown-item" role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Beni Bilgilendir</a></li>
              </ul>
            </li>
            <li className="nav-item nav-item-dropdown">
              <div className="nav-dropdown-row">
                <a href="#" className="nav-dropdown-trigger">
                  Kurumsal
                  <svg className="nav-dropdown-caret" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </a>
                <button type="button" className="nav-dropdown-expand" aria-expanded="false" aria-controls="nav-submenu-kurumsal" aria-label="Kurumsal alt menüsünü aç / kapat">
                  <svg className="nav-dropdown-expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
              <ul className="nav-dropdown" id="nav-submenu-kurumsal" role="menu">
                <li className="nav-dropdown-item" role="none">
                  <Link href="/about" className="nav-dropdown-link" role="menuitem">
                    Hakkımızda
                  </Link>
                </li>
                <li className="nav-dropdown-item" role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Sertifikalar</a></li>
              </ul>
            </li>
            <li className="nav-item">
              <a href="#">İletişim / Bayi Ağı</a>
            </li>
            <li className="nav-item">
              <a href="#">İndirme</a>
            </li>
          </ul>
        </nav>

        <div className="header-actions">
          <button className="hamburger" id="hamburger" aria-label="Menü">
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
