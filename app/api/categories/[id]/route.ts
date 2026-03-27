import { categoryService } from "../../../../services/category.service";
import { jsonError, jsonOk } from "../../../../lib/http";
import {
  categoryIdSchema,
  updateCategorySchema,
} from "../../../../validations/category.validation";

type CategoryRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: CategoryRouteParams) {
  try {
    const { id } = await params;
    const categoryId = categoryIdSchema.parse(id);
    const category = await categoryService.getById(categoryId);
    return jsonOk(category);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PUT(request: Request, { params }: CategoryRouteParams) {
  try {
    const { id } = await params;
    const categoryId = categoryIdSchema.parse(id);
    const payload = await request.json();
    const input = updateCategorySchema.parse(payload);

    const updated = await categoryService.update(categoryId, input);
    return jsonOk(updated);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(_: Request, { params }: CategoryRouteParams) {
  try {
    const { id } = await params;
    const categoryId = categoryIdSchema.parse(id);
    await categoryService.remove(categoryId);
    return jsonOk({ success: true });
  } catch (error) {
    return jsonError(error);
  }
}
