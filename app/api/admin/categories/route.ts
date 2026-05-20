import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/admin-auth";
import { jsonError, jsonOk } from "../../../../lib/http";
import { categoryService } from "../../../../services/category.service";
import { productService } from "../../../../services/product.service";
import { auditAdminAction } from "@/lib/admin-audit";
import { createCategorySchema } from "../../../../validations/category.validation";

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

export async function GET() {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const [categories, productCounts] = await Promise.all([
      categoryService.listAll(),
      productService.countByCategoryId(),
    ]);
    return jsonOk({ categories, productCounts });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = createCategorySchema.parse(body);
    const created = await categoryService.create(input);
    await auditAdminAction({
      action: "create",
      resourceType: "category",
      resourceId: created.id,
      resourceLabel: created.name,
    });
    return jsonOk({ ok: true, category: created }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
