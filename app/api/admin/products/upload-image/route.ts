import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { AppError } from "../../../../../lib/errors";
import { jsonError, jsonOk } from "../../../../../lib/http";
import {
  processImageFileToCloudinaryWebp,
  productFolder,
} from "../../../../../lib/cloudinary-media";

export const runtime = "nodejs";

const productSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Geçersiz slug");

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("main"),
  }),
  z.object({
    kind: z.literal("poster"),
    index: z.coerce.number().int().min(0).max(39),
  }),
]);

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
    const rawKind = formData.get("kind");
    const rawIndex = formData.get("index");

    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("file alanı zorunlu", 400);
    }
    if (typeof rawSlug !== "string") {
      throw new AppError("slug gerekli", 400);
    }
    if (rawKind !== "main" && rawKind !== "poster") {
      throw new AppError("kind: main veya poster olmalı", 400);
    }

    const slug = productSlugSchema.parse(rawSlug);
    const parsed = bodySchema.parse(
      rawKind === "main"
        ? { kind: "main" as const }
        : { kind: "poster" as const, index: rawIndex ?? "0" },
    );

    const folder = productFolder(slug);
    const publicId =
      parsed.kind === "main" ? "main" : `poster-${parsed.index + 1}`;

    const url = await processImageFileToCloudinaryWebp(file, folder, publicId);

    return jsonOk({ url, kind: parsed.kind, index: parsed.kind === "poster" ? parsed.index : null });
  } catch (error) {
    return jsonError(error);
  }
}
