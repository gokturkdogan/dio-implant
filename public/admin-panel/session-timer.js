(function () {
  const el = document.getElementById("adminSessionTimer");
  if (!el) return;

  const pad2 = (n) => String(n).padStart(2, "0");

  const render = (ms) => {
    const total = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    el.textContent = `${pad2(m)}:${pad2(s)}`;
    if (total <= 60) {
      el.style.color = "rgba(255, 123, 123, 0.95)";
    }
  };

  const boot = async () => {
    try {
      const res = await fetch("/api/admin/session", { cache: "no-store" });
      const data = await res.json();
      if (!data?.authenticated || !data?.expiresAt) return;

      const tick = () => {
        const msLeft = data.expiresAt - Date.now();
        render(msLeft);
        if (msLeft <= 0) {
          // Oturum bitti; middleware sonraki navigasyonda login’e atacak
          clearInterval(t);
        }
      };

      tick();
      const t = setInterval(tick, 1000);
    } catch {
      // sessiz geç
    }
  };

  boot();
})();

