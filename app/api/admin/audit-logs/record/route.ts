import { z } from "zod";
import { auditAdminAction, type AdminAuditAction, type AdminAuditResourceType } from "@/lib/admin-audit";
import { jsonError, jsonOk } from "@/lib/http";
import { requireAdminApi } from "@/lib/require-admin-api";

export const runtime = "nodejs";

const bodySchema = z.object({
  action: z.enum([
    "create",
    "update",
    "delete",
    "reorder",
    "upload",
    "invite",
    "profile_update",
    "password_update",
  ]),
  resourceType: z.string().min(1).max(64),
  resourceId: z.union([z.string(), z.number()]).optional().nullable(),
  resourceLabel: z.string().max(200).optional().nullable(),
  adminPath: z.string().max(256).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).optional().nullable(),
});

export async function POST(request: Request) {
  try {
    if (!(await requireAdminApi())) {
      return jsonOk({ error: "Yetkisiz" }, 401);
    }
    const body = bodySchema.parse(await request.json());
    await auditAdminAction({
      action: body.action as AdminAuditAction,
      resourceType: body.resourceType as AdminAuditResourceType,
      resourceId: body.resourceId ?? null,
      resourceLabel: body.resourceLabel ?? null,
      adminPath: body.adminPath ?? null,
      metadata: body.metadata ?? null,
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
