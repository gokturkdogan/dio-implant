import { z } from "zod";

export const sitePopupKeySchema = z.string().trim().min(1).max(64);

export const createSitePopupSchema = z.object({
  key: sitePopupKeySchema,
  enabled: z.boolean().optional(),
  imageUrl: z.string().trim().url(),
  linkUrl: z.string().trim().url().optional().nullable(),
  openInNewTab: z.boolean().optional(),
  startAt: z.coerce.date().optional().nullable(),
  endAt: z.coerce.date().optional().nullable(),
});

export const updateSitePopupSchema = createSitePopupSchema
  .omit({ key: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  });

export type CreateSitePopupInput = z.infer<typeof createSitePopupSchema>;
export type UpdateSitePopupInput = z.infer<typeof updateSitePopupSchema>;

