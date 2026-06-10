/* ─────────────────────────────────────────────────────────────
   Cardugo — shared on-page i18n engine (8 languages, no deps).
   Each page defines its own strings on window.CARDUGO_I18N:
       window.CARDUGO_I18N = { en: {...}, es: {...}, ... }
   Markup opts in with:
       data-i18n="key"       → replaced via textContent
       data-i18n-html="key"  → replaced via innerHTML (for links)
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var LANGS = [
    { code: "en", name: "English",   sub: "English",    html: "en"      },
    { code: "es", name: "Español",   sub: "Spanish",    html: "es"      },
    { code: "fr", name: "Français",  sub: "French",     html: "fr"      },
    { code: "de", name: "Deutsch",   sub: "German",     html: "de"      },
    { code: "zh", name: "中文",       sub: "Chinese",    html: "zh-Hans" },
    { code: "ja", name: "日本語",     sub: "Japanese",   html: "ja"      },
    { code: "pt", name: "Português", sub: "Portuguese", html: "pt-BR"   },
    { code: "ko", name: "한국어",     sub: "Korean",     html: "ko"      }
  ];

  var I18N = window.CARDUGO_I18N || {};
  var STORAGE_KEY = "cardugo_lang";

  var switchEl = document.getElementById("langSwitch");
  if (!switchEl) return; // no switcher on this page

  var btnEl   = document.getElementById("langBtn");
  var labelEl = document.getElementById("langLabel");
  var menuEl  = document.getElementById("langMenu");

  // Build the dropdown menu
  LANGS.forEach(function (l) {
    var li = document.createElement("li");
    li.setAttribute("role", "option");
    li.dataset.lang = l.code;
    li.innerHTML = '<span>' + l.name + '</span><span class="lang-sub">' + l.sub + '</span>';
    li.addEventListener("click", function () { setLang(l.code); closeMenu(); });
    menuEl.appendChild(li);
  });

  function applyTranslations(code) {
    var dict = I18N[code] || I18N.en || {};
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = dict[el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var v = dict[el.getAttribute("data-i18n-html")];
      if (v != null) el.innerHTML = v;
    });
    if (dict["doc.title"]) document.title = dict["doc.title"];
  }

  function setLang(code) {
    var lang = LANGS.filter(function (l) { return l.code === code; })[0] || LANGS[0];
    document.documentElement.lang = lang.html;
    applyTranslations(lang.code);
    labelEl.textContent = lang.name;
    menuEl.querySelectorAll("li").forEach(function (li) {
      li.setAttribute("aria-selected", li.dataset.lang === lang.code ? "true" : "false");
    });
    try { localStorage.setItem(STORAGE_KEY, lang.code); } catch (e) {}
  }

  function openMenu()  { switchEl.classList.add("open");    btnEl.setAttribute("aria-expanded", "true"); }
  function closeMenu() { switchEl.classList.remove("open"); btnEl.setAttribute("aria-expanded", "false"); }

  btnEl.addEventListener("click", function (e) {
    e.stopPropagation();
    if (switchEl.classList.contains("open")) closeMenu(); else openMenu();
  });
  document.addEventListener("click", function (e) { if (!switchEl.contains(e.target)) closeMenu(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

  // Initial language: saved choice → browser preference → English
  (function init() {
    var code = null;
    try { code = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (!code) {
      var nav = (navigator.language || "en").toLowerCase();
      if (nav.indexOf("zh") === 0) code = "zh";
      else if (nav.indexOf("pt") === 0) code = "pt";
      else {
        var match = LANGS.filter(function (l) { return nav === l.code || nav.indexOf(l.code + "-") === 0; })[0];
        code = match ? match.code : "en";
      }
    }
    setLang(code);
  })();
})();
