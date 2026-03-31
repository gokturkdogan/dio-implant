import { cookies } from "next/headers";
import { z } from "zod";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { AppError } from "../../../../../lib/errors";
import { jsonError, jsonOk } from "../../../../../lib/http";
import {
  processPdfFileToCloudinaryRaw,
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
  z.object({
    kind: z.literal("carousel"),
    index: z.coerce.number().int().min(0).max(2),
  }),
  z.object({
    kind: z.literal("catalog"),
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
    if (
      rawKind !== "main" &&
      rawKind !== "poster" &&
      rawKind !== "carousel" &&
      rawKind !== "catalog"
    ) {
      throw new AppError("kind: main, poster, carousel veya catalog olmalı", 400);
    }

    const slug = productSlugSchema.parse(rawSlug);
    const parsed = bodySchema.parse(
      rawKind === "main"
        ? { kind: "main" as const }
        : rawKind === "catalog"
          ? { kind: "catalog" as const }
        : rawKind === "poster"
          ? { kind: "poster" as const, index: rawIndex ?? "0" }
          : { kind: "carousel" as const, index: rawIndex ?? "0" },
    );

    const folder = productFolder(slug);
    const publicId =
      parsed.kind === "main"
        ? "main"
        : parsed.kind === "poster"
          ? `poster-${parsed.index + 1}`
          : parsed.kind === "carousel"
            ? `carusel-${parsed.index + 1}`
            : "catalog";

    const url =
      parsed.kind === "catalog"
        ? await processPdfFileToCloudinaryRaw(file, folder, publicId)
        : await processImageFileToCloudinaryWebp(file, folder, publicId);

    return jsonOk({
      url,
      kind: parsed.kind,
      index:
        parsed.kind === "poster" || parsed.kind === "carousel"
          ? parsed.index
          : null,
    });
  } catch (error) {
    // Keep this log for diagnosing provider-side failures (Cloudinary, size, format, etc.)
    console.error("[admin/products/upload-image] upload failed:", error);
    if (error && typeof error === "object" && "message" in error) {
      const message = String((error as { message?: unknown }).message ?? "Upload başarısız");
      return jsonOk({ error: message }, 500);
    }
    return jsonError(error);
  }
}
