import { cookies } from "next/headers";
import sharp from "sharp";
import { cloudinary } from "../../../../../lib/cloudinary";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../../../../../lib/admin-auth";
import { jsonError, jsonOk } from "../../../../../lib/http";
import { AppError } from "../../../../../lib/errors";
import { MAX_ADMIN_IMAGE_UPLOAD_BYTES } from "../../../../../lib/admin-image-upload";

export const runtime = "nodejs";

const HOME_MODAL_FOLDER = "HomeModal";
const HOME_MODAL_PUBLIC_ID = "modal-poster";

function uploadToCloudinary(buffer: Buffer): Promise<{
  secure_url: string;
  bytes: number;
  width: number;
  height: number;
  public_id: string;
  format: string;
}> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: HOME_MODAL_FOLDER,
        public_id: HOME_MODAL_PUBLIC_ID,
        resource_type: "image",
        format: "webp",
        overwrite: true,
        invalidate: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result as never);
      },
    );
    stream.end(buffer);
  });
}

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
    if (!(file instanceof File)) {
      throw new AppError("file alanı zorunlu", 400);
    }

    if (!file.type.startsWith("image/")) {
      throw new AppError("Sadece görsel dosyası yüklenebilir", 400);
    }

    if (file.size > MAX_ADMIN_IMAGE_UPLOAD_BYTES) {
      throw new AppError("Dosya boyutu 10MB'dan büyük olamaz", 413);
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    const webpBuffer = await sharp(inputBuffer)
      .rotate()
      .webp({ quality: 82 })
      .toBuffer();

    const uploaded = await uploadToCloudinary(webpBuffer);
    return jsonOk({
      url: uploaded.secure_url,
      bytes: uploaded.bytes,
      width: uploaded.width,
      height: uploaded.height,
      publicId: uploaded.public_id,
      format: uploaded.format,
    });
  } catch (error) {
    return jsonError(error);
  }
}
