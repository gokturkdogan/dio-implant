import { relations } from "drizzle-orm";
import { instructors } from "./instructor";
import { seminarSpeakers } from "./seminar-speaker";
import { seminars } from "./seminars";

export const seminarsRelations = relations(seminars, ({ many }) => ({
  seminarSpeakers: many(seminarSpeakers),
}));

export const seminarSpeakersRelations = relations(seminarSpeakers, ({ one }) => ({
  seminar: one(seminars, {
    fields: [seminarSpeakers.seminarId],
    references: [seminars.id],
  }),
  instructor: one(instructors, {
    fields: [seminarSpeakers.instructorId],
    references: [instructors.id],
  }),
}));

export const instructorsRelations = relations(instructors, ({ many }) => ({
  seminarSpeakers: many(seminarSpeakers),
}));
