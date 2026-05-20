import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { jsonError, jsonOk } from "../../../../../lib/http";
import { categoryService } from "../../../../../services/category.service";
import { auditAdminAction } from "@/lib/admin-audit";
import {
  categoryIdSchema,
  updateCategorySchema,
} from "../../../../../validations/category.validation";

export const runtime = "nodejs";

async function requireAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return false;
  try {
    await verifyAdminToken(token);
    return true;
  } catch {
    return false;
  }
}

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const { id } = await params;
    const categoryId = categoryIdSchema.parse(id);
    const category = await categoryService.getById(categoryId);
    return jsonOk({ category });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const { id } = await params;
    const categoryId = categoryIdSchema.parse(id);
    const body = await request.json();
    const input = updateCategorySchema.parse(body);
    const updated = await categoryService.update(categoryId, input);
    await auditAdminAction({
      action: "update",
      resourceType: "category",
      resourceId: updated.id,
      resourceLabel: updated.name,
    });
    return jsonOk({ ok: true, category: updated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const { id } = await params;
    const categoryId = categoryIdSchema.parse(id);
    const existing = await categoryService.getById(categoryId);
    await categoryService.remove(categoryId);
    await auditAdminAction({
      action: "delete",
      resourceType: "category",
      resourceId: categoryId,
      resourceLabel: existing.name,
    });
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
