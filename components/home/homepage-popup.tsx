"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "dio:homepagePopupClosed";

/** Sunucuda (ana sayfa ISR render'ında) hazırlanan popup verisi. */
export type HomepagePopupData = {
  enabled: boolean;
  imageUrl: string;
};

export function HomepagePopup({ popup }: { popup: HomepagePopupData | null }) {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fallbackSrc = useMemo(
    () => "/homepage/assets/popup/ortho-navi-seminar.png",
    []
  );

  useEffect(() => {
    if (!isHomepage) return;
    if (!popup?.enabled || !popup.imageUrl) return;

    try {
      const alreadyClosed = sessionStorage.getItem(SESSION_KEY) === "1";
      if (alreadyClosed) return;
    } catch {
      // storage erişilemezse popup gösterilir
    }

    // Veri sayfayla birlikte geldiği için ayrı istek yok; açılış bir sonraki
    // tick'e bırakılır (hidrasyon tamamlandıktan sonra, eski davranışla aynı).
    const imageUrl = popup.imageUrl;
    const t = setTimeout(() => {
      setImageUrl(imageUrl);
      setOpen(true);
    }, 0);
    return () => clearTimeout(t);
  }, [isHomepage, popup]);

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setOpen(false);
  };

  if (!isHomepage || !open) return null;

  const imageSrc = imageUrl ?? fallbackSrc;

  return (
    <div className="hp-popup" role="dialog" aria-modal="true">
      <button
        className="hp-popup__backdrop"
        aria-label="Kapat"
        onClick={close}
      />

      <div className="hp-popup__panel" role="document">
        <button className="hp-popup__close" onClick={close} aria-label="Kapat">
          <span aria-hidden="true">×</span>
        </button>

        <div className="hp-popup__media">
          <img
            src={imageSrc}
            alt="DIO Ortho NAVI Clear Aligner Seminar"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}

