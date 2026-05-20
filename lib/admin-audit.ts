import "server-only";
import type { AdminAuditLogRow } from "@/db/schema/admin-audit-log";
import { adminAuditService } from "@/services/admin-audit.service";
import { getAdminSession } from "./require-admin-api";

export type AdminAuditAction =
  | "create"
  | "update"
  | "delete"
  | "reorder"
  | "upload"
  | "invite"
  | "profile_update"
  | "password_update";

export type AdminAuditResourceType =
  | "category"
  | "product"
  | "training"
  | "instructor"
  | "dealer"
  | "regional_office"
  | "site_catalog"
  | "digital_library"
  | "site_contact"
  | "site_maintenance"
  | "site_popup"
  | "user_invitation"
  | "account"
  | "media_upload";

const RESOURCE_META: Record<
  AdminAuditResourceType,
  { label: string; adminPath: string | null }
> = {
  category: { label: "kategori", adminPath: "/admin-panel/kategoriler" },
  product: { label: "ürün", adminPath: "/admin-panel/urunler" },
  training: { label: "eğitim etkinliği", adminPath: "/admin-panel/egitimler" },
  instructor: { label: "eğitmen", adminPath: "/admin-panel/egitmenler" },
  dealer: { label: "yetkili bayi", adminPath: "/admin-panel/bayiler" },
  regional_office: { label: "bölge ofisi", adminPath: "/admin-panel/ofisler" },
  site_catalog: { label: "katalog", adminPath: "/admin-panel/kataloglar" },
  digital_library: {
    label: "dijital kütüphane",
    adminPath: "/admin-panel/dijital-kutuphane",
  },
  site_contact: {
    label: "iletişim bilgileri",
    adminPath: "/admin-panel/iletisim-bilgileri",
  },
  site_maintenance: {
    label: "bakım modu",
    adminPath: "/admin-panel/bakim-modu",
  },
  site_popup: { label: "anasayfa popup", adminPath: "/admin-panel" },
  user_invitation: {
    label: "kullanıcı daveti",
    adminPath: "/admin-panel/kullanicilar",
  },
  account: { label: "hesap", adminPath: "/admin-panel/hesap-bilgileri" },
  media_upload: { label: "görsel yükleme", adminPath: null },
};

const ACTION_PHRASE: Record<AdminAuditAction, (resourceLabel: string) => string> = {
  create: (r) =>
    r ? `yeni bir kayıt ekledi: ${r}.` : "yeni bir kayıt ekledi.",
  update: (r) =>
    r ? `"${r}" kaydında güncelleme yaptı.` : "bir kayıtta güncelleme yaptı.",
  delete: (r) =>
    r ? `"${r}" kaydını sildi.` : "bir kaydı sildi.",
  reorder: (r) =>
    r
      ? `"${r}" için sıralamayı güncelledi.`
      : "sıralama bilgisini güncelledi.",
  upload: (r) =>
    r ? `"${r}" için görsel yükledi.` : "görsel yükledi.",
  invite: (r) =>
    r
      ? `${r} adresine kullanıcı daveti gönderdi.`
      : "kullanıcı daveti gönderdi.",
  profile_update: () => "hesap profil bilgilerini (ad/soyad) güncelledi.",
  password_update: () => "hesap parolasını güncelledi.",
};

function formatWhen(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
}

export function buildAdminAuditSummary(input: {
  username: string;
  email: string;
  action: AdminAuditAction;
  resourceType: AdminAuditResourceType;
  resourceLabel?: string | null;
  at?: Date;
}): string {
  const meta = RESOURCE_META[input.resourceType];
  const when = formatWhen(input.at ?? new Date());
  const label = input.resourceLabel?.trim() || null;
  const phrase = ACTION_PHRASE[input.action](label ?? meta.label);

  if (input.action === "invite" || input.action === "profile_update" || input.action === "password_update") {
    return `${when} — ${input.username} (${input.email}) ${phrase}`;
  }

  if (input.action === "create" && label) {
    return `${when} — ${input.username} (${input.email}) yeni bir ${meta.label} ekledi: "${label}".`;
  }

  if (label) {
    return `${when} — ${input.username} (${input.email}) ${meta.label} — ${phrase}`;
  }

  return `${when} — ${input.username} (${input.email}) ${meta.label}: ${phrase}`;
}

export type AuditAdminActionInput = {
  action: AdminAuditAction;
  resourceType: AdminAuditResourceType;
  resourceId?: string | number | null;
  resourceLabel?: string | null;
  adminPath?: string | null;
  metadata?: Record<string, unknown> | null;
};

/**
 * Ara adım görsel yükleme uçları — asıl kayıt PUT/POST ile birleştirilir, ayrı log yazılmaz.
 * (Ürün/kategori/katalog kaydet akışlarında birden fazla istek atılır.)
 */
export function shouldSkipEphemeralUploadAudit(
  resourceType: AdminAuditResourceType,
): boolean {
  return (
    resourceType === "product" ||
    resourceType === "category" ||
    resourceType === "site_catalog" ||
    resourceType === "site_popup" ||
    resourceType === "media_upload"
  );
}

/** Başarılı panel mutasyonundan sonra çağrılır; hata fırlatmaz. */
export async function auditAdminAction(
  input: AuditAdminActionInput & { skipIfEphemeralUpload?: boolean },
): Promise<void> {
  if (
    input.skipIfEphemeralUpload !== false &&
    input.action === "upload" &&
    shouldSkipEphemeralUploadAudit(input.resourceType)
  ) {
    return;
  }
  try {
    const session = await getAdminSession();
    if (!session) return;

    const actor = await adminAuditService.getActorByUserId(session.userId);
    if (!actor) return;

    const meta = RESOURCE_META[input.resourceType];
    const resourceId =
      input.resourceId === undefined || input.resourceId === null
        ? null
        : String(input.resourceId);
    const resourceLabel = input.resourceLabel?.trim() || null;
    const adminPath = input.adminPath ?? meta.adminPath;

    const summary = buildAdminAuditSummary({
      username: actor.username,
      email: actor.email,
      action: input.action,
      resourceType: input.resourceType,
      resourceLabel,
    });

    await adminAuditService.record({
      userId: session.userId,
      username: actor.username,
      firstName: actor.firstName,
      lastName: actor.lastName,
      email: actor.email,
      action: input.action,
      resourceType: input.resourceType,
      resourceId,
      resourceLabel,
      summary,
      adminPath,
      metadata: input.metadata ?? null,
    });
  } catch (err) {
    console.error("[auditAdminAction]", err);
  }
}

export type { AdminAuditLogListItem } from "./admin-audit-display";
