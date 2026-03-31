import sharp from "sharp";
import { MAX_ADMIN_IMAGE_UPLOAD_BYTES } from "./admin-image-upload";
import { cloudinary } from "./cloudinary";
import { AppError } from "./errors";

export const CATEGORIES_ROOT = "Categories";
export const PRODUCTS_ROOT = "Products";

export function categoryFolder(slug: string): string {
  return `${CATEGORIES_ROOT}/${slug}`;
}

export function productFolder(slug: string): string {
  return `${PRODUCTS_ROOT}/${slug}`;
}

export function uploadStreamWebp(
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

/** Ham buffer’ı WebP’ye çevirip yükler (ör. dosya veya indirilen görsel) */
export async function processBufferToCloudinaryWebp(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<string> {
  const webp = await sharp(buffer).rotate().webp({ quality: 82 }).toBuffer();
  return uploadStreamWebp(webp, folder, publicId);
}

export async function processImageFileToCloudinaryWebp(
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
  return processBufferToCloudinaryWebp(buf, folder, publicId);
}

export async function downloadUrlToBuffer(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Klasör altındaki tüm kaynakları silmeye çalışır (örn. Products/slug) */
export async function deleteCloudinaryFolderPath(folderPath: string): Promise<void> {
  const prefix = `${folderPath}/`;
  try {
    await cloudinary.api.delete_resources_by_prefix(prefix);
  } catch {
    /* yoksa */
  }
  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch {
    /* boş / yok */
  }
}

export async function tryDestroyPublicId(fullPublicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(fullPublicId, { invalidate: true });
  } catch {
    /* yoksa */
  }
}
