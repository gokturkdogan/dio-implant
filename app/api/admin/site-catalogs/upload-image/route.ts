import { z } from "zod";
import { requireAdminApi } from "@/lib/require-admin-api";
import {
  catalogImageFolder,
  processImageFileToCloudinaryWebp,
} from "@/lib/cloudinary-media";
import { jsonError, jsonOk } from "@/lib/http";
import { slugify } from "@/lib/slug";
import { siteCatalogService } from "@/services/site-catalog.service";

export const runtime = "nodejs";

const catalogIdSchema = z.coerce.number().int().positive();

/** Kapak: WebP dönüşümü + Cloudinary `Catalogs/{slug}-{id}/cover` */
export async function POST(request: Request) {
  try {
    if (!(await requireAdminApi())) return jsonOk({ error: "Yetkisiz" }, 401);

    const formData = await request.formData();
    const file = formData.get("file");
    const rawId = formData.get("catalogId");

    if (!(file instanceof File) || file.size === 0) {
      return jsonOk({ error: "file alanı zorunlu" }, 400);
    }
    const catalogId = catalogIdSchema.parse(rawId);

    const row = await siteCatalogService.getById(catalogId);
    if (!row) return jsonOk({ error: "Katalog bulunamadı" }, 404);

    const folder =
      row.cloudinaryFolder?.trim() ||
      catalogImageFolder(slugify(row.title) || "katalog", catalogId);

    const url = await processImageFileToCloudinaryWebp(file, folder, "cover");
    const catalog = await siteCatalogService.setCoverAssets(catalogId, url, folder);

    return jsonOk({ ok: true, url, catalog });
  } catch (e) {
    return jsonError(e);
  }
}
