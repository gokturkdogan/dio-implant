import { categoryService } from "../../../services/category.service";
import { jsonError, jsonOk } from "../../../lib/http";
import { createCategorySchema } from "../../../validations/category.validation";

export async function GET() {
  try {
    const categories = await categoryService.listAll();
    return jsonOk(categories);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = createCategorySchema.parse(payload);

    const created = await categoryService.create(input);
    return jsonOk(created, 201);
  } catch (error) {
    return jsonError(error);
  }
}
