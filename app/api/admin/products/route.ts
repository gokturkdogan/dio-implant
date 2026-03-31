import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/admin-auth";
import { jsonError, jsonOk } from "../../../../lib/http";
import { productService } from "../../../../services/product.service";
import { createProductSchema } from "../../../../validations/product.validation";

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
    const products = await productService.listAll();
    return jsonOk({ products });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const body = await request.json();
    const input = createProductSchema.parse(body);
    const created = await productService.create(input);
    return jsonOk({ ok: true, product: created }, 201);
  } catch (e) {
    return jsonError(e);
  }
}
