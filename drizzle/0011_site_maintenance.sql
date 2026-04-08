CREATE TABLE IF NOT EXISTS "site_maintenance" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "enabled" boolean DEFAULT false NOT NULL,
  "message" text DEFAULT '' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "site_maintenance_singleton" CHECK ("id" = 1)
);

INSERT INTO "site_maintenance" ("id")
VALUES (1)
ON CONFLICT ("id") DO NOTHING;

