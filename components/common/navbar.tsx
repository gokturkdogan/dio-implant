"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarProductsMenu } from "./navbar-products-menu";

function pathMatches(pathname: string, base: string) {
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function Navbar() {
  const pathname = usePathname() ?? "";

  const homeActive = pathname === "/";
  const productsActive = pathMatches(pathname, "/urunler");
  const digitalActive = pathMatches(pathname, "/digital-solutions");
  const corporateActive = pathMatches(pathname, "/about");
  const dioNaviActive = pathMatches(pathname, "/digital-solutions/dio-navi");
  const fullArchActive = pathMatches(pathname, "/digital-solutions/full-arch");
  const academyActive = pathMatches(pathname, "/dio-akademi");
  const academyCalendarActive = pathMatches(
    pathname,
    "/dio-akademi/egitim-takvimi",
  );
  const contactActive = pathMatches(pathname, "/iletisim");
  const catalogsActive = pathMatches(pathname, "/kataloglar");
  const digitalLibraryActive = pathMatches(pathname, "/dijital-kutuphane");

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
            <li className={`nav-item${homeActive ? " active" : ""}`}>
              <Link href="/">Anasayfa</Link>
            </li>

            <li
              className={`nav-item nav-item-dropdown${productsActive ? " active" : ""}`}
            >
              <div className="nav-dropdown-row">
                <Link href="/urunler" className="nav-dropdown-trigger">
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
                </Link>
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
                <NavbarProductsMenu />
              </ul>
            </li>

            <li
              className={`nav-item nav-item-dropdown${digitalActive ? " active" : ""}`}
            >
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
                    className={`nav-dropdown-link${dioNaviActive ? " active" : ""}`}
                    role="menuitem"
                  >
                    DIO NAVI
                  </Link>
                </li>
                <li className="nav-dropdown-item" role="none">
                  <Link
                    href="/digital-solutions/full-arch"
                    className={`nav-dropdown-link${fullArchActive ? " active" : ""}`}
                    role="menuitem"
                  >
                    DIO NAVI Full Arch
                  </Link>
                </li>
              </ul>
            </li>
            <li
              className={`nav-item nav-item-dropdown${academyActive ? " active" : ""}`}
            >
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
                <li className="nav-dropdown-item" role="none">
                  <Link
                    href="/dio-akademi/egitim-takvimi"
                    className={`nav-dropdown-link${academyCalendarActive ? " active" : ""}`}
                    role="menuitem"
                  >
                    Eğitim Takvimi
                  </Link>
                </li>
              </ul>
            </li>
            <li className={`nav-item${catalogsActive ? " active" : ""}`}>
              <Link href="/kataloglar">Kataloglar</Link>
            </li>
            <li
              className={`nav-item${digitalLibraryActive ? " active" : ""}`}
            >
              <Link href="/dijital-kutuphane">Dijital Kütüphane</Link>
            </li>
            <li
              className={`nav-item nav-item-dropdown${corporateActive ? " active" : ""}`}
            >
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
                  <Link
                    href="/about"
                    className={`nav-dropdown-link${corporateActive ? " active" : ""}`}
                    role="menuitem"
                  >
                    Hakkımızda
                  </Link>
                </li>
                <li className="nav-dropdown-item" role="none"><a href="#" className="nav-dropdown-link" role="menuitem">Sertifikalar</a></li>
              </ul>
            </li>
            <li className={`nav-item${contactActive ? " active" : ""}`}>
              <Link href="/iletisim">Bayi Ağı</Link>
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
