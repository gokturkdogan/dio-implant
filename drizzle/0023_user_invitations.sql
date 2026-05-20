CREATE TABLE "user_invitations" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" text NOT NULL,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "token_hash" text NOT NULL,
  "expires_at" timestamp with time zone NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "user_invitations_token_hash_unique" UNIQUE("token_hash")
);

CREATE INDEX "user_invitations_email_idx" ON "user_invitations" ("email");
