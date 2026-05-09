import { cookies } from "next/headers";
import sharp from "sharp";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { MAX_ADMIN_IMAGE_UPLOAD_BYTES } from "../../../../../lib/admin-image-upload";
import { cloudinary } from "../../../../../lib/cloudinary";
import { AppError } from "../../../../../lib/errors";
import { jsonError, jsonOk } from "../../../../../lib/http";
import { instructorFormSchema } from "../../../../../lib/training-events-schema";
import { instructorService } from "../../../../../services/instructor.service";

export const runtime = "nodejs";

const INSTRUCTORS_ROOT = "Instructors";

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

function instructorFolder(id: number) {
  return `${INSTRUCTORS_ROOT}/${id}`;
}

async function deleteInstructorMedia(id: number): Promise<void> {
  const folder = instructorFolder(id);
  const prefix = `${folder}/`;
  try {
    await cloudinary.api.delete_resources_by_prefix(prefix);
    await cloudinary.api.delete_folder(folder);
  } catch {
    /* klasör yoksa */
  }
}

async function uploadBuffer(buffer: Buffer, folder: string, publicId: string): Promise<string> {
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

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id < 1) {
      return jsonOk({ error: "Geçersiz id" }, 400);
    }

    const existing = await instructorService.getById(id);
    if (!existing) return jsonOk({ error: "Eğitmen bulunamadı" }, 404);

    const fd = await request.formData();
    const raw = fd.get("instructor");
    if (typeof raw !== "string") throw new AppError("instructor alanı gerekli", 400);

    const parsed = instructorFormSchema.parse(JSON.parse(raw));
    const photoFile = fd.get("photo");
    const removePhoto = fd.get("removePhoto") === "1";

    let photoUrl: string | undefined;
    if (removePhoto) {
      photoUrl = undefined;
      await deleteInstructorMedia(id);
    } else if (parsed.photoUrl?.startsWith("https://")) {
      photoUrl = parsed.photoUrl;
    } else {
      photoUrl = existing.photoUrl;
    }

    const updated = await instructorService.update(id, {
      name: parsed.name,
      photoUrl,
      education: parsed.education,
      specialties: parsed.specialties,
      bio: parsed.bio,
    });

    if (!updated) return jsonOk({ error: "Güncellenemedi" }, 500);

    if (photoFile instanceof File && photoFile.size > 0) {
      const folder = instructorFolder(id);
      const url = await processAndUpload(photoFile, folder, "portrait");
      await instructorService.setPhotoUrl(id, url);
      const finalRow = await instructorService.getById(id);
      return jsonOk({ ok: true, instructor: finalRow ?? updated });
    }

    return jsonOk({ ok: true, instructor: updated });
  } catch (e) {
    return jsonError(e);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);

    const { id: idParam } = await context.params;
    const id = Number(idParam);
    if (!Number.isFinite(id) || id < 1) {
      return jsonOk({ error: "Geçersiz id" }, 400);
    }

    const deleted = await instructorService.deleteById(id);
    if (!deleted) return jsonOk({ error: "Eğitmen bulunamadı" }, 404);

    await deleteInstructorMedia(id);

    return jsonOk({ ok: true });
  } catch (e) {
    return jsonError(e);
  }
}
