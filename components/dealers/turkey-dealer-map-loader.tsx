"use client";

import dynamic from "next/dynamic";
import type { DealerMapEntry, ProvinceClickPayload } from "./turkey-dealer-map";

export type { ProvinceClickPayload };

const TurkeyDealerMap = dynamic(
  () => import("./turkey-dealer-map").then((m) => m.TurkeyDealerMap),
  {
    ssr: false,
    loading: () => (
      <div className="td-shell">
        <div className="td-map td-map--placeholder" aria-busy="true">
          Harita yükleniyor…
        </div>
      </div>
    ),
  },
);

export function TurkeyDealerMapLoader({
  dealers,
  highlightDealerId = null,
  onProvinceClick,
}: {
  dealers: DealerMapEntry[];
  highlightDealerId?: number | null;
  onProvinceClick?: (payload: ProvinceClickPayload) => void;
}) {
  return (
    <TurkeyDealerMap
      dealers={dealers}
      highlightDealerId={highlightDealerId}
      onProvinceClick={onProvinceClick}
    />
  );
}

export default TurkeyDealerMapLoader;
