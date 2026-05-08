"use client";

import { useEffect, type CSSProperties } from "react";
import { createPortal } from "react-dom";

export type ContactDealerDetail = {
  id: number;
  name: string;
  phone: string;
  contactPerson: string | null;
  color: string;
  website: string | null;
  serviceRegion: string;
  provinces?: { code: string; name: string }[];
};

type ModalState =
  | { kind: "dealer"; dealer: ContactDealerDetail }
  | { kind: "no-dealer"; provinceName: string }
  | null;

type Props = {
  state: ModalState;
  onClose: () => void;
};

/** Boş değilse gösterim ve tıklanabilir href için normalize eder. */
function normalizeWebsite(raw: string | null): { href: string; label: string } | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t === "") return null;
  const hasProtocol = /^https?:\/\//i.test(t);
  const href = hasProtocol ? t : `https://${t}`;
  const label = t.replace(/^https?:\/\//i, "").replace(/\/$/, "") || t;
  return { href, label };
}

function sortProvinces(list: { code: string; name: string }[]) {
  return [...list].sort((a, b) =>
    a.code.localeCompare(b.code, undefined, { numeric: true }),
  );
}

function IconTerritory({ className }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 2v16M16 6v16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconPin({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconPhone({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.65" />
      <path d="M20 21a8 8 0 1 0-16 0" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.65" />
      <path
        d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2Z"
        stroke="currentColor"
        strokeWidth="1.65"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ContactDealerDetailModal({ state, onClose }: Props) {
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [state, onClose]);

  if (typeof document === "undefined" || !state) return null;

  const accentStyle =
    state.kind === "dealer"
      ? ({ "--ct-modal-accent": state.dealer.color } as CSSProperties)
      : undefined;

  return createPortal(
    <div
      className="ct-dealer-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className={
          state.kind === "dealer"
            ? "ct-dealer-modal ct-dealer-modal--accent"
            : "ct-dealer-modal"
        }
        style={accentStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ct-dealer-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {state.kind === "no-dealer" ? (
          <>
            <div className="ct-dealer-modal__head ct-dealer-modal__head--neutral">
              <h2 id="ct-dealer-modal-title" className="ct-dealer-modal__title">
                {state.provinceName}
              </h2>
              <button
                type="button"
                className="ct-dealer-modal__close"
                onClick={onClose}
                aria-label="Kapat"
              >
                <IconClose />
              </button>
            </div>
            <div className="ct-dealer-modal__body">
              <div className="ct-dealer-modal__empty-panel">
                <span className="ct-dealer-modal__empty-panel-icon" aria-hidden="true">
                  <IconTerritory />
                </span>
                <p className="ct-dealer-modal__empty-msg">
                  Bu il için henüz kayıtlı yetkili bayi bulunmuyor.
                </p>
              </div>
            </div>
            <div className="ct-dealer-modal__footer">
              <button type="button" className="ct-dealer-modal__btn" onClick={onClose}>
                Tamam
              </button>
            </div>
          </>
        ) : (
          <DealerModalBody dealer={state.dealer} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body,
  );
}

function DealerModalBody({
  dealer,
  onClose,
}: {
  dealer: ContactDealerDetail;
  onClose: () => void;
}) {
  const provinces = sortProvinces(dealer.provinces ?? []);
  const serviceRegion = dealer.serviceRegion ?? "";
  const regionText = serviceRegion.trim();
  const website = normalizeWebsite(dealer.website);

  return (
    <>
      <div className="ct-dealer-modal__head ct-dealer-modal__head--accent">
        <div className="ct-dealer-modal__head-inner">
          <span
            className="ct-dealer-modal__swatch"
            style={{ background: dealer.color }}
            aria-hidden="true"
          />
          <div className="ct-dealer-modal__head-text">
            <h2 id="ct-dealer-modal-title" className="ct-dealer-modal__title">
              {dealer.name}
            </h2>
          </div>
        </div>
        <button
          type="button"
          className="ct-dealer-modal__close"
          onClick={onClose}
          aria-label="Kapat"
        >
          <IconClose />
        </button>
      </div>
      <div className="ct-dealer-modal__body">
        {provinces.length > 0 ? (
          <section className="ct-dealer-modal__panel" aria-label="Sorumlu iller">
            <div className="ct-dealer-modal__section-head">
              <span className="ct-dealer-modal__section-head-ico" aria-hidden="true">
                <IconTerritory />
              </span>
              <div className="ct-dealer-modal__section-head-text">
                <h3 className="ct-dealer-modal__section-title">Sorumlu iller</h3>
                <p className="ct-dealer-modal__section-meta">{provinces.length} il</p>
              </div>
            </div>
            <ul className="ct-dealer-modal__province-list">
              {provinces.map((p) => (
                <li key={p.code} className="ct-dealer-modal__province-row">
                  <span className="ct-dealer-modal__province-pin" aria-hidden="true">
                    <IconPin />
                  </span>
                  <span className="ct-dealer-modal__province-name">{p.name}</span>
                  <span className="ct-dealer-modal__province-plate">{p.code}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : regionText.length > 0 ? (
          <section className="ct-dealer-modal__panel ct-dealer-modal__panel--muted">
            <div className="ct-dealer-modal__section-head">
              <span className="ct-dealer-modal__section-head-ico" aria-hidden="true">
                <IconTerritory />
              </span>
              <div className="ct-dealer-modal__section-head-text">
                <h3 className="ct-dealer-modal__section-title">Hizmet alanı</h3>
              </div>
            </div>
            <p className="ct-dealer-modal__text ct-dealer-modal__text--region">{regionText}</p>
          </section>
        ) : null}

        <section className="ct-dealer-modal__panel ct-dealer-modal__panel--contact">
          <div className="ct-dealer-modal__section-head">
            <span className="ct-dealer-modal__section-head-ico" aria-hidden="true">
              <IconPhone />
            </span>
            <div className="ct-dealer-modal__section-head-text">
              <h3 className="ct-dealer-modal__section-title">İletişim</h3>
            </div>
          </div>
          <ul className="ct-dealer-modal__contacts">
            <li>
              <span className="ct-dealer-modal__contact-badge" aria-hidden="true">
                <IconPhone />
              </span>
              <div className="ct-dealer-modal__contact-body">
                <span className="ct-dealer-modal__contact-k">Telefon</span>
                <a href={`tel:${dealer.phone.replace(/\s/g, "")}`}>{dealer.phone}</a>
              </div>
            </li>
            {dealer.contactPerson ? (
              <li>
                <span className="ct-dealer-modal__contact-badge" aria-hidden="true">
                  <IconUser />
                </span>
                <div className="ct-dealer-modal__contact-body">
                  <span className="ct-dealer-modal__contact-k">Yetkili</span>
                  <span>{dealer.contactPerson}</span>
                </div>
              </li>
            ) : null}
            {website ? (
              <li>
                <span className="ct-dealer-modal__contact-badge" aria-hidden="true">
                  <IconGlobe />
                </span>
                <div className="ct-dealer-modal__contact-body">
                  <span className="ct-dealer-modal__contact-k">Web sitesi</span>
                  <a href={website.href} target="_blank" rel="noopener noreferrer">
                    {website.label}
                  </a>
                </div>
              </li>
            ) : null}
          </ul>
        </section>
      </div>
      <div className="ct-dealer-modal__footer">
        <button type="button" className="ct-dealer-modal__btn ct-dealer-modal__btn--accent" onClick={onClose}>
          Kapat
        </button>
      </div>
    </>
  );
}
