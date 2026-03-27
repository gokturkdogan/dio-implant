import { productService } from "../../../../services/product.service";
import { jsonError, jsonOk } from "../../../../lib/http";
import {
  productIdSchema,
  updateProductSchema,
} from "../../../../validations/product.validation";

type ProductRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: ProductRouteParams) {
  try {
    const { id } = await params;
    const productId = productIdSchema.parse(id);
    const product = await productService.getById(productId);
    return jsonOk(product);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: ProductRouteParams) {
  try {
    const { id } = await params;
    const productId = productIdSchema.parse(id);
    const payload = await request.json();
    const input = updateProductSchema.parse(payload);

    const updated = await productService.update(productId, input);
    return jsonOk(updated);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: ProductRouteParams) {
  try {
    const { id } = await params;
    const productId = productIdSchema.parse(id);
    await productService.remove(productId);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
