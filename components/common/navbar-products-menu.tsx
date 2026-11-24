"use client";

import Link from "@/components/common/site-link";
import { useMemo } from "react";
import type { NavbarMenuData } from "@/lib/navbar-menu-types";
import {
  buildProductCatalogTree,
  type ProductCatalogItem,
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

export function NavbarProductsMenu({ menu }: { menu: NavbarMenuData }) {
  const { categories, products } = menu;

  const menuNodes = useMemo((): ProductCatalogNode<ProductCatalogItem>[] => {
    if (!categories.length || !products.length) return [];
    return buildProductCatalogTree(categories, products);
  }, [categories, products]);

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
