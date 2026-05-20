import { cookies } from "next/headers";
import sharp from "sharp";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/admin-auth";
import { MAX_ADMIN_IMAGE_UPLOAD_BYTES } from "../../../../lib/admin-image-upload";
import { cloudinary } from "../../../../lib/cloudinary";
import { AppError } from "../../../../lib/errors";
import { jsonError, jsonOk } from "../../../../lib/http";
import { trainingEventSchema } from "../../../../lib/training-events-schema";
import type { TrainingEvent } from "../../../../lib/training-events-types";
import { auditAdminAction } from "@/lib/admin-audit";
import { seminarService } from "../../../../services/seminar.service";

export const runtime = "nodejs";

const SEMINARS_ROOT = "Seminars";

/* ── Auth ── */

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

/* ── Cloudinary helpers ── */

function seminarFolder(slug: string) {
  return `${SEMINARS_ROOT}/${slug}`;
}

async function uploadBuffer(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "image",
        format: "webp",
        overwrite: true,
        invalidate: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

async function processAndUpload(
  file: File,
  folder: string,
  publicId: string,
): Promise<string> {
  if (file.size > MAX_ADMIN_IMAGE_UPLOAD_BYTES) {
    throw new AppError("Dosya boyutu 10MB'dan büyük olamaz", 413);
  }
  if (!file.type.startsWith("image/")) {
    throw new AppError("Sadece görsel dosyası yüklenebilir", 400);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const webp = await sharp(buf).rotate().webp({ quality: 82 }).toBuffer();
  return uploadBuffer(webp, folder, publicId);
}

async function deleteCloudinaryFolder(slug: string): Promise<void> {
  const prefix = `${seminarFolder(slug)}/`;
  try {
    await cloudinary.api.delete_resources_by_prefix(prefix);
    await cloudinary.api.delete_folder(seminarFolder(slug));
  } catch {
    // Klasör yoksa hata yutulur
  }
}

async function downloadUrl(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function handleSlugRename(
  oldSlug: string,
  newSlug: string,
  existingEvent: TrainingEvent,
): Promise<{
  coverUrl?: string;
  posterUrl?: string;
}> {
  const folder = seminarFolder(newSlug);
  const result: {
    coverUrl?: string;
    posterUrl?: string;
  } = {};

  if (existingEvent.coverUrl) {
    try {
      const buf = await downloadUrl(existingEvent.coverUrl);
      result.coverUrl = await uploadBuffer(buf, folder, `cover-${newSlug}`);
    } catch { /* eski görsel alınamazsa atla */ }
  }
  if (existingEvent.posterUrl) {
    try {
      const buf = await downloadUrl(existingEvent.posterUrl);
      result.posterUrl = await uploadBuffer(buf, folder, `poster-${newSlug}`);
    } catch { /* eski görsel alınamazsa atla */ }
  }

  await deleteCloudinaryFolder(oldSlug);
  return result;
}

/* ── GET ── */

export async function GET() {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const events = await seminarService.listAll();
    return jsonOk({ events });
  } catch (e) {
    return jsonError(e);
  }
}

/* ── POST (create) ── */

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);

    const fd = await request.formData();
    const rawEvent = fd.get("event");
    if (typeof rawEvent !== "string") throw new AppError("event alanı gerekli", 400);

    const parsed = trainingEventSchema.parse(JSON.parse(rawEvent));
    const slug = parsed.slug;

    if (await seminarService.slugExists(slug)) {
      return jsonOk({ error: "Bu slug zaten kullanılıyor" }, 409);
    }

    const folder = seminarFolder(slug);

    const coverFile = fd.get("coverFile");
    let coverUrl: string | undefined;
    if (coverFile instanceof File && coverFile.size > 0) {
      coverUrl = await processAndUpload(coverFile, folder, `cover-${slug}`);
    }

    const posterFile = fd.get("posterFile");
    let posterUrl: string | undefined;
    if (posterFile instanceof File && posterFile.size > 0) {
      posterUrl = await processAndUpload(posterFile, folder, `poster-${slug}`);
    }

    const event: TrainingEvent = {
      ...parsed,
      coverUrl,
      posterUrl,
      speakers: parsed.speakers?.length ? parsed.speakers : undefined,
    };

    const created = await seminarService.create(event);
    await auditAdminAction({
      action: "create",
      resourceType: "training",
      resourceId: created.slug,
      resourceLabel: created.title,
    });
    return jsonOk({ ok: true, event: created });
  } catch (e) {
    return jsonError(e);
  }
}

/* ── PUT (update) ── */

export async function PUT(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);

    const fd = await request.formData();
    const rawEvent = fd.get("event");
    const rawOrigSlug = fd.get("originalSlug");
    if (typeof rawEvent !== "string") throw new AppError("event alanı gerekli", 400);
    if (typeof rawOrigSlug !== "string") throw new AppError("originalSlug gerekli", 400);

    const parsed = trainingEventSchema.parse(JSON.parse(rawEvent));
    const newSlug = parsed.slug;

    const existing = await seminarService.getBySlug(rawOrigSlug);
    if (!existing) return jsonOk({ error: "Etkinlik bulunamadı" }, 404);

    if (rawOrigSlug !== newSlug && (await seminarService.slugExists(newSlug))) {
      return jsonOk({ error: "Bu slug zaten kullanılıyor" }, 409);
    }

    const slugChanged = rawOrigSlug !== newSlug;
    const folder = seminarFolder(newSlug);

    let coverUrl = existing.coverUrl;
    let posterUrl = existing.posterUrl;

    if (slugChanged) {
      const renamed = await handleSlugRename(rawOrigSlug, newSlug, existing);
      coverUrl = renamed.coverUrl;
      posterUrl = renamed.posterUrl;
    }

    const coverFileField = fd.get("coverFile");
    if (coverFileField instanceof File && coverFileField.size > 0) {
      coverUrl = await processAndUpload(coverFileField, folder, `cover-${newSlug}`);
    } else if (fd.get("removeCover") === "1") {
      coverUrl = undefined;
    }

    const posterFileField = fd.get("posterFile");
    if (posterFileField instanceof File && posterFileField.size > 0) {
      posterUrl = await processAndUpload(posterFileField, folder, `poster-${newSlug}`);
    } else if (fd.get("removePoster") === "1") {
      posterUrl = undefined;
    }

    const event: TrainingEvent = {
      ...parsed,
      coverUrl,
      posterUrl,
      speakers: parsed.speakers?.length ? parsed.speakers : undefined,
    };

    const updated = await seminarService.update(rawOrigSlug, event);
    await auditAdminAction({
      action: "update",
      resourceType: "training",
      resourceId: updated.slug,
      resourceLabel: updated.title,
      metadata: { previousSlug: rawOrigSlug },
    });
    return jsonOk({ ok: true, event: updated });
  } catch (e) {
    return jsonError(e);
  }
}

/* ── DELETE ── */

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    if (!slug?.trim()) return jsonOk({ error: "slug gerekli" }, 400);

    const existing = await seminarService.getBySlug(slug);
    const deleted = await seminarService.deleteBySlug(slug);
    if (!deleted) return jsonOk({ error: "Etkinlik bulunamadı" }, 404);

    await deleteCloudinaryFolder(slug);
    await auditAdminAction({
      action: "delete",
      resourceType: "training",
      resourceId: slug,
      resourceLabel: existing?.title ?? slug,
    });

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
