CREATE TABLE IF NOT EXISTS "site_contact" (
  "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
  "company_name" text DEFAULT '' NOT NULL,
  "center_label" text DEFAULT '' NOT NULL,
  "address" text DEFAULT '' NOT NULL,
  "phone" text DEFAULT '' NOT NULL,
  "email" text DEFAULT '' NOT NULL,
  "hours" text DEFAULT '' NOT NULL,
  "map_directions_url" text DEFAULT '' NOT NULL,
  "map_embed_url" text DEFAULT '' NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "site_contact_singleton" CHECK ("id" = 1)
);

INSERT INTO "site_contact" ("id") VALUES (1)
ON CONFLICT ("id") DO NOTHING;

CREATE TABLE IF NOT EXISTS "regional_offices" (
  "id" serial PRIMARY KEY,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "name" text NOT NULL,
  "coverage" text NOT NULL,
  "phone" text NOT NULL,
  "email" text NOT NULL,
  "address" text NOT NULL,
  "map_directions_url" text DEFAULT '' NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "authorized_dealers" (
  "id" serial PRIMARY KEY,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "name" text NOT NULL,
  "service_region" text NOT NULL,
  "contact_person" text,
  "phone" text NOT NULL,
  "website" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);
