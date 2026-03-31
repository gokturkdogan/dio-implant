import { sql } from "drizzle-orm";
import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { categories } from "./category";

export type ProductPosterItem = {
  title: string;
  url: string;
};

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  /** Liste / kart için kısa açıklama */
  excerpt: text("excerpt"),
  /** Ürün detay uzun metin */
  description: text("description"),
  /** Birden fazla afiş / poster (başlık + HTTPS URL) */
  posterUrls: jsonb("poster_urls")
    .$type<ProductPosterItem[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  /** Ana ürün görseli (tam URL) */
  imageUrl: text("image_url"),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
