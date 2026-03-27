CREATE TABLE "site_popups" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"image_url" text NOT NULL,
	"link_url" text,
	"open_in_new_tab" boolean DEFAULT false NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_popups_key_unique" UNIQUE("key")
);
