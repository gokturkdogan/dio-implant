ALTER TABLE "products" ADD COLUMN "poster_urls" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "products" SET "poster_urls" = CASE
  WHEN "poster_url" IS NOT NULL AND btrim("poster_url") <> '' THEN jsonb_build_array(btrim("poster_url"))::jsonb
  ELSE '[]'::jsonb
END;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "poster_url";
