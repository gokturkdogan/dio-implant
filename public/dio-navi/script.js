/* DIO NAVI — page-specific script (ported from v1) */
(function () {
  "use strict";

  // Hero particles
  const npParticleContainer = document.getElementById("npHeroParticles");
  if (npParticleContainer) {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement("span");
      p.className = "np-hero-particle";
      const size = Math.random() * 3 + 2;
      p.style.setProperty("--s", size + "px");
      p.style.setProperty("--d", Math.random() * 10 + 6 + "s");
      p.style.setProperty("--dl", Math.random() * 6 + "s");
      p.style.setProperty("--tx", Math.random() * 100 - 50 + "px");
      p.style.setProperty("--ty", Math.random() * -80 - 20 + "px");
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      npParticleContainer.appendChild(p);
    }
  }

  // Intersection Observer for animations
  const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
  const animObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  }, observerOptions);

  document.querySelectorAll("[data-animate]").forEach((el) => {
    animObserver.observe(el);
  });

  // Gallery infinite scroll — duplicate items
  const galleryTrack = document.querySelector(".np-gallery-track");
  if (galleryTrack) {
    const items = galleryTrack.innerHTML;
    galleryTrack.innerHTML = items + items;
  }
})();

