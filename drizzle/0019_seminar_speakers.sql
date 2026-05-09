CREATE TABLE "seminar_speakers" (
  "id" serial PRIMARY KEY NOT NULL,
  "seminar_id" integer NOT NULL REFERENCES "seminars"("id") ON DELETE CASCADE,
  "instructor_id" integer NOT NULL REFERENCES "instructors"("id") ON DELETE RESTRICT,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "seminar_speakers_seminar_id_idx" ON "seminar_speakers" ("seminar_id");

INSERT INTO "seminar_speakers" ("seminar_id", "instructor_id", "sort_order")
SELECT s.id,
       (elem->>'instructorId')::integer,
       (t.ordinality - 1)::integer
FROM "seminars" s
CROSS JOIN jsonb_array_elements(COALESCE(s.speakers, '[]'::jsonb))
  WITH ORDINALITY AS t(elem, ordinality)
WHERE (elem ? 'instructorId')
  AND (elem->>'instructorId') ~ '^[0-9]+$'
  AND EXISTS (
    SELECT 1 FROM "instructors" i WHERE i.id = (elem->>'instructorId')::integer
  );

ALTER TABLE "seminars" DROP COLUMN IF EXISTS "speakers";
