CREATE TABLE IF NOT EXISTS "digital_library" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "zip_url" text DEFAULT '' NOT NULL,
  "ppt_url" text DEFAULT '' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "digital_library_singleton" CHECK ("id" = 1)
);

INSERT INTO "digital_library" ("id")
VALUES (1)
ON CONFLICT ("id") DO NOTHING;
