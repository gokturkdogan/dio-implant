"use client";

import Link from "next/link";
import {
  auditActionLabel,
  auditResourceLabel,
  formatAuditActorName,
  formatAuditDateTime,
  type AdminAuditLogListItem,
} from "@/lib/admin-audit-display";

type Props = {
  log: AdminAuditLogListItem;
  onClose: () => void;
};

function actionBadgeClass(action: string): string {
  if (action === "create" || action === "invite") return "admin-audit-table__badge--create";
  if (action === "delete") return "admin-audit-table__badge--delete";
  if (action === "update" || action === "profile_update" || action === "password_update") {
    return "admin-audit-table__badge--update";
  }
  return "admin-audit-table__badge--neutral";
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconActivity() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M22 12h-4l-3 9L9 3l-3 9H2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconExternal() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 20 4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DetailSection({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={["admin-audit-detail-section", className].filter(Boolean).join(" ")}>
      <div className="admin-audit-detail-section__head">
        <span className="admin-audit-detail-section__icon" aria-hidden="true">
          {icon}
        </span>
        <h3 className="admin-audit-detail-section__title">{title}</h3>
      </div>
      <div className="admin-audit-detail-section__body">{children}</div>
    </section>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-audit-detail-row">
      <span className="admin-audit-detail-row__label">{label}</span>
      <div className="admin-audit-detail-row__value">{children}</div>
    </div>
  );
}

function formatMetadata(metadata: Record<string, unknown> | null): string | null {
  if (!metadata || Object.keys(metadata).length === 0) return null;
  try {
    return JSON.stringify(metadata, null, 2);
  } catch {
    return null;
  }
}

export function AdminAuditDetailModal({ log, onClose }: Props) {
  const when = formatAuditDateTime(log.createdAt);
  const fullName = formatAuditActorName(log);
  const meta = formatMetadata(log.metadata);
  const hasName = Boolean(log.firstName?.trim() || log.lastName?.trim());

  return (
    <div
      className="admin-modal-backdrop admin-mini-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="admin-mini-modal admin-audit-detail-modal-v2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-audit-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-audit-detail-modal-v2__hero">
          <div className="admin-audit-detail-modal-v2__hero-text">
            <p className="admin-audit-detail-modal-v2__eyebrow">İşlem detayı</p>
            <h2 id="admin-audit-detail-title" className="admin-audit-detail-modal-v2__title">
              {auditResourceLabel(log.resourceType)}
            </h2>
            <div className="admin-audit-detail-modal-v2__hero-badges">
              <span className={`admin-audit-table__badge ${actionBadgeClass(log.action)}`}>
                {auditActionLabel(log.action)}
              </span>
              {log.resourceLabel ? (
                <span className="admin-audit-detail-modal-v2__record-chip">
                  {log.resourceLabel}
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            className="admin-modal__close"
            onClick={onClose}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        <div className="admin-mini-modal__body admin-audit-detail-modal-v2__body">
          <div className="admin-audit-detail-modal-v2__grid">
            <DetailSection icon={<IconCalendar />} title="Zaman">
              <div className="admin-audit-detail-modal-v2__time-pair">
                <DetailRow label="Tarih">{when.date}</DetailRow>
                <DetailRow label="Saat">{when.time}</DetailRow>
              </div>
            </DetailSection>

            <DetailSection icon={<IconUser />} title="İşlemi yapan">
              <DetailRow label="Ad soyad">
                {hasName ? (
                  <span className="admin-audit-detail-modal-v2__name">{fullName}</span>
                ) : (
                  <span className="admin-audit-detail-modal-v2__name-muted">Kayıtlı değil</span>
                )}
              </DetailRow>
              <DetailRow label="Kullanıcı adı">
                <code className="admin-users-table__code">@{log.username}</code>
              </DetailRow>
              <DetailRow label="E-posta">
                <a href={`mailto:${log.email}`} className="admin-table-link">
                  {log.email}
                </a>
              </DetailRow>
            </DetailSection>

            <DetailSection icon={<IconLayers />} title="Alan ve kayıt">
              <DetailRow label="Panel alanı">{auditResourceLabel(log.resourceType)}</DetailRow>
              {log.resourceLabel ? (
                <DetailRow label="Kayıt adı">{log.resourceLabel}</DetailRow>
              ) : null}
              {log.resourceId ? (
                <DetailRow label="Kayıt no">
                  <code className="admin-users-table__code">{log.resourceId}</code>
                </DetailRow>
              ) : null}
            </DetailSection>

            <DetailSection
              icon={<IconActivity />}
              title="Özet"
              className="admin-audit-detail-section--wide"
            >
              <p className="admin-audit-detail-modal-v2__summary">{log.summary}</p>
            </DetailSection>

            {meta ? (
              <DetailSection
                icon={<IconFile />}
                title="Ek bilgi"
                className="admin-audit-detail-section--wide"
              >
                <pre className="admin-audit-detail-modal-v2__meta">{meta}</pre>
              </DetailSection>
            ) : null}
          </div>
        </div>

        <div className="admin-audit-detail-modal-v2__footer">
          {log.adminPath ? (
            <Link
              href={log.adminPath}
              className="admin-btn admin-btn--primary admin-audit-detail-modal-v2__link-btn"
              onClick={onClose}
            >
              <IconExternal />
              İlgili panele git
            </Link>
          ) : null}
          <button type="button" className="admin-btn admin-btn--ghost" onClick={onClose}>
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
