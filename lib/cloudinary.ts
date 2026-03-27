import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

const envSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_FOLDER: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse({
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_UPLOAD_FOLDER: process.env.CLOUDINARY_UPLOAD_FOLDER,
});

if (!parsed.success) {
  throw new Error("Cloudinary env values are missing or invalid");
}

cloudinary.config({
  cloud_name: parsed.data.CLOUDINARY_CLOUD_NAME,
  api_key: parsed.data.CLOUDINARY_API_KEY,
  api_secret: parsed.data.CLOUDINARY_API_SECRET,
  secure: true,
});

export const cloudinaryUploadFolder =
  parsed.data.CLOUDINARY_UPLOAD_FOLDER ?? "dio-implant/admin";

export { cloudinary };

