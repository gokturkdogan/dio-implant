import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Genel sitede listelenen PDF katalog kayıtları (Kataloglar sayfası). */
export const siteCatalogs = pgTable("site_catalogs", {
  id: serial("id").primaryKey(),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  /** PDF veya doğrudan indirme/önizleme URL’si (https önerilir). */
  pdfUrl: text("pdf_url").notNull(),
  /** Kapak görseli (WebP, Cloudinary). */
  coverImageUrl: text("cover_image_url"),
  /** Cloudinary klasör yolu; silme / kapak değişiminde kullanılır. Örn. Catalogs/baslik-12 */
  cloudinaryFolder: text("cloudinary_folder"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

export type SiteCatalog = typeof siteCatalogs.$inferSelect;
export type NewSiteCatalog = typeof siteCatalogs.$inferInsert;
