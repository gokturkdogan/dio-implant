import type { Category } from "@/db/schema/category";
import type { Product } from "@/db/schema/product";

import { sortByOrderThenName } from "./category-sort";

export type ProductCatalogNested = {
  kind: "nested";
  root: Category;
  subBlocks: Array<{ sub: Category; products: Product[] }>;
};

export type ProductCatalogFlat = {
  kind: "flat";
  root: Category;
  products: Product[];
};

export type ProductCatalogNode = ProductCatalogNested | ProductCatalogFlat;

function sortByName<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

export { sortByOrderThenName };

/**
 * Navbar ve /urunler index ile aynı hiyerarşi: yalnızca kök + bir seviye alt kategori;
 * ürünler ilgili kategoriye bağlanır.
 */
export function buildProductCatalogTree(
  categories: Category[],
  products: Product[],
): ProductCatalogNode[] {
  if (!categories.length || !products.length) return [];

  const roots = sortByOrderThenName(categories.filter((c) => c.parentId == null));

  const childrenByRoot = new Map<number, Category[]>();
  for (const c of categories) {
    if (c.parentId == null) continue;
    const list = childrenByRoot.get(c.parentId) ?? [];
    list.push(c);
    childrenByRoot.set(c.parentId, list);
  }
  for (const [, list] of childrenByRoot) sortByOrderThenName(list);

  const productsByCategory = new Map<number, Product[]>();
  for (const p of products) {
    const list = productsByCategory.get(p.categoryId) ?? [];
    list.push(p);
    productsByCategory.set(p.categoryId, list);
  }
  for (const [, list] of productsByCategory) sortByName(list);

  const out: ProductCatalogNode[] = [];
  for (const root of roots) {
    const subs = childrenByRoot.get(root.id) ?? [];
    if (subs.length) {
      const subBlocks = subs
        .map((sub) => ({
          sub,
          products: productsByCategory.get(sub.id) ?? [],
        }))
        .filter((b) => b.products.length > 0);
      if (subBlocks.length) out.push({ kind: "nested", root, subBlocks });
      continue;
    }
    const direct = productsByCategory.get(root.id) ?? [];
    if (direct.length) out.push({ kind: "flat", root, products: direct });
  }
  return out;
}
