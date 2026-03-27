"use client";

import { useEffect } from "react";

export function DioNaviEnhancements() {
  useEffect(() => {
    const createdParticles: HTMLElement[] = [];

    const npParticleContainer = document.getElementById("npHeroParticles");
    if (npParticleContainer) {
      for (let i = 0; i < 30; i += 1) {
        const p = document.createElement("span");
        p.className = "np-hero-particle";
        const size = Math.random() * 3 + 2;
        p.style.setProperty("--s", `${size}px`);
        p.style.setProperty("--d", `${Math.random() * 10 + 6}s`);
        p.style.setProperty("--dl", `${Math.random() * 6}s`);
        p.style.setProperty("--tx", `${Math.random() * 100 - 50}px`);
        p.style.setProperty("--ty", `${Math.random() * -80 - 20}px`);
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        npParticleContainer.appendChild(p);
        createdParticles.push(p);
      }
    }

    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const animObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    }, observerOptions);

    const animatedNodes = Array.from(document.querySelectorAll("[data-animate]"));
    animatedNodes.forEach((el) => animObserver.observe(el));

    const galleryTrack = document.querySelector(".np-gallery-track") as HTMLElement | null;
    if (galleryTrack && galleryTrack.dataset.duplicated !== "1") {
      galleryTrack.innerHTML = galleryTrack.innerHTML + galleryTrack.innerHTML;
      galleryTrack.dataset.duplicated = "1";
    }

    return () => {
      animObserver.disconnect();
      createdParticles.forEach((el) => el.remove());
    };
  }, []);

  return null;
}

