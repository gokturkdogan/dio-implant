"use client";

import { useCallback, useMemo, useState } from "react";
import { TurkeyDealerMapLoader } from "@/components/dealers/turkey-dealer-map-loader";
import { dealerColorFromId } from "@/lib/dealer-color";
import {
  ContactDealerDetailModal,
  type ContactDealerDetail,
} from "./contact-dealer-detail-modal";

export type ContactMapDealerInput = {
  id: number;
  name: string;
  phone: string;
  contactPerson: string | null;
  color: string | null;
  provinceCodes: string[];
  website: string | null;
  serviceRegion: string;
  provinces?: { code: string; name: string }[];
};

type Props = {
  dealers: ContactMapDealerInput[];
};

type ModalState =
  | { kind: "dealer"; dealer: ContactDealerDetail }
  | { kind: "no-dealer"; provinceName: string }
  | null;

function toDetail(d: ContactMapDealerInput): ContactDealerDetail {
  return {
    id: d.id,
    name: d.name,
    phone: d.phone,
    contactPerson: d.contactPerson,
    color: d.color || dealerColorFromId(d.id),
    website: d.website,
    serviceRegion: d.serviceRegion ?? "",
    provinces: d.provinces ?? [],
  };
}

export function ContactDealerMapPanel({ dealers }: Props) {
  const [highlightDealerId, setHighlightDealerId] = useState<number | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  const mapEntries = useMemo(
    () =>
      dealers.map((d) => ({
        id: d.id,
        name: d.name,
        phone: d.phone,
        contactPerson: d.contactPerson,
        color: d.color || dealerColorFromId(d.id),
        provinceCodes: d.provinceCodes,
      })),
    [dealers],
  );

  const byId = useMemo(() => new Map(dealers.map((d) => [d.id, d])), [dealers]);

  const onProvinceClick = useCallback(
    (payload: { plateCode: string; cityName: string; dealerId: number | null }) => {
      if (payload.dealerId != null) {
        const d = byId.get(payload.dealerId);
        if (d) {
          setModal({
            kind: "dealer",
            dealer: toDetail(d),
          });
        }
      } else {
        setModal({ kind: "no-dealer", provinceName: payload.cityName });
      }
    },
    [byId],
  );

  const openDealerModal = useCallback(
    (id: number) => {
      const d = byId.get(id);
      if (d) setModal({ kind: "dealer", dealer: toDetail(d) });
    },
    [byId],
  );

  const closeModal = useCallback(() => setModal(null), []);

  return (
    <>
      <div className="ct-dealer-map-panel">
        <div className="ct-dealer-map-layout">
          <div className="ct-dealer-map-main" aria-label="Türkiye bayi haritası">
            <TurkeyDealerMapLoader
              dealers={mapEntries}
              highlightDealerId={highlightDealerId}
              onProvinceClick={onProvinceClick}
            />
          </div>
          <aside className="ct-dealer-map-legend-col" aria-label="Bayiler ve harita renkleri">
            {dealers.length === 0 ? (
              <p className="ct-dealer-map-legend-empty">Kayıtlı bayi yok.</p>
            ) : (
              <ul className="ct-dealer-map-legend-list">
                {dealers.map((d) => {
                  const c = d.color || dealerColorFromId(d.id);
                  return (
                    <li
                      key={d.id}
                      className="ct-dealer-map-legend-item"
                      role="button"
                      tabIndex={0}
                      onMouseEnter={() => setHighlightDealerId(d.id)}
                      onMouseLeave={() => setHighlightDealerId(null)}
                      onClick={() => openDealerModal(d.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDealerModal(d.id);
                        }
                      }}
                    >
                      <span
                        className="ct-dealer-map-legend-dot"
                        style={{ background: c }}
                        aria-hidden="true"
                      />
                      <span className="ct-dealer-map-legend-name">{d.name}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>
        </div>
      </div>

      <ContactDealerDetailModal state={modal} onClose={closeModal} />
    </>
  );
}
