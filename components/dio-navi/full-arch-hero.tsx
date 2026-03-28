"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

type HeroPhase = "intro" | "exit" | "static";

/** İlk hero içeriği videoda bu saniyede tekrar sahneye gelir; video bitince yine kayar */
const HERO_REPRISE_AT_SEC = 27;

export function FullArchHero() {
  const [phase, setPhase] = useState<HeroPhase>("intro");
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevVideoTimeRef = useRef(0);
  const reduceMotionRef = useRef(false);
  /** Sadece phase === "exit": false = içerik dışarıda; true = video üstünde hero tekrar görünür */
  const [heroOverVideo, setHeroOverVideo] = useState(false);
  /** Slogan paneli: ilk açılışta bir kare kapalı → transition ile alttan girer (DOM ilk seferde açık kalınca animasyon oluşmaz) */
  const [sloganUiOpen, setSloganUiOpen] = useState(false);
  const sloganOpenRafRef = useRef({ a: 0, b: 0 });
  /** Slogan açıldıktan ~5s sonra rozetler kaybolur, CTA butonları gelir */
  const [sloganCtaButtons, setSloganCtaButtons] = useState(false);

  useLayoutEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    reduceMotionRef.current = reduced;
    if (reduced) {
      setPhase("static");
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const tExit = window.setTimeout(() => setPhase("exit"), 1000);
    return () => window.clearTimeout(tExit);
  }, []);

  const syncHeroToVideo = useCallback(() => {
    if (reduceMotionRef.current || phase !== "exit") return;
    const v = videoRef.current;
    if (!v) return;

    const t = v.currentTime;
    if (!Number.isFinite(t)) return;

    const prev = prevVideoTimeRef.current;

    if (prev > 1.5 && t + 0.35 < prev) {
      setHeroOverVideo(false);
    }

    const nextHero = t >= HERO_REPRISE_AT_SEC;
    setHeroOverVideo((was) => (was === nextHero ? was : nextHero));

    prevVideoTimeRef.current = t;
  }, [phase]);

  const syncHeroToVideoRef = useRef(syncHeroToVideo);
  syncHeroToVideoRef.current = syncHeroToVideo;

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    if (phase === "intro") {
      v.pause();
      return;
    }

    if (phase === "static") {
      v.play().catch(() => {});
      return;
    }

    if (phase === "exit") {
      setHeroOverVideo(false);
      prevVideoTimeRef.current = 0;
      v.pause();
      const t = window.setTimeout(() => {
        v.currentTime = 0;
        v.play()
          .then(() => {
            syncHeroToVideoRef.current();
          })
          .catch(() => {});
      }, 1000);
      return () => window.clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "exit" || reduceMotionRef.current) return;

    let raf = 0;
    const tick = () => {
      syncHeroToVideoRef.current();
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [phase]);

  const onVideoTimeUpdate = useCallback(() => {
    syncHeroToVideo();
  }, [syncHeroToVideo]);

  const onVideoEnded = useCallback(() => {
    setHeroOverVideo(false);
  }, []);

  const sloganOpen =
    phase === "static" || (phase === "exit" && !heroOverVideo);

  useLayoutEffect(() => {
    const cancelScheduled = () => {
      cancelAnimationFrame(sloganOpenRafRef.current.a);
      cancelAnimationFrame(sloganOpenRafRef.current.b);
      sloganOpenRafRef.current.a = 0;
      sloganOpenRafRef.current.b = 0;
    };

    if (!sloganOpen) {
      cancelScheduled();
      setSloganUiOpen(false);
      return;
    }

    if (phase === "static") {
      cancelScheduled();
      setSloganUiOpen(true);
      return;
    }

    setSloganUiOpen(false);
    sloganOpenRafRef.current.a = requestAnimationFrame(() => {
      sloganOpenRafRef.current.b = requestAnimationFrame(() => {
        setSloganUiOpen(true);
      });
    });

    return cancelScheduled;
  }, [sloganOpen, phase]);

  useLayoutEffect(() => {
    if (!sloganUiOpen) {
      setSloganCtaButtons(false);
      return;
    }
    if (reduceMotionRef.current) {
      setSloganCtaButtons(true);
    }
  }, [sloganUiOpen]);

  useEffect(() => {
    if (!sloganUiOpen || reduceMotionRef.current) return;
    const t = window.setTimeout(() => setSloganCtaButtons(true), 5000);
    return () => window.clearTimeout(t);
  }, [sloganUiOpen]);

  return (
    <section
      className="fa-hero"
      data-hero-phase={phase}
      data-hero-over-video={
        phase === "exit" ? (heroOverVideo ? "1" : "0") : undefined
      }
      aria-labelledby={
        phase === "exit" && !heroOverVideo ? undefined : "fa-hero-title"
      }
      aria-label={
        phase === "exit" && !heroOverVideo ? "DIO NAVI Full Arch" : undefined
      }
    >
      <div className="fa-hero-media">
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          onTimeUpdate={onVideoTimeUpdate}
          onEnded={onVideoEnded}
        >
          <source
            src="https://res.cloudinary.com/drjz8v617/video/upload/full-arch-banner-video.mp4"
            type="video/mp4"
          />
        </video>
      </div>
      <div className="fa-hero-overlay" aria-hidden="true" />
      <div
        className="fa-hero-intro-cover"
        aria-hidden="true"
      />
      <div className="fa-hero-particles" id="faHeroParticles" aria-hidden="true" />

      {(phase === "exit" || phase === "static") && (
        <div
          className="fa-hero-slogan-rail"
          data-fa-slogan-open={sloganUiOpen ? "true" : "false"}
          aria-hidden={!sloganOpen}
          aria-label="DIO NAVI Full Arch özet"
        >
          <div className="fa-hero-slogan-panel">
            <div className="fa-hero-slogan-panel-inner">
              <div className="fa-hero-slogan-pill">
                <span className="fa-hero-slogan-pill-dot" aria-hidden="true" />
                <span>DIO NAVI Full Arch</span>
              </div>
              <div className="fa-hero-slogan-headline-wrap">
                <p className="fa-hero-slogan-headline">
                  Tam Çene Çözümünde <em>Tek Dijital Hat</em>
                </p>
              </div>
              <p className="fa-hero-slogan-sub">
                Kılavuzlu Planlama ve Protez Akışı Aynı Güvenilir Ekosistemde.
              </p>
              <div
                className="fa-hero-slogan-cta-stage"
                data-fa-slogan-cta={sloganCtaButtons ? "buttons" : "badges"}
              >
                <div className="fa-hero-slogan-badges" aria-hidden="true">
                  <span className="fa-hero-slogan-chip">
                    <span className="fa-hero-slogan-chip-dot" aria-hidden="true" />
                    <span>3D Planlama</span>
                  </span>
                  <span className="fa-hero-slogan-chip">
                    <span className="fa-hero-slogan-chip-dot" aria-hidden="true" />
                    <span>Cerrahi Rehber</span>
                  </span>
                  <span className="fa-hero-slogan-chip">
                    <span className="fa-hero-slogan-chip-dot" aria-hidden="true" />
                    <span>Öngörülebilir Sonuç</span>
                  </span>
                </div>
                <div
                  className="fa-hero-slogan-actions-bar"
                  aria-hidden={!sloganCtaButtons}
                >
                  <a href="#fullarch-intro" className="btn btn-primary">
                    <span>Keşfet</span>
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
                  </a>
                  <Link
                    href="/digital-solutions/dio-navi"
                    className="btn np-btn-ghost"
                  >
                    DIO NAVI ana sayfa
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="fa-inner fa-hero-grid"
        aria-hidden={phase === "exit" && !heroOverVideo}
      >
        <div className="fa-hero-col fa-hero-col--left">
          <div className="fa-hero-badge">
            <span className="fa-hero-badge-dot" aria-hidden="true" />
            <span>Dijital çözümler</span>
          </div>
          <p className="fa-hero-kicker">Digital Edentulism Rehabilitation</p>
          <h1 id="fa-hero-title" className="fa-hero-title">
            DIO NAVI <em>Full Arch</em>
          </h1>
          <p className="fa-hero-lead">
            Sınırlı implant sayısıyla tam çene fonksiyon ve estetiğini
            destekleyen, uçtan uca dijital iş akışı. Planlama, kılavuzlu
            cerrahi ve protez üretimi tek ekosistemde.
          </p>
          <div className="fa-hero-actions">
            <a href="#fullarch-intro" className="btn btn-primary">
              <span>Keşfet</span>
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
            </a>
            <Link href="/digital-solutions/dio-navi" className="btn np-btn-ghost">
              DIO NAVI ana sayfa
            </Link>
          </div>
        </div>

        <div className="fa-hero-col fa-hero-col--right fa-hero-right">
          <div className="fa-hero-stats">
            <div className="fa-hero-stat">
              <strong>4–6</strong>
              <span>Tipik implant aralığı</span>
            </div>
            <div className="fa-hero-stat">
              <strong>3D</strong>
              <span>Plan &amp; guide</span>
            </div>
            <div className="fa-hero-stat">
              <strong>Uçtan uca</strong>
              <span>Dijital workflow</span>
            </div>
          </div>
          <div className="fa-hero-thumb">
            <Image
              src="https://res.cloudinary.com/drjz8v617/image/upload/full-arch-hero.webp"
              alt="DIO NAVI Full Arch — dijital tam çene çözümü"
              width={1600}
              height={900}
              sizes="(max-width: 992px) 100vw, 42vw"
              priority
            />
          </div>
        </div>
      </div>

      <div className="fa-hero-scroll" aria-hidden="true">
        <div className="fa-scroll-mouse">
          <div className="fa-scroll-dot" />
        </div>
        <span>KEŞFET</span>
      </div>
    </section>
  );
}
