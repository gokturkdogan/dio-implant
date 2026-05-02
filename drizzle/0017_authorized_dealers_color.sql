ALTER TABLE "authorized_dealers"
  ADD COLUMN IF NOT EXISTS "color" varchar(7) NOT NULL DEFAULT '#5B8DEF';
