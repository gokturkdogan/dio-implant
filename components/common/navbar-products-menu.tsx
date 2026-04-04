"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Category } from "@/db/schema/category";
import type { Product } from "@/db/schema/product";
import {
  buildProductCatalogTree,
  type ProductCatalogNode,
} from "@/lib/product-catalog-tree";

function ParentChevron() {
  return (
    <svg
      className="nav-parent-has-children-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ExpandChevron() {
  return (
    <svg
      className="nav-submenu-expand-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function NavbarProductsMenu() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cRes, pRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ]);
        const rawC = await cRes.json();
        const rawP = await pRes.json();
        if (cancelled) return;
        setCategories(Array.isArray(rawC) ? rawC : []);
        setProducts(Array.isArray(rawP) ? rawP : []);
      } catch {
        if (!cancelled) {
          setCategories([]);
          setProducts([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const menuNodes = useMemo((): ProductCatalogNode[] => {
    if (!categories?.length || !products) return [];
    return buildProductCatalogTree(categories, products);
  }, [categories, products]);

  if (categories === null || products === null) {
    return (
      <li className="nav-dropdown-item" role="none">
        <span className="nav-dropdown-link" style={{ opacity: 0.65 }}>
          Ürünler yükleniyor…
        </span>
      </li>
    );
  }

  if (menuNodes.length === 0) {
    return (
      <li className="nav-dropdown-item" role="none">
        <span className="nav-dropdown-link" style={{ opacity: 0.65 }}>
          Henüz listelenecek ürün yok
        </span>
      </li>
    );
  }

  return (
    <>
      {menuNodes.map((node) => {
        const rootPanelId = `nav-sub-root-${node.root.slug}`;
        if (node.kind === "flat") {
          return (
            <li
              key={node.root.id}
              className="nav-dropdown-item nav-dropdown-item-has-children"
              role="none"
            >
              <div className="nav-dropdown-item-row">
                <a
                  href="#"
                  className="nav-dropdown-link nav-dropdown-link-parent"
                  role="menuitem"
                  onClick={(e) => e.preventDefault()}
                >
                  {node.root.name}
                  <ParentChevron />
                </a>
                <button
                  type="button"
                  className="nav-submenu-expand"
                  aria-expanded="false"
                  aria-controls={rootPanelId}
                  aria-label={`${node.root.name} ürünleri`}
                >
                  <ExpandChevron />
                </button>
              </div>
              <ul className="nav-submenu" id={rootPanelId} role="menu">
                {node.products.map((p) => (
                  <li key={p.id} role="none">
                    <Link href={`/urunler/${p.slug}`} className="nav-dropdown-link" role="menuitem">
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          );
        }

        return (
          <li
            key={node.root.id}
            className="nav-dropdown-item nav-dropdown-item-has-children"
            role="none"
          >
            <div className="nav-dropdown-item-row">
              <a
                href="#"
                className="nav-dropdown-link nav-dropdown-link-parent"
                role="menuitem"
                onClick={(e) => e.preventDefault()}
              >
                {node.root.name}
                <ParentChevron />
              </a>
              <button
                type="button"
                className="nav-submenu-expand"
                aria-expanded="false"
                aria-controls={rootPanelId}
                aria-label={`${node.root.name} alt kategorileri`}
              >
                <ExpandChevron />
              </button>
            </div>
            <ul className="nav-submenu" id={rootPanelId} role="menu">
              {node.subBlocks.map(({ sub, products: plist }) => {
                const subPanelId = `nav-sub-${node.root.slug}-${sub.slug}`;
                return (
                  <li
                    key={sub.id}
                    className="nav-dropdown-item nav-dropdown-item-has-children"
                    role="none"
                  >
                    <div className="nav-dropdown-item-row">
                      <a
                        href="#"
                        className="nav-dropdown-link nav-dropdown-link-parent"
                        role="menuitem"
                        onClick={(e) => e.preventDefault()}
                      >
                        {sub.name}
                        <ParentChevron />
                      </a>
                      <button
                        type="button"
                        className="nav-submenu-expand"
                        aria-expanded="false"
                        aria-controls={subPanelId}
                        aria-label={`${sub.name} ürünleri`}
                      >
                        <ExpandChevron />
                      </button>
                    </div>
                    <ul className="nav-submenu" id={subPanelId} role="menu">
                      {plist.map((p) => (
                        <li key={p.id} role="none">
                          <Link
                            href={`/urunler/${p.slug}`}
                            className="nav-dropdown-link"
                            role="menuitem"
                          >
                            {p.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </>
  );
}
