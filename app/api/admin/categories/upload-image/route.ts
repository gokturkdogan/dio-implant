import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { AppError } from "../../../../../lib/errors";
import { jsonError, jsonOk } from "../../../../../lib/http";
import {
  categoryFolder,
  processImageFileToCloudinaryWebp,
} from "../../../../../lib/cloudinary-media";

export const runtime = "nodejs";

const categoryImageSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Geçersiz slug");

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      throw new AppError("Unauthorized", 401);
    }
    await verifyAdminToken(token);

    const formData = await request.formData();
    const file = formData.get("file");
    const rawSlug = formData.get("slug");

    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("file alanı zorunlu", 400);
    }
    if (typeof rawSlug !== "string") {
      throw new AppError("slug gerekli", 400);
    }

    const slug = categoryImageSlugSchema.parse(rawSlug);
    const folder = categoryFolder(slug);
    const url = await processImageFileToCloudinaryWebp(file, folder, "image");
    return jsonOk({ url });
  } catch (error) {
    return jsonError(error);
  }
}
