CREATE TABLE "admin_audit_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "user_id" integer,
  "username" text NOT NULL,
  "email" text NOT NULL,
  "action" text NOT NULL,
  "resource_type" text NOT NULL,
  "resource_id" text,
  "resource_label" text,
  "summary" text NOT NULL,
  "admin_path" text,
  "metadata" jsonb,
  CONSTRAINT "admin_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action
);

CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs" ("created_at" DESC);
CREATE INDEX "admin_audit_logs_user_id_idx" ON "admin_audit_logs" ("user_id");
