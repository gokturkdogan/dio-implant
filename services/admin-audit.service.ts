import "server-only";
import { and, count, desc, eq, gt, ne } from "drizzle-orm";
import { adminAuditLogs } from "../db/schema/admin-audit-log";
import { users } from "../db/schema/user";
import {
  AUDIT_COALESCE_WINDOW_MS,
  canCoalesceAudit,
  mergeAuditAction,
} from "../lib/admin-audit-coalesce";
import { db } from "../lib/drizzle";
import type { AdminAuditLogListItem } from "../lib/admin-audit-display";

export const adminAuditService = {
  async getActorByUserId(userId: number) {
    const row = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        email: true,
      },
    });
    if (!row) return null;
    return {
      userId: row.id,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
    };
  },

  async record(input: {
    userId: number;
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
  }): Promise<"inserted" | "merged"> {
    const resourceId = input.resourceId?.trim() || null;

    if (
      canCoalesceAudit({ action: input.action, resourceId }) &&
      resourceId
    ) {
      const since = new Date(Date.now() - AUDIT_COALESCE_WINDOW_MS);
      const recent = await db.query.adminAuditLogs.findFirst({
        where: and(
          eq(adminAuditLogs.userId, input.userId),
          eq(adminAuditLogs.resourceType, input.resourceType),
          eq(adminAuditLogs.resourceId, resourceId),
          ne(adminAuditLogs.action, "delete"),
          gt(adminAuditLogs.createdAt, since),
        ),
        orderBy: [desc(adminAuditLogs.createdAt), desc(adminAuditLogs.id)],
      });

      if (recent) {
        const mergedMeta =
          recent.metadata && input.metadata
            ? { ...(recent.metadata as Record<string, unknown>), ...input.metadata }
            : input.metadata ?? recent.metadata;

        await db
          .update(adminAuditLogs)
          .set({
            action: mergeAuditAction(recent.action, input.action),
            firstName: input.firstName ?? recent.firstName,
            lastName: input.lastName ?? recent.lastName,
            resourceLabel: input.resourceLabel ?? recent.resourceLabel,
            summary: input.summary,
            adminPath: input.adminPath ?? recent.adminPath,
            metadata: mergedMeta ?? null,
            createdAt: new Date(),
          })
          .where(eq(adminAuditLogs.id, recent.id));
        return "merged";
      }
    }

    await db.insert(adminAuditLogs).values({
      userId: input.userId,
      username: input.username,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      action: input.action,
      resourceType: input.resourceType,
      resourceId,
      resourceLabel: input.resourceLabel,
      summary: input.summary,
      adminPath: input.adminPath,
      metadata: input.metadata,
    });
    return "inserted";
  },

  async listForSuperAdmin(limit = 100, offset = 0): Promise<{
    logs: AdminAuditLogListItem[];
    total: number;
  }> {
    const rows = await db.query.adminAuditLogs.findMany({
      orderBy: [desc(adminAuditLogs.createdAt), desc(adminAuditLogs.id)],
      limit,
      offset,
    });

    const [countRow] = await db
      .select({ total: count() })
      .from(adminAuditLogs);

    return {
      logs: rows.map((r) => ({
        id: r.id,
        createdAt: r.createdAt.toISOString(),
        username: r.username,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        action: r.action,
        resourceType: r.resourceType,
        resourceId: r.resourceId,
        resourceLabel: r.resourceLabel,
        summary: r.summary,
        adminPath: r.adminPath,
        metadata: r.metadata ?? null,
      })),
      total: Number(countRow?.total ?? 0),
    };
  },
};
