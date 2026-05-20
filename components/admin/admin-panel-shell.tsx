import Script from "next/script";
import type { ReactNode } from "react";
import { AdminSidebarIdentity } from "./admin-sidebar-identity";

const NAV_GROUPS = [
  {
    section: "Bilgilendirme",
    items: [{ href: "/admin-panel/kullanim-klavuzu", label: "Kullanım kılavuzu" }],
  },
  {
    section: "Hesap",
    items: [{ href: "/admin-panel/hesap-bilgileri", label: "Hesap Bilgileri" }],
  },
  {
    section: "Yönetim",
    items: [
      { href: "/admin-panel", label: "Popup Yönetimi" },
      { href: "/admin-panel/kategoriler", label: "Kategoriler" },
      { href: "/admin-panel/urunler", label: "Ürünler" },
      { href: "/admin-panel/kataloglar", label: "Kataloglar" },
      { href: "/admin-panel/dijital-kutuphane", label: "Dijital kütüphane" },
      { href: "/admin-panel/egitimler", label: "Eğitimler" },
      { href: "/admin-panel/egitmenler", label: "Eğitmenler" },
      { href: "/admin-panel/iletisim-bilgileri", label: "İletişim bilgileri" },
      { href: "/admin-panel/ofisler", label: "Bölge ofisleri" },
      { href: "/admin-panel/bayiler", label: "Yetkili bayiler" },
      { href: "/admin-panel/bakim-modu", label: "Bakım modu" },
    ],
  },
] as const;

const NAV_HREFS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.href));

type NavHref = (typeof NAV_HREFS)[number];

type Props = {
  title: string;
  activeHref: NavHref;
  children: ReactNode;
};

export function AdminPanelShell({ title, activeHref, children }: Props) {
  return (
    <main className="admin-shell">
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar__brand">
            <div className="admin-sidebar__brand-top">
              <div className="admin-sidebar__logo-wrap">
                <img
                  className="admin-sidebar__logo-img admin-sidebar__logo-img--dark"
                  src="https://res.cloudinary.com/drjz8v617/image/upload/dio-logo-light.webp"
                  alt="DIO Implant"
                />
                <img
                  className="admin-sidebar__logo-img admin-sidebar__logo-img--light"
                  src="https://res.cloudinary.com/drjz8v617/image/upload/dio-logo-original.webp"
                  alt="DIO Implant"
                />
              </div>
              <div className="admin-sidebar__meta">
                <div className="admin-sidebar__name-row">
                  <div className="admin-sidebar__name">Yönetim Paneli</div>
                  <button
                    className="admin-theme-btn admin-theme-btn--sidebar"
                    id="adminThemeToggle"
                    type="button"
                    aria-label="Tema: Dark"
                    title="Tema"
                  >
                    <span
                      className="admin-theme-btn__icon admin-theme-btn__icon--sun"
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="4" />
                        <path d="M12 2v2" />
                        <path d="M12 20v2" />
                        <path d="M4.93 4.93l1.41 1.41" />
                        <path d="M17.66 17.66l1.41 1.41" />
                        <path d="M2 12h2" />
                        <path d="M20 12h2" />
                        <path d="M6.34 17.66l-1.41 1.41" />
                        <path d="M19.07 4.93l-1.41 1.41" />
                      </svg>
                    </span>
                    <span
                      className="admin-theme-btn__icon admin-theme-btn__icon--moon"
                      aria-hidden="true"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <AdminSidebarIdentity />
          </div>

          <nav className="admin-nav" aria-label="Yönetim paneli menüsü">
            {NAV_GROUPS.map((group, groupIndex) => (
              <div key={group.section} className="admin-nav__group">
                <div
                  className={
                    groupIndex === 0
                      ? "admin-nav__section admin-nav__section--first"
                      : "admin-nav__section"
                  }
                >
                  {group.section}
                </div>
                {group.items.map((item) => (
                  <a
                    key={item.href}
                    className={
                      item.href === activeHref
                        ? "admin-nav__item active"
                        : "admin-nav__item"
                    }
                    href={item.href}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <section className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar__title">{title}</div>
            <div className="admin-topbar__right">
              <form action="/api/admin/logout" method="post">
                <button className="admin-logout-btn" type="submit">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Çıkış</span>
                </button>
              </form>
              <div className="admin-session">
                <span className="admin-session__label">Oturum</span>
                <span className="admin-session__timer" id="adminSessionTimer">
                  —:——
                </span>
              </div>
            </div>
          </header>

          <div className="admin-content">{children}</div>
        </section>
      </div>
      <Script src="/admin-panel/session-timer.js" strategy="afterInteractive" />
      <Script src="/admin-panel/theme-toggle.js" strategy="afterInteractive" />
    </main>
  );
}
