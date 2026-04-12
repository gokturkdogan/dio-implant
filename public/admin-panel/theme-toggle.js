(function () {
  var KEY = "dio:adminTheme";
  var COOKIE = "dio_admin_theme";
  var root = document.documentElement;
  var BTN_SELECTOR = "#adminThemeToggle";

  function readCookieTheme() {
    try {
      if (!document.cookie) return null;
      var parts = document.cookie.split(";");
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].replace(/^\s+/, "");
        if (p.indexOf(COOKIE + "=") !== 0) continue;
        var raw = p.slice(COOKIE.length + 1);
        var v = decodeURIComponent(raw.replace(/\+/g, " "));
        if (v === "light" || v === "dark") return v;
      }
    } catch {}
    return null;
  }

  function syncCookie(theme) {
    try {
      var secure =
        typeof location !== "undefined" && location.protocol === "https:";
      document.cookie =
        COOKIE +
        "=" +
        encodeURIComponent(theme) +
        "; Path=/; Max-Age=31536000; SameSite=Lax" +
        (secure ? "; Secure" : "");
    } catch {}
  }

  function getStoredTheme() {
    try {
      var stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {}
    var fromCookie = readCookieTheme();
    if (fromCookie) return fromCookie;
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
    syncCookie(theme);
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
