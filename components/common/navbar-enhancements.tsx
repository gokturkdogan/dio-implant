"use client";

import { useEffect } from "react";

export function NavbarEnhancements() {
  useEffect(() => {
    const header = document.getElementById("header");
    const hamburger = document.getElementById("hamburger");
    const mainNav = document.getElementById("mainNav");
    if (!header || !hamburger || !mainNav) return;

    const handleScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 40);
    };

    const resetProductMenus = () => {
      document.querySelectorAll(".nav-item-dropdown.open").forEach((el) => {
        el.classList.remove("open");
        const b = el.querySelector(".nav-dropdown-expand");
        if (b) b.setAttribute("aria-expanded", "false");
      });
      document
        .querySelectorAll(".nav-dropdown-item-has-children.is-subopen")
        .forEach((el) => {
          el.classList.remove("is-subopen");
          const b = el.querySelector(".nav-submenu-expand");
          if (b) b.setAttribute("aria-expanded", "false");
        });
    };

    const closeMobileNav = () => {
      hamburger.classList.remove("active");
      mainNav.classList.remove("open");
      document.body.style.overflow = "";
      resetProductMenus();
    };

    const onHamburger = () => {
      const wasOpen = mainNav.classList.contains("open");
      hamburger.classList.toggle("active");
      mainNav.classList.toggle("open");
      document.body.style.overflow = mainNav.classList.contains("open")
        ? "hidden"
        : "";
      if (wasOpen) resetProductMenus();
    };

    const forceCloseNavOverlays = () => {
      header.classList.add("force-closed");
      window.setTimeout(() => header.classList.remove("force-closed"), 250);
    };

    const onNavClick = (e: Event) => {
      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a");
      if (!a) return;
      resetProductMenus();
      forceCloseNavOverlays();
      try {
        const active = document.activeElement as HTMLElement | null;
        active?.blur?.();
        (a as HTMLElement).blur?.();
      } catch {}
      if (mainNav.classList.contains("open")) closeMobileNav();
    };

    const dropdownExpandButtons = Array.from(
      document.querySelectorAll(".nav-dropdown-expand")
    );
    const onDropdownExpand = (btn: Element) => (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const li = btn.closest(".nav-item-dropdown");
      if (!li) return;
      const willOpen = !li.classList.contains("open");
      document.querySelectorAll(".nav-item-dropdown.open").forEach((other) => {
        if (other !== li) {
          other.classList.remove("open");
          const oBtn = other.querySelector(".nav-dropdown-expand");
          if (oBtn) oBtn.setAttribute("aria-expanded", "false");
        }
      });
      li.classList.toggle("open", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    };

    const submenuExpandButtons = Array.from(
      document.querySelectorAll(".nav-submenu-expand")
    );
    const onSubmenuExpand = (btn: Element) => (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      const item = btn.closest(".nav-dropdown-item-has-children");
      if (!item) return;
      const menu = item.closest(".nav-dropdown");
      const willOpen = !item.classList.contains("is-subopen");
      if (menu) {
        menu
          .querySelectorAll(".nav-dropdown-item-has-children.is-subopen")
          .forEach((other) => {
            if (other !== item) {
              other.classList.remove("is-subopen");
              const ob = other.querySelector(".nav-submenu-expand");
              if (ob) ob.setAttribute("aria-expanded", "false");
            }
          });
      }
      item.classList.toggle("is-subopen", willOpen);
      btn.setAttribute("aria-expanded", willOpen ? "true" : "false");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    hamburger.addEventListener("click", onHamburger);
    mainNav.addEventListener("click", onNavClick);

    const dropdownListeners = dropdownExpandButtons.map((btn) => {
      const handler = onDropdownExpand(btn);
      btn.addEventListener("click", handler);
      return { btn, handler };
    });

    const submenuListeners = submenuExpandButtons.map((btn) => {
      const handler = onSubmenuExpand(btn);
      btn.addEventListener("click", handler);
      return { btn, handler };
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      hamburger.removeEventListener("click", onHamburger);
      mainNav.removeEventListener("click", onNavClick);
      dropdownListeners.forEach(({ btn, handler }) =>
        btn.removeEventListener("click", handler)
      );
      submenuListeners.forEach(({ btn, handler }) =>
        btn.removeEventListener("click", handler)
      );
    };
  }, []);

  return null;
}

