import sharp from "sharp";
import {
  MAX_ADMIN_IMAGE_UPLOAD_BYTES,
  MAX_ADMIN_PDF_UPLOAD_BYTES,
} from "./admin-image-upload";
import { cloudinary } from "./cloudinary";
import { AppError } from "./errors";

export const CATEGORIES_ROOT = "Categories";
export const PRODUCTS_ROOT = "Products";
export const CATALOGS_ROOT = "Catalogs";

/** Katalog kapak görselleri: Catalogs/{baslik-slug}-{id} */
export function catalogImageFolder(titleSlug: string, catalogId: number): string {
  const base = titleSlug.trim() ? titleSlug.trim() : "katalog";
  return `${CATALOGS_ROOT}/${base}-${catalogId}`;
}

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

export function uploadStreamRaw(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: "raw",
        format: "pdf",
        overwrite: true,
        invalidate: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary raw upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export function uploadStreamPdfAsImage(
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
        format: "pdf",
        overwrite: true,
        invalidate: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary pdf(image) upload failed"));
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

export async function processPdfFileToCloudinaryRaw(
  file: File,
  folder: string,
  publicId: string,
): Promise<string> {
  if (file.size > MAX_ADMIN_PDF_UPLOAD_BYTES) {
    throw new AppError("PDF dosyası en fazla 10MB olabilir (Cloudinary plan limiti).", 413);
  }
  const isPdfType = file.type === "application/pdf";
  const isPdfName = /\.pdf$/i.test(file.name ?? "");
  if (!isPdfType && !isPdfName) {
    throw new AppError("Sadece PDF dosyası yüklenebilir", 400);
  }
  const buf = Buffer.from(await file.arrayBuffer());
  try {
    return await uploadStreamRaw(buf, folder, publicId);
  } catch {
    // Some Cloudinary plans/settings may reject raw uploads for PDFs.
    return uploadStreamPdfAsImage(buf, folder, publicId);
  }
}

export async function processBufferToCloudinaryRawPdf(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<string> {
  try {
    return await uploadStreamRaw(buffer, folder, publicId);
  } catch {
    return uploadStreamPdfAsImage(buffer, folder, publicId);
  }
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
    await cloudinary.api.delete_resources_by_prefix(prefix, {
      resource_type: "image",
    });
  } catch {
    /* yoksa */
  }
  try {
    await cloudinary.api.delete_resources_by_prefix(prefix, {
      resource_type: "raw",
    });
  } catch {
    /* yoksa */
  }
  try {
    await cloudinary.api.delete_folder(folderPath);
  } catch {
    /* boş / yok */
  }
}

export async function tryDestroyPublicId(
  fullPublicId: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(fullPublicId, {
      invalidate: true,
      resource_type: resourceType,
    });
  } catch {
    /* yoksa */
  }
}
