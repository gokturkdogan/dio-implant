"use client";

import Link from "next/link";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";

export interface CarouselProduct {
  id: number;
  slug: string;
  name: string;
  excerpt: string | null;
  imageUrl: string | null;
}

interface Props {
  products: CarouselProduct[];
}

export function ProductCarousel({ products }: Props) {
  const [active, setActive] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const touchRef = useRef<{ startX: number; startY: number } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const len = products.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      if (isAnimating || len < 2) return;
      setIsAnimating(true);
      setActive((prev) => (prev + dir + len) % len);
      timerRef.current = setTimeout(() => setIsAnimating(false), 520);
    },
    [isAnimating, len],
  );

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const onTouchStart = (e: ReactTouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY };
  };

  const onTouchEnd = (e: ReactTouchEvent) => {
    if (!touchRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.startX;
    const dy = t.clientY - touchRef.current.startY;
    touchRef.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dy) > Math.abs(dx)) return;
    go(dx < 0 ? 1 : -1);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  };

  if (len === 0) return null;

  const positions = getPositions(len, active);

  return (
    <div
      className="pc-root"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onKeyDown={onKey}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Ürün carouseli"
    >
      {/* Navigation */}
      {len > 1 && (
        <button
          type="button"
          className="pc-nav pc-nav--prev"
          onClick={() => go(-1)}
          aria-label="Önceki ürün"
          disabled={isAnimating}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M15 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="pc-stage">
        <div className="pc-track">
          {products.map((p, i) => {
            const pos = positions[i];
            return (
              <div
                key={p.id}
                className={`pc-slide${pos.cls}`}
                style={{
                  "--pc-x": `${pos.x}%`,
                  "--pc-scale": pos.scale,
                  "--pc-z": pos.z,
                  "--pc-ry": `${pos.rotateY}deg`,
                  "--pc-opacity": pos.opacity,
                } as React.CSSProperties}
                aria-hidden={pos.cls !== " pc-slide--active"}
              >
                <Link href={`/urunler/${p.slug}`} className="pc-card" tabIndex={pos.cls === " pc-slide--active" ? 0 : -1}>
                  <div className="pc-card-media">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt=""
                        fill
                        className="pc-card-img"
                        sizes="(max-width: 640px) 80vw, 380px"
                        unoptimized
                      />
                    ) : null}
                    <div className="pc-card-shine" aria-hidden="true" />
                  </div>
                  <div className="pc-card-body">
                    <span className="pc-card-title">{p.name}</span>
                    {p.excerpt ? <p className="pc-card-excerpt">{p.excerpt}</p> : null}
                    <span className="pc-card-cta">
                      Detayı gör
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {len > 1 && (
        <button
          type="button"
          className="pc-nav pc-nav--next"
          onClick={() => go(1)}
          aria-label="Sonraki ürün"
          disabled={isAnimating}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Dots */}
      {len > 1 && (
        <div className="pc-dots" role="tablist" aria-label="Ürün seçici">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              className={`pc-dot${i === active ? " pc-dot--active" : ""}`}
              aria-selected={i === active}
              aria-label={p.name}
              onClick={() => {
                if (i === active || isAnimating) return;
                setIsAnimating(true);
                setActive(i);
                timerRef.current = setTimeout(() => setIsAnimating(false), 520);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SlidePos {
  x: number;
  scale: number;
  z: number;
  rotateY: number;
  opacity: number;
  cls: string;
}

function getPositions(len: number, active: number): SlidePos[] {
  return Array.from({ length: len }, (_, i) => {
    let diff = i - active;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;

    if (diff === 0) {
      return { x: 0, scale: 1, z: 40, rotateY: 0, opacity: 1, cls: " pc-slide--active" };
    }
    if (diff === 1 || (diff === -(len - 1) && len > 2)) {
      return { x: 62, scale: 0.82, z: 10, rotateY: -18, opacity: 0.7, cls: " pc-slide--next" };
    }
    if (diff === -1 || (diff === len - 1 && len > 2)) {
      return { x: -62, scale: 0.82, z: 10, rotateY: 18, opacity: 0.7, cls: " pc-slide--prev" };
    }
    if (diff === 2) {
      return { x: 110, scale: 0.65, z: -10, rotateY: -28, opacity: 0.35, cls: " pc-slide--far" };
    }
    if (diff === -2) {
      return { x: -110, scale: 0.65, z: -10, rotateY: 28, opacity: 0.35, cls: " pc-slide--far" };
    }
    return { x: diff > 0 ? 140 : -140, scale: 0.5, z: -30, rotateY: diff > 0 ? -35 : 35, opacity: 0, cls: " pc-slide--hidden" };
  });
}
