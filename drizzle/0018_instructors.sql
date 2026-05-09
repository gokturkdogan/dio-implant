CREATE TABLE "instructors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"education" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"specialties" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
