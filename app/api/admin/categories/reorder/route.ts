import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { jsonError, jsonOk } from "../../../../../lib/http";
import { categoryService } from "../../../../../services/category.service";
import { productService } from "../../../../../services/product.service";
import { auditAdminAction } from "@/lib/admin-audit";
import { reorderCategoriesSchema } from "../../../../../validations/category.validation";

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

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = reorderCategoriesSchema.parse(body);
    await categoryService.reorderSiblings(input.parentId, input.orderedIds);
    await auditAdminAction({
      action: "reorder",
      resourceType: "category",
      resourceLabel: input.parentId ? `Alt kategoriler (#${input.parentId})` : "Üst kategoriler",
      metadata: { orderedIds: input.orderedIds },
    });
    const [categories, productCounts] = await Promise.all([
      categoryService.listAll(),
      productService.countByCategoryId(),
    ]);
    return jsonOk({ ok: true, categories, productCounts });
  } catch (e) {
    return jsonError(e);
  }
}
