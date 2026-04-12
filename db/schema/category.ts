import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Hiyerarşi: yalnızca bir seviye alt kategori.
 * `parent_id` null → üst düzey kategori; dolu → üst kategori bu kayda işaret eder.
 * Ürün `category_id` hem üst hem alt kategoriye bağlanabilir.
 */
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  /** FK `categories_parent_id_categories_id_fk` migrasyonda tanımlı */
  parentId: integer("parent_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  /** Aynı üst kategori (veya kök) içinde menü ve katalog sırası; düşük önce */
  sortOrder: integer("sort_order").notNull().default(0),
  /** Opsiyonel kategori görseli (tam HTTPS URL) */
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
