/** Aynı kayıt için kısa sürede gelen birden fazla API çağrısını tek günlük satırında birleştirir. */

export const AUDIT_COALESCE_WINDOW_MS = 15_000;

const ACTION_PRIORITY: Record<string, number> = {
  delete: 100,
  create: 80,
  invite: 75,
  update: 60,
  profile_update: 55,
  password_update: 55,
  upload: 40,
  reorder: 30,
};

/** Birleştirilmiş satırda hangi işlem tipi görünsün (daha “ana” olan kazanır). */
export function mergeAuditAction(existing: string, incoming: string): string {
  const a = ACTION_PRIORITY[existing] ?? 0;
  const b = ACTION_PRIORITY[incoming] ?? 0;
  return b >= a ? incoming : existing;
}

/** Silme ve kayıtsız işlemler birleştirilmez. */
export function canCoalesceAudit(input: {
  action: string;
  resourceId: string | null;
}): boolean {
  if (input.action === "delete") return false;
  if (!input.resourceId?.trim()) return false;
  return true;
}
