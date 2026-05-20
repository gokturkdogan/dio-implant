(function () {
  var TIMER_EL_ID = "adminSessionTimer";
  var el = document.getElementById(TIMER_EL_ID);
  if (!el) return;

  var currentExpiresAt = 0;
  var intervalId = null;
  var modalEl = null;
  var storedUsername = "";

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function render(ms) {
    var total = Math.max(0, Math.floor(ms / 1000));
    var m = Math.floor(total / 60);
    var s = total % 60;
    el.textContent = pad2(m) + ":" + pad2(s);
    if (total <= 60) {
      el.style.color = "rgba(255, 123, 123, 0.95)";
    } else {
      el.style.color = "";
    }
  }

  function clearTimer() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startTimer() {
    clearTimer();
    var tick = function () {
      var msLeft = currentExpiresAt - Date.now();
      render(msLeft);
      if (msLeft <= 0) {
        clearTimer();
        openExpiryModal();
      }
    };
    tick();
    intervalId = setInterval(tick, 1000);
  }

  function loginRedirect() {
    var path = window.location.pathname || "/admin-panel";
    var nextParam = path.indexOf("/admin-panel/login") === 0 ? "/admin-panel" : path;
    window.location.href =
      "/admin-panel/login?next=" + encodeURIComponent(nextParam);
  }

  function svgEye() {
    return (
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.75"/>' +
      "</svg>"
    );
  }

  function svgEyeOff() {
    return (
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
      '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M1 1l22 22" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function closeModal() {
    if (modalEl && modalEl.parentNode) {
      modalEl.parentNode.removeChild(modalEl);
    }
    modalEl = null;
    document.body.style.overflow = "";
  }

  function openExpiryModal() {
    if (modalEl) return;

    try {
      var u = sessionStorage.getItem("dio_admin_u");
      if (u && !storedUsername) storedUsername = u;
    } catch (_) {}

    document.body.style.overflow = "hidden";

    modalEl = document.createElement("div");
    modalEl.className = "admin-session-expiry";
    modalEl.setAttribute("role", "alertdialog");
    modalEl.setAttribute("aria-modal", "true");
    modalEl.setAttribute("aria-labelledby", "admin-session-expiry-title");

    var dialog = document.createElement("div");
    dialog.className = "admin-session-expiry__dialog";

    var title = document.createElement("h2");
    title.id = "admin-session-expiry-title";
    title.className = "admin-session-expiry__title";
    title.textContent = "Oturum süreniz doldu";

    var msg = document.createElement("p");
    msg.className = "admin-session-expiry__text";
    msg.textContent =
      "Yönetim panelinde çalışmaya devam etmek istiyor musunuz? Hayır derseniz güvenli çıkış için giriş sayfasına yönlendirilirsiniz.";

    var actions = document.createElement("div");
    actions.className = "admin-session-expiry__actions";

    var btnNo = document.createElement("button");
    btnNo.type = "button";
    btnNo.className = "admin-btn admin-btn--ghost";
    btnNo.textContent = "Hayır";
    btnNo.addEventListener("click", function () {
      closeModal();
      loginRedirect();
    });

    var btnYes = document.createElement("button");
    btnYes.type = "button";
    btnYes.className = "admin-btn admin-btn--primary";
    btnYes.textContent = "Evet";
    btnYes.addEventListener("click", function () {
      showPasswordStep(dialog, title);
    });

    actions.appendChild(btnNo);
    actions.appendChild(btnYes);
    dialog.appendChild(title);
    dialog.appendChild(msg);
    dialog.appendChild(actions);
    modalEl.appendChild(dialog);
    document.body.appendChild(modalEl);
    btnYes.focus();
  }

  function showPasswordStep(dialog, titleEl) {
    titleEl.textContent = "Oturumu yenile";

    while (dialog.childNodes.length > 1) {
      dialog.removeChild(dialog.lastChild);
    }

    var hint = document.createElement("p");
    hint.className = "admin-session-expiry__text";
    hint.textContent =
      "Devam etmek için yönetici parolanızı girin. Oturum süresi yenilenir, sayfa yenilenmez.";

    var err = document.createElement("p");
    err.className = "admin-session-expiry__error";
    err.setAttribute("aria-live", "polite");

    var userWrap = document.createElement("label");
    userWrap.className = "admin-session-expiry__field";
    var userLabel = document.createElement("span");
    userLabel.textContent = "Kullanıcı adı";
    var userInput = document.createElement("input");
    userInput.type = "text";
    userInput.autocomplete = "username";
    userInput.value = storedUsername || "";
    userWrap.appendChild(userLabel);
    userWrap.appendChild(userInput);

    var passWrap = document.createElement("label");
    passWrap.className = "admin-session-expiry__field";
    var passLabel = document.createElement("span");
    passLabel.textContent = "Parola";

    var passPwdWrap = document.createElement("div");
    passPwdWrap.className = "admin-auth-password";

    var passInput = document.createElement("input");
    passInput.type = "password";
    passInput.autocomplete = "current-password";
    passInput.spellcheck = false;
    passInput.setAttribute("autocorrect", "off");
    passInput.setAttribute("autocapitalize", "off");

    var passToggle = document.createElement("button");
    passToggle.type = "button";
    passToggle.className = "admin-auth-password__toggle";
    passToggle.setAttribute("aria-label", "Parolayı göster");
    passToggle.setAttribute("aria-pressed", "false");
    passToggle.innerHTML = svgEye();

    var showPassword = false;
    passToggle.addEventListener("click", function () {
      showPassword = !showPassword;
      passInput.type = showPassword ? "text" : "password";
      passToggle.setAttribute(
        "aria-label",
        showPassword ? "Parolayı gizle" : "Parolayı göster",
      );
      passToggle.setAttribute("aria-pressed", showPassword ? "true" : "false");
      passToggle.innerHTML = showPassword ? svgEyeOff() : svgEye();
    });

    passPwdWrap.appendChild(passInput);
    passPwdWrap.appendChild(passToggle);
    passWrap.appendChild(passLabel);
    passWrap.appendChild(passPwdWrap);

    var row = document.createElement("div");
    row.className = "admin-session-expiry__actions";

    var btnCancel = document.createElement("button");
    btnCancel.type = "button";
    btnCancel.className = "admin-btn admin-btn--ghost";
    btnCancel.textContent = "Vazgeç";
    btnCancel.addEventListener("click", function () {
      closeModal();
      loginRedirect();
    });

    var btnSubmit = document.createElement("button");
    btnSubmit.type = "button";
    btnSubmit.className = "admin-btn admin-btn--primary";
    btnSubmit.textContent = "Oturumu yenile";

    function doSubmit() {
      err.textContent = "";
      var u = userInput.value.trim();
      var p = passInput.value;
      if (!u) {
        err.textContent = "Kullanıcı adı gerekli.";
        return;
      }
      if (!p) {
        err.textContent = "Parola gerekli.";
        return;
      }
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Kontrol ediliyor…";
      fetch("/api/admin/session/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: u, password: p }),
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { res: res, body: body };
          });
        })
        .then(function (_ref) {
          var res = _ref.res;
          var body = _ref.body;
          if (!res.ok) {
            err.textContent =
              typeof body.error === "string"
                ? body.error
                : "Oturum yenilenemedi. Bilgileri kontrol edin.";
            btnSubmit.disabled = false;
            btnSubmit.textContent = "Oturumu yenile";
            return;
          }
          if (body.expiresAt) {
            currentExpiresAt = body.expiresAt;
          }
          storedUsername = u;
          try {
            sessionStorage.setItem("dio_admin_u", u);
          } catch (_) {}
          closeModal();
          el.style.color = "";
          startTimer();
        })
        .catch(function () {
          err.textContent = "Bağlantı hatası. Tekrar deneyin.";
          btnSubmit.disabled = false;
          btnSubmit.textContent = "Oturumu yenile";
        });
    }

    btnSubmit.addEventListener("click", doSubmit);
    passInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") doSubmit();
    });

    row.appendChild(btnCancel);
    row.appendChild(btnSubmit);

    dialog.appendChild(hint);
    dialog.appendChild(err);
    dialog.appendChild(userWrap);
    dialog.appendChild(passWrap);
    dialog.appendChild(row);
    passInput.focus();
  }

  function boot() {
    fetch("/api/admin/session", { cache: "no-store" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.authenticated || !data.expiresAt) return;
        currentExpiresAt = data.expiresAt;
        if (typeof data.username === "string" && data.username) {
          storedUsername = data.username;
          try {
            sessionStorage.setItem("dio_admin_u", data.username);
          } catch (_) {}
        }
        startTimer();
      })
      .catch(function () {});
  }

  boot();
})();
