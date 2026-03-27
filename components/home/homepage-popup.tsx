"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "dio:homepagePopupClosed";

type SitePopupDto = {
  key: string;
  enabled: boolean;
  imageUrl: string;
  linkUrl: string | null;
  openInNewTab: boolean;
  startAt: string | null;
  endAt: string | null;
};

export function HomepagePopup() {
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

    try {
      const alreadyClosed = sessionStorage.getItem(SESSION_KEY) === "1";
      if (alreadyClosed) return;
    } catch {
      // storage erişilemezse istek atalım, modal kararını API belirlesin
    }

    const controller = new AbortController();

    fetch("/api/site-popups/homepage", { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as SitePopupDto;
        return data;
      })
      .then((data) => {
        if (!data?.enabled) return;
        if (!data.imageUrl) return;
        setImageUrl(data.imageUrl);
        setOpen(true);
      })
      .catch(() => {
        // API erişilemezse fallback ile göster (session kapalı değilse)
        setImageUrl(null);
        setOpen(true);
      });

    return () => controller.abort();
  }, [isHomepage]);

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

