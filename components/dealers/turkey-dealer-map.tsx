"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactElement,
} from "react";
import TurkeyMap, { type CityType } from "turkey-map-react";
import { dealerColorFromId } from "@/lib/dealer-color";

export type DealerMapEntry = {
  id: number;
  name: string;
  phone?: string | null;
  contactPerson?: string | null;
  /** Hex renk (#RRGGBB). Yoksa id'den otomatik üretilir. */
  color?: string | null;
  /** ['01', '06', ...] */
  provinceCodes: string[];
};

export type ProvinceClickPayload = {
  plateCode: string;
  cityName: string;
  dealerId: number | null;
};

type Props = {
  dealers: DealerMapEntry[];
  /** Sağ listedeki bayiye göre illerde hover efekti (harita üzerinde). */
  highlightDealerId?: number | null;
  /** Bir ile tıklandığında (bayi varsa id, yoksa null). */
  onProvinceClick?: (payload: ProvinceClickPayload) => void;
};

type TooltipState = {
  show: boolean;
  x: number;
  y: number;
  cityName: string;
  dealerName?: string;
  dealerPhone?: string | null;
  dealerContact?: string | null;
  /** Bayi haritası / paneldeki renkle uyumlu tooltip vurgusu (#RRGGBB). */
  accentColor?: string | null;
};

const IDLE_FILL = "#e6e7ee";
const HOVER_FILL = "#c8c4ec";

function IconPin() {
  return (
    <svg className="td-tooltip__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.65" />
    </svg>
  );
}

function IconBuilding() {
  return (
    <svg className="td-tooltip__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 21V10l8-5 8 5v11"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
      <path
        d="M9 10h2M13 10h2M9 13h2M13 13h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="td-tooltip__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="td-tooltip__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.68 2.34a2 2 0 0 1-.45 2.11L8.09 9.41a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.74.32 1.53.55 2.34.68A2 2 0 0 1 22 16.92Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg className="td-tooltip__svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M12 16v-5M12 8h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Plaka numarasını "01", "06", "81" formatına döndürür.
 */
function pad(plate: number): string {
  return String(plate).padStart(2, "0");
}

/**
 * Plaka kodu → { dealer, color } eşlemesini önceden hesaplar.
 */
function buildPlateMap(dealers: DealerMapEntry[]) {
  const m = new Map<string, { dealer: DealerMapEntry; color: string }>();
  for (const d of dealers) {
    const color = d.color || dealerColorFromId(d.id);
    for (const code of d.provinceCodes) m.set(code, { dealer: d, color });
  }
  return m;
}

/**
 * Path geometrisinden merkez ve yazı boyutu hesaplayarak il adını harita üzerine yazar.
 */
function ProvinceNameLabel({
  pathD,
  name,
  assigned,
}: {
  pathD: string;
  name: string;
  assigned: boolean;
}) {
  const measureRef = useRef<SVGPathElement | null>(null);
  const [layout, setLayout] = useState<{ cx: number; cy: number; fs: number } | null>(null);

  const updateLayout = useCallback(() => {
    const el = measureRef.current;
    if (!el) return;
    try {
      const b = el.getBBox();
      if (b.width <= 0 || b.height <= 0) return;
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      let fs = Math.max(3.45, Math.min(12.2, Math.min(b.width, b.height) * 0.118));
      if (name.length >= 15) fs *= 0.74;
      else if (name.length >= 12) fs *= 0.84;
      else if (name.length >= 9) fs *= 0.92;
      setLayout({ cx, cy, fs });
    } catch {
      /* ignore */
    }
  }, [name, pathD]);

  useLayoutEffect(() => {
    updateLayout();
  }, [updateLayout]);

  useLayoutEffect(() => {
    const svg = measureRef.current?.ownerSVGElement;
    if (!svg || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updateLayout());
    ro.observe(svg);
    return () => ro.disconnect();
  }, [updateLayout]);

  return (
    <>
      <path ref={measureRef} d={pathD} className="td-province-measure" aria-hidden />
      {layout ? (
        <text
          x={layout.cx}
          y={layout.cy}
          textAnchor="middle"
          dominantBaseline="central"
          className={assigned ? "td-province-label td-province-label--assigned" : "td-province-label"}
          style={{ fontSize: layout.fs }}
          aria-hidden
        >
          {name}
        </text>
      ) : null}
    </>
  );
}

export function TurkeyDealerMap({
  dealers,
  highlightDealerId = null,
  onProvinceClick,
}: Props) {
  const plateMap = useMemo(() => buildPlateMap(dealers), [dealers]);
  const [tip, setTip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    cityName: "",
  });

  const onMove = useCallback((e: MouseEvent, city: CityType) => {
    const code = pad(city.plateNumber);
    const hit = plateMap.get(code);
    setTip({
      show: true,
      x: e.clientX,
      y: e.clientY,
      cityName: city.name,
      dealerName: hit?.dealer.name,
      dealerPhone: hit?.dealer.phone ?? null,
      dealerContact: hit?.dealer.contactPerson ?? null,
      accentColor: hit?.color ?? null,
    });
  }, [plateMap]);

  const onLeave = useCallback(() => {
    setTip((s) => ({ ...s, show: false }));
  }, []);

  const onProvinceActivate = useCallback(
    (e: MouseEvent, city: CityType) => {
      e.stopPropagation();
      const code = pad(city.plateNumber);
      const hit = plateMap.get(code);
      onProvinceClick?.({
        plateCode: code,
        cityName: city.name,
        dealerId: hit?.dealer.id ?? null,
      });
    },
    [plateMap, onProvinceClick],
  );

  const cityWrapper = useCallback(
    (cityComponent: ReactElement, city: CityType) => {
      const code = pad(city.plateNumber);
      const hit = plateMap.get(code);
      const fill = hit?.color ?? IDLE_FILL;
      const legendHover =
        highlightDealerId != null &&
        hit != null &&
        hit.dealer.id === highlightDealerId;
      const cls = [
        "td-city",
        hit ? "td-city--assigned" : "",
        legendHover ? "td-city--legend-hover" : "",
      ]
        .filter(Boolean)
        .join(" ");
      return (
        <g
          key={city.id}
          // Inline fill kullanmıyoruz; CSS variable ile path'a aktarıyoruz çünkü
          // turkey-map-react path'lere fill uygulamıyor; <g>'ye bırakıyor.
          style={{ "--td-fill": fill } as CSSProperties}
          className={cls}
          onMouseEnter={(e) => onMove(e, city)}
          onMouseMove={(e) => onMove(e, city)}
          onMouseLeave={onLeave}
          onClick={(e) => onProvinceActivate(e, city)}
        >
          {cityComponent}
          <ProvinceNameLabel pathD={city.path} name={city.name} assigned={hit != null} />
        </g>
      );
    },
    [plateMap, onMove, onLeave, onProvinceActivate, highlightDealerId],
  );

  return (
    <div className="td-shell">
      <div className="td-map">
        <TurkeyMap
          showTooltip={false}
          hoverable={false}
          customStyle={{ idleColor: IDLE_FILL, hoverColor: HOVER_FILL }}
          cityWrapper={cityWrapper}
        />
      </div>

      {tip.show ? (
        <div
          role="tooltip"
          className={`td-tooltip${tip.accentColor ? " td-tooltip--branded" : ""}`}
          style={{
            left: tip.x + 14,
            top: tip.y + 14,
            ...(tip.accentColor
              ? ({ "--td-tip-accent": tip.accentColor } as CSSProperties)
              : {}),
          }}
        >
          <div className="td-tooltip__header">
            <span className="td-tooltip__header-icon" aria-hidden="true">
              <IconPin />
            </span>
            <span className="td-tooltip__city">{tip.cityName}</span>
          </div>

          {tip.dealerName ? (
            <div className="td-tooltip__body">
              <div className="td-tooltip__row td-tooltip__row--primary">
                <span className="td-tooltip__row-icon" aria-hidden="true">
                  <IconBuilding />
                </span>
                <span className="td-tooltip__dealer">{tip.dealerName}</span>
              </div>
              {tip.dealerContact ? (
                <div className="td-tooltip__row">
                  <span className="td-tooltip__row-icon" aria-hidden="true">
                    <IconUser />
                  </span>
                  <span className="td-tooltip__muted">{tip.dealerContact}</span>
                </div>
              ) : null}
              {tip.dealerPhone ? (
                <div className="td-tooltip__row">
                  <span className="td-tooltip__row-icon" aria-hidden="true">
                    <IconPhone />
                  </span>
                  <span className="td-tooltip__muted td-tooltip__muted--tel">{tip.dealerPhone}</span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="td-tooltip__empty-wrap">
              <span className="td-tooltip__row-icon" aria-hidden="true">
                <IconInfo />
              </span>
              <p className="td-tooltip__empty">Bu il için kayıtlı bayi yok.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default TurkeyDealerMap;
