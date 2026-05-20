CREATE TYPE "user_role" AS ENUM('admin', 'super_admin');

ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;

ALTER TABLE "users" ALTER COLUMN "role" TYPE "user_role" USING (
  CASE
    WHEN "role"::text IN ('admin', 'super_admin') THEN "role"::text::"user_role"
    ELSE 'admin'::"user_role"
  END
);

ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'admin'::"user_role";
