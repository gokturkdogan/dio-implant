ALTER TABLE "categories" ADD COLUMN "sort_order" integer NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS "categories_parent_sort_idx" ON "categories" ("parent_id", "sort_order");
