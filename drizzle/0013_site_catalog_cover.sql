ALTER TABLE "site_catalogs" ADD COLUMN IF NOT EXISTS "cover_image_url" text;
ALTER TABLE "site_catalogs" ADD COLUMN IF NOT EXISTS "cloudinary_folder" text;
