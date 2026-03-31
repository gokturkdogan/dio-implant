import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { jsonError, jsonOk } from "../../../../../lib/http";
import { productService } from "../../../../../services/product.service";
import {
  productIdSchema,
  updateProductSchema,
} from "../../../../../validations/product.validation";

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
    const productId = productIdSchema.parse(id);
    const product = await productService.getById(productId);
    return jsonOk({ product });
  } catch (e) {
    return jsonError(e);
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const { id } = await params;
    const productId = productIdSchema.parse(id);
    const body = await request.json();
    const input = updateProductSchema.parse(body);
    const updated = await productService.update(productId, input);
    return jsonOk({ ok: true, product: updated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const { id } = await params;
    const productId = productIdSchema.parse(id);
    await productService.remove(productId);
    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
