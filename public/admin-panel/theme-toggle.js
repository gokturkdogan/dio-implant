(function () {
  var KEY = "dio:adminTheme";
  var root = document.documentElement;
  var BTN_SELECTOR = "#adminThemeToggle";

  function getStoredTheme() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    return "dark";
  }

  function setTheme(theme) {
    root.setAttribute("data-admin-theme", theme);
    var btn = document.querySelector(BTN_SELECTOR);
    if (btn) {
      btn.setAttribute("aria-label", theme === "light" ? "Tema: Light" : "Tema: Dark");
    }
    try {
      localStorage.setItem(KEY, theme);
    } catch {}
  }

  setTheme(getStoredTheme());

  document.addEventListener("click", function (event) {
    var target = event.target;
    if (!target || !target.closest) return;
    var btn = target.closest(BTN_SELECTOR);
    if (!btn) return;
    var current = root.getAttribute("data-admin-theme") === "light" ? "light" : "dark";
    setTheme(current === "light" ? "dark" : "light");
  });
})();

