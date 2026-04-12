import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/common/footer";
import { digitalLibraryService } from "@/services/digital-library.service";
import "../styles/dijital-kutuphane.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dijital Kütüphane | DIO Implant",
  description:
    "Broşürler, klinik dokümanlar ve dijital kaynaklara tek noktadan erişin.",
};

function IconDownload() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconFileStack() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function IconPackage() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function IconCloudDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4 4-4-4" />
    </svg>
  );
}

function HeroCta({
  href,
  label,
  icon,
  variant,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  variant: "primary" | "ghost";
}) {
  const trimmed = href.trim();
  const base =
    variant === "primary" ? "ct-hero-btn ct-hero-btn--primary" : "ct-hero-btn ct-hero-btn--ghost";
  if (!trimmed) {
    return (
      <span className={`${base} dk-hero-btn--disabled`} aria-disabled="true">
        {icon}
        {label}
      </span>
    );
  }
  return (
    <a
      href={trimmed}
      className={base}
      target="_blank"
      rel="noopener noreferrer"
    >
      {icon}
      {label}
    </a>
  );
}

export default async function DijitalKutuphanePage() {
  const row = await digitalLibraryService.get();
  const zipUrl = row?.zipUrl ?? "";
  const pptUrl = row?.pptUrl ?? "";

  return (
    <>
      <main className="ct-page dijital-kutuphane-page">
        <section className="ct-hero">
          <div className="ct-hero-inner">
            <div className="ct-hero-copy">
              <p className="ct-eyebrow">Dijital Kütüphane</p>
              <h1>
              Dijital kütüphaneye dair tüm dijital kaynaklarınızı buradan <em>indirebilirsiniz</em>
              </h1>

              <ul className="dk-hero-pills" aria-label="Paket içeriği">
                <li className="dk-hero-pill">
                  <IconFileStack />
                  Klinik dokümanlar
                </li>
                <li className="dk-hero-pill">
                  <IconPackage />
                  PDF &amp; arşiv
                </li>
                <li className="dk-hero-pill">
                  <IconCloudDown />
                  Güncel paketler
                </li>
              </ul>
            </div>
            <div className="ct-hero-actions">
              <HeroCta
                href={zipUrl}
                label="Dijital Kütüphaneyi indir"
                icon={<IconDownload />}
                variant="primary"
              />
              <HeroCta
                href={pptUrl}
                label="Yönergeyi Görüntüle"
                icon={<IconDownload />}
                variant="ghost"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
