/* abgeklopft.de – Inhaltsleiste (nav.schritte[data-schritte]) für lange Seiten ohne eigene Logik:
   markiert beim Scrollen den aktuellen Abschnitt (aria-current="location") und hält die Leiste unter dem Kopf.
   Die Links zeigen auf #id der Abschnitte (Klasse schritt-ziel setzt scroll-margin-top). Ohne JavaScript bleiben es normale Sprunglinks. */
(function () {
  "use strict";
  var nav = document.querySelector("nav.schritte[data-schritte]");
  if (!nav) return;
  var kopf = document.querySelector("header.top");
  var links = [].slice.call(nav.querySelectorAll('a[href^="#"]'));
  var ziele = links.map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); });
  if (!ziele.length || ziele.some(function (z) { return !z; })) return;
  function kopfH() { return kopf && getComputedStyle(kopf).position === "sticky" ? kopf.offsetHeight : 0; }
  function setzeKopf() { document.documentElement.style.setProperty("--kopfhoehe", kopfH() + "px"); }
  var fest = -1;
  var timer = 0;
  function loesen() { if (!(window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4)) { fest = -1; neu(); } }
  if ("onscrollend" in window) window.addEventListener("scrollend", loesen);
  else window.addEventListener("scroll", function () { clearTimeout(timer); timer = setTimeout(loesen, 250); }, { passive: true });
  function aktuell(i) {
    links.forEach(function (a, j) {
      if (j === i) { if (a.getAttribute("aria-current") !== "location") { a.setAttribute("aria-current", "location"); if (nav.scrollWidth > nav.clientWidth) nav.scrollLeft = Math.max(0, a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2); } }
      else a.removeAttribute("aria-current");
    });
  }
  function neu() {
    if (fest >= 0) { aktuell(fest); return; }
    var grenze = kopfH() + nav.offsetHeight + 40, n = 0;
    ziele.forEach(function (z, i) { if (z.getBoundingClientRect().top <= grenze) n = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) n = ziele.length - 1;
    aktuell(n);
  }
  ["wheel", "touchmove", "keydown"].forEach(function (ev) { window.addEventListener(ev, function () { fest = -1; }, { passive: true }); });
  nav.addEventListener("click", function (e) { var a = e.target.closest("a"); if (a) { fest = links.indexOf(a); aktuell(fest); } });
  // Fortsetzungs-Hinweis (T11): .quer, solange rechts noch Kacheln verborgen sind
  function quer() { var rest = nav.scrollWidth - nav.clientWidth - nav.scrollLeft; nav.classList.toggle("quer", nav.scrollWidth > nav.clientWidth + 1 && rest > 2); }
  nav.addEventListener("scroll", quer, { passive: true }); window.addEventListener("load", quer);
  window.addEventListener("resize", quer); quer();
  setzeKopf(); window.addEventListener("resize", function () { setzeKopf(); neu(); });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(neu, { rootMargin: "-90px 0px -45% 0px", threshold: [0, 0.01, 1] });
    ziele.forEach(function (z) { io.observe(z); });
  } else window.addEventListener("scroll", neu, { passive: true });
  neu();
})();
