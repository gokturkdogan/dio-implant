import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "../styles/maintenance.css";

const LOGO_LIGHT =
  "https://res.cloudinary.com/drjz8v617/image/upload/dio-logo-light.webp";

export const metadata: Metadata = {
  title: "Bakım Modu | DIO Implant",
  description:
    "Sitemiz kısa süreli bakım çalışması nedeniyle geçici olarak kapalıdır.",
};

/**
 * Arka plan: `.env.local` içinde tam URL veya public yolu.
 * Örn: `NEXT_PUBLIC_MAINTENANCE_BG_URL=/maintenance-bg.webp`
 * ve dosyayı `public/maintenance-bg.webp` olarak ekleyin.
 */
function resolveBackgroundImageUrl(): string | undefined {
  const fromEnv = process.env.NEXT_PUBLIC_MAINTENANCE_BG_URL?.trim();
  if (fromEnv) return fromEnv;
  return undefined;
}

export default function MaintenancePage() {
  const bgUrl = resolveBackgroundImageUrl();
  const usePhoto = Boolean(bgUrl);

  return (
    <>
      <style>{`.header{display:none!important;}`}</style>
      <main
        className={`maintenance-page${usePhoto ? " maintenance-page--photo" : ""}`}
        style={
          usePhoto && bgUrl
            ? ({
                ["--maintenance-photo" as string]: `url("${bgUrl.replace(/"/g, "%22")}")`,
              } satisfies CSSProperties)
            : undefined
        }
      >
        <div className="maintenance-page__backdrop" aria-hidden />
        {!usePhoto && (
          <>
            <div className="maintenance-page__orb maintenance-page__orb--a" aria-hidden />
            <div className="maintenance-page__orb maintenance-page__orb--b" aria-hidden />
          </>
        )}

        <DecorativeIcons />

        <div className="maintenance-page__inner">
          <section className="maintenance-card" aria-labelledby="maint-title">
            <img
              className="maintenance-card__logo"
              src={LOGO_LIGHT}
              alt="DIO Implant"
              width={200}
              height={48}
            />
            <p className="maintenance-card__eyebrow">Geçici bakım</p>
            <h1 id="maint-title" className="maintenance-card__title">
              Size daha iyi hizmet verebilmek için sitemizi yeniliyoruz
            </h1>
            <p className="maintenance-card__lead">
              Daha güvenli ve akıcı bir deneyim sunmak adına altyapımızı
              güncelliyoruz. Çok kısa süre içinde tekrar yayında olacağız;
              sabrınız için teşekkür ederiz.
            </p>
            <ul className="maintenance-card__icons">
              <li>
                <span className="maintenance-card__icon-wrap" aria-hidden>
                  <IconSparkles />
                </span>
                Yenilenen deneyim
              </li>
              <li>
                <span className="maintenance-card__icon-wrap" aria-hidden>
                  <IconShield />
                </span>
                Güvenli altyapı
              </li>
              <li>
                <span className="maintenance-card__icon-wrap" aria-hidden>
                  <IconRefresh />
                </span>
                Kesintisiz kalite
              </li>
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}

function DecorativeIcons() {
  return (
    <>
      <span className="maintenance-page__deco maintenance-page__deco--tl" aria-hidden>
        <IconWrenchLarge />
      </span>
      <span className="maintenance-page__deco maintenance-page__deco--tr" aria-hidden>
        <IconSparklesLarge />
      </span>
      <span className="maintenance-page__deco maintenance-page__deco--bl" aria-hidden>
        <IconLayersLarge />
      </span>
      <span className="maintenance-page__deco maintenance-page__deco--br" aria-hidden>
        <IconHeartPulseLarge />
      </span>
    </>
  );
}

function IconSparkles() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4M22 5h-4M4 17v2M5 18H3" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function IconWrenchLarge() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconSparklesLarge() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
    </svg>
  );
}

function IconLayersLarge() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
      <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
      <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
    </svg>
  );
}

function IconHeartPulseLarge() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
