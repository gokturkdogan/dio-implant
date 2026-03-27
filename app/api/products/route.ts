import { productService } from "../../../services/product.service";
import { jsonError, jsonOk } from "../../../lib/http";
import {
  createProductSchema,
  productQuerySchema,
} from "../../../validations/product.validation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const query = productQuerySchema.parse({
      categorySlug: searchParams.get("categorySlug") ?? undefined,
    });

    const products = await productService.listAll(query);
    return jsonOk(products);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = createProductSchema.parse(payload);

    const created = await productService.create(input);
    return jsonOk(created, 201);
  } catch (error) {
    return jsonError(error);
  }
}
