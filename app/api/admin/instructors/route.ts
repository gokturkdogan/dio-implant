import { cookies } from "next/headers";
import sharp from "sharp";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../lib/admin-auth";
import { MAX_ADMIN_IMAGE_UPLOAD_BYTES } from "../../../../lib/admin-image-upload";
import { cloudinary } from "../../../../lib/cloudinary";
import { AppError } from "../../../../lib/errors";
import { jsonError, jsonOk } from "../../../../lib/http";
import { instructorFormSchema } from "../../../../lib/training-events-schema";
import { instructorService } from "../../../../services/instructor.service";

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

export async function GET() {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);
    const instructors = await instructorService.listAll();
    return jsonOk({ instructors });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) return jsonOk({ error: "Yetkisiz" }, 401);

    const fd = await request.formData();
    const raw = fd.get("instructor");
    if (typeof raw !== "string") throw new AppError("instructor alanı gerekli", 400);

    const parsed = instructorFormSchema.parse(JSON.parse(raw));
    const photoFile = fd.get("photo");
    const hasPhotoFile = photoFile instanceof File && photoFile.size > 0;

    let photoUrl = parsed.photoUrl ?? undefined;
    if (photoUrl && !photoUrl.startsWith("https://")) {
      photoUrl = undefined;
    }
    if (hasPhotoFile) {
      photoUrl = undefined;
    }

    const created = await instructorService.create({
      name: parsed.name,
      photoUrl,
      education: parsed.education,
      specialties: parsed.specialties,
      bio: parsed.bio,
    });

    if (hasPhotoFile && photoFile instanceof File) {
      const folder = instructorFolder(created.id);
      const url = await processAndUpload(photoFile, folder, "portrait");
      await instructorService.setPhotoUrl(created.id, url);
      const updated = await instructorService.getById(created.id);
      return jsonOk({ ok: true, instructor: updated ?? created });
    }

    return jsonOk({ ok: true, instructor: created });
  } catch (e) {
    return jsonError(e);
  }
}
