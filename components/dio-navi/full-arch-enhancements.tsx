"use client";

import { useEffect } from "react";

export function FullArchEnhancements() {
  useEffect(() => {
    const createdParticles: HTMLElement[] = [];

    const container = document.getElementById("faHeroParticles");
    if (container) {
      for (let i = 0; i < 28; i += 1) {
        const p = document.createElement("span");
        p.className = "fa-hero-particle";
        const size = Math.random() * 3 + 2;
        p.style.setProperty("--s", `${size}px`);
        p.style.setProperty("--d", `${Math.random() * 10 + 6}s`);
        p.style.setProperty("--dl", `${Math.random() * 5}s`);
        p.style.setProperty("--tx", `${Math.random() * 100 - 50}px`);
        p.style.setProperty("--ty", `${Math.random() * -70 - 20}px`);
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        container.appendChild(p);
        createdParticles.push(p);
      }
    }

    const observerOptions = { threshold: 0.12, rootMargin: "0px 0px -40px 0px" };
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fa-in-view");
        }
      });
    }, observerOptions);

    document.querySelectorAll("[data-fa-animate]").forEach((el) => {
      animObserver.observe(el);
    });

    return () => {
      animObserver.disconnect();
      createdParticles.forEach((el) => el.remove());
    };
  }, []);

  return null;
}
