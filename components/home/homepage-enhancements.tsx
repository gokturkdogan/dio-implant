"use client";

import { useEffect } from "react";

export function HomepageEnhancements() {
  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero) return;

    const SLIDE_DURATION = 6000;
    const heroSlides = Array.from(
      document.querySelectorAll<HTMLElement>(".hero-slide")
    );
    const indicators = Array.from(
      document.querySelectorAll<HTMLElement>(".indicator")
    );
    const particleContainers = Array.from(
      document.querySelectorAll<HTMLElement>(".digital-particles")
    );

    let currentSlide = 0;
    let slideTimer: ReturnType<typeof setInterval> | null = null;
    let isTransitioning = false;

    const goToSlide = (index: number) => {
      if (isTransitioning || index === currentSlide || !heroSlides.length) return;
      isTransitioning = true;
      heroSlides[currentSlide]?.classList.remove("active");
      indicators[currentSlide]?.classList.remove("active");
      currentSlide = index;
      heroSlides[currentSlide]?.classList.add("active");
      indicators[currentSlide]?.classList.add("active");
      resetSlideTimer();
      window.setTimeout(() => {
        isTransitioning = false;
      }, 1200);
    };

    const nextSlide = () => goToSlide((currentSlide + 1) % heroSlides.length);

    const resetSlideTimer = () => {
      if (slideTimer) clearInterval(slideTimer);
      slideTimer = setInterval(nextSlide, SLIDE_DURATION);
    };

    indicators.forEach((btn) => {
      btn.addEventListener("click", () => {
        const raw = btn.getAttribute("data-slide");
        const idx = raw ? Number(raw) : 0;
        goToSlide(idx);
      });
    });

    const createParticle = (container: HTMLElement) => {
      const particle = document.createElement("div");
      const size = Math.random() * 4 + 1;
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const tx = (Math.random() - 0.5) * 200;
      const ty = (Math.random() - 0.5) * 200;
      const duration = Math.random() * 6 + 4;
      const delay = Math.random() * 6;
      const isGlow = Math.random() > 0.7;
      Object.assign(particle.style, {
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        background: isGlow
          ? "radial-gradient(circle, rgba(157,141,241,0.8), rgba(78,76,176,0.3))"
          : "rgba(157,141,241,0.5)",
        boxShadow: isGlow ? `0 0 ${size * 3}px rgba(157,141,241,0.3)` : "none",
        opacity: "0",
        pointerEvents: "none",
        animation: `particleFloat ${duration}s ease-in-out ${delay}s infinite`,
      } as CSSStyleDeclaration);
      particle.style.setProperty("--tx", `${tx}px`);
      particle.style.setProperty("--ty", `${ty}px`);
      container.appendChild(particle);
      return particle;
    };

    const createdParticles: HTMLElement[] = [];
    particleContainers.forEach((container) => {
      for (let i = 0; i < 25; i += 1) {
        createdParticles.push(createParticle(container));
      }
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("in-view");
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    const animated = Array.from(document.querySelectorAll("[data-animate]"));
    animated.forEach((el) => observer.observe(el));

    const pcatTabs = Array.from(document.querySelectorAll<HTMLElement>(".pcat-tab"));
    const pcatPanels = Array.from(
      document.querySelectorAll<HTMLElement>(".pcat-panel")
    );
    const onTabClick = (tab: HTMLElement) => () => {
      const target = tab.getAttribute("data-tab");
      pcatTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      pcatPanels.forEach((panel) => {
        panel.classList.toggle("active", panel.getAttribute("data-panel") === target);
      });
    };
    const tabHandlers = pcatTabs.map((tab) => {
      const h = onTabClick(tab);
      tab.addEventListener("click", h);
      return { tab, h };
    });

    const naviContainer = document.getElementById("naviParticles");
    const createdNaviParticles: HTMLElement[] = [];
    if (naviContainer) {
      for (let i = 0; i < 25; i += 1) {
        const p = document.createElement("span");
        p.className = "navi-particle";
        const size = Math.random() * 3 + 1;
        p.style.cssText = `position:absolute;width:${size}px;height:${size}px;background:rgba(157,141,241,${
          Math.random() * 0.4 + 0.1
        });border-radius:50%;left:${Math.random() * 100}%;top:${
          Math.random() * 100
        }%;animation:naviFloat ${Math.random() * 8 + 6}s ease-in-out ${
          Math.random() * 4
        }s infinite;`;
        naviContainer.appendChild(p);
        createdNaviParticles.push(p);
      }
    }

    const naviItems = Array.from(
      document.querySelectorAll<HTMLElement>(".navi-carousel-item")
    );
    const naviDots = Array.from(document.querySelectorAll<HTMLElement>(".navi-dot"));
    let autoTimer: ReturnType<typeof setInterval> | null = null;
    if (naviItems.length) {
      const total = naviItems.length;
      let current = 0;
      const mapPos = (idx: number, cur: number) => {
        const diff = ((idx - cur) % total + total) % total;
        if (diff === 0) return "center";
        if (diff === 1) return "right";
        if (diff === total - 1) return "left";
        if (diff === 2) return "far-right";
        return "far-left";
      };
      const updatePos = () => {
        naviItems.forEach((item, i) => item.setAttribute("data-pos", mapPos(i, current)));
        naviDots.forEach((d, i) => d.classList.toggle("active", i === current));
      };
      const goTo = (idx: number) => {
        current = ((idx % total) + total) % total;
        updatePos();
      };
      const next = () => goTo(current + 1);
      const startAuto = () => {
        autoTimer = setInterval(next, 3500);
      };
      const resetAuto = () => {
        if (autoTimer) clearInterval(autoTimer);
        startAuto();
      };
      naviDots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const idx = Number(dot.getAttribute("data-index") || "0");
          goTo(idx);
          resetAuto();
        });
      });
      naviItems.forEach((item, i) => {
        item.addEventListener("click", () => {
          if (i !== current) {
            goTo(i);
            resetAuto();
          }
        });
      });
      updatePos();
      startAuto();
    }

    resetSlideTimer();

    return () => {
      if (slideTimer) clearInterval(slideTimer);
      if (autoTimer) clearInterval(autoTimer);
      observer.disconnect();
      createdParticles.forEach((p) => p.remove());
      createdNaviParticles.forEach((p) => p.remove());
      tabHandlers.forEach(({ tab, h }) => tab.removeEventListener("click", h));
    };
  }, []);

  return null;
}

