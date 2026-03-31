ALTER TABLE "products"
ADD COLUMN "carousel_images" jsonb DEFAULT '[]'::jsonb NOT NULL;
