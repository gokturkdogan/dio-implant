CREATE TABLE IF NOT EXISTS "site_catalogs" (
  "id" serial PRIMARY KEY NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "title" text NOT NULL,
  "pdf_url" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
