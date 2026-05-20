/** Panel formları — kayıt tamamlandığında tek işlem günlüğü satırı. */

export type ClientAuditPayload = {
  action: "create" | "update" | "delete";
  resourceType: string;
  resourceId?: string | number | null;
  resourceLabel?: string | null;
  adminPath?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function recordAdminAuditFromClient(
  payload: ClientAuditPayload,
): Promise<void> {
  try {
    await fetch("/api/admin/audit-logs/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    /* günlük hatası ana işlemi bozmasın */
  }
}
