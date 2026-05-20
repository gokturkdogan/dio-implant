/** İşlem günlüğü — panel listesi ve modal için Türkçe etiketler (istemci + sunucu). */

export type AdminAuditLogListItem = {
  id: number;
  createdAt: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  resourceLabel: string | null;
  summary: string;
  adminPath: string | null;
  metadata: Record<string, unknown> | null;
};

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  create: "Ekleme",
  update: "Güncelleme",
  delete: "Silme",
  reorder: "Sıralama",
  upload: "Yükleme",
  invite: "Davet",
  profile_update: "Profil güncelleme",
  password_update: "Parola güncelleme",
};

export const AUDIT_RESOURCE_LABELS: Record<string, string> = {
  category: "Kategoriler",
  product: "Ürünler",
  training: "Eğitimler",
  instructor: "Eğitmenler",
  dealer: "Yetkili bayiler",
  regional_office: "Bölge ofisleri",
  site_catalog: "Kataloglar",
  digital_library: "Dijital kütüphane",
  site_contact: "İletişim bilgileri",
  site_maintenance: "Bakım modu",
  site_popup: "Popup yönetimi",
  user_invitation: "Kullanıcılar",
  account: "Hesap",
  media_upload: "Medya",
};

export function auditActionLabel(action: string): string {
  return AUDIT_ACTION_LABELS[action] ?? action;
}

export function auditResourceLabel(resourceType: string): string {
  return AUDIT_RESOURCE_LABELS[resourceType] ?? resourceType;
}

export function formatAuditActorName(log: {
  firstName: string | null;
  lastName: string | null;
  username: string;
}): string {
  const full = [log.firstName?.trim(), log.lastName?.trim()].filter(Boolean).join(" ");
  return full || `@${log.username}`;
}

export function formatAuditDateTime(iso: string): { date: string; time: string } {
  try {
    const d = new Date(iso);
    return {
      date: new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(d),
      time: new Intl.DateTimeFormat("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(d),
    };
  } catch {
    return { date: iso, time: "" };
  }
}
