/* abgeklopft.de – Profil-Symbol im Hauptmenü (gemeinsam für alle Seiten mit Hauptmenü).
   Zeigt rechts neben "So geht's" ein Symbol mit kleinem Menü (Mein Profil, Abmelden, Profil löschen), solange auf DIESEM Gerät ein Einreicher-Profil
   angemeldet ist. Die Prüfung ist rein lokal (localStorage): nichts geht an Dritte oder an den Server.
   Seiten mit eigener Anmeldung (pruefer.html) setzen vorher window.AK_PROFIL_MANUELL = true und steuern das Symbol selbst:
     AKProfilMenue.setzen({ label, name, abmelden, frage, profilLink, loeschen })   AKProfilMenue.entfernen()
   Einreicher-Seiten können mit AKProfilMenue.beiAbmelden(fn) eigene Aufräumarbeit hinterlegen und mit AKProfilMenue.pruefen() neu prüfen. */
(function () {
  "use strict";
  var KONTO_KEY = "ak_konto_v1", NAME_KEY = "ak_konto_name_v1";
  var nav = document.querySelector('nav[aria-label="Hauptmenü"]');
  if (!nav) return;
  // Handy-Menü: einzeilige Leiste. Solange rechts noch Punkte verborgen sind, trägt sie die Klasse .quer (Fortsetzungs-Hinweis, siehe style.css)
  function quer() {
    var rest = nav.scrollWidth - nav.clientWidth - nav.scrollLeft;
    nav.classList.toggle("quer", nav.scrollWidth > nav.clientWidth + 1 && rest > 2);
  }
  nav.addEventListener("scroll", quer, { passive: true });
  window.addEventListener("resize", quer);
  window.addEventListener("load", quer);
  quer();
  // Abnehmeransicht (persönlicher Link, Vorschau, lesbarer Link): Menü ist ausgeblendet, dort auch kein Profil-Symbol
  var q = new URLSearchParams(location.search);
  if (/\/profil\.html$/.test(location.pathname) && (q.get("l") || q.get("vorschau") === "1")) return;
  if (/^\/[a-z0-9-]{3,30}\/[a-z0-9-]{1,40}\/?$/.test(location.pathname)) return;

  var SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg>';
  var wrap = null, knopf = null, menue = null, zustand = null, abmeldeFn = null, geoeffnet = 0;

  function lesen(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function angemeldet() {
    try { var k = JSON.parse(lesen(KONTO_KEY) || "null"); return !!(k && k.id && k.schluessel); } catch (e) { return false; }
  }
  function el(tag, attrs, text) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function zu(fokus) {
    if (!menue || menue.hidden) return;
    menue.hidden = true; knopf.setAttribute("aria-expanded", "false");
    var b = menue.querySelector("[data-scharf]");
    if (b) { b.textContent = b.dataset.alt; b.classList.remove("gefahr"); delete b.dataset.scharf; }
    if (fokus) knopf.focus();
  }
  function eintraege() { return menue ? Array.prototype.slice.call(menue.querySelectorAll('[role="menuitem"]')) : []; }
  function auf() {
    menue.hidden = false; knopf.setAttribute("aria-expanded", "true"); geoeffnet = Date.now();
    var r = knopf.getBoundingClientRect(), w = menue.offsetWidth, links = Math.max(10, Math.min(r.right - w, window.innerWidth - w - 10));
    menue.style.left = links + "px"; menue.style.top = (r.bottom + 6) + "px";
    var e = eintraege(); if (e[0]) e[0].focus();
  }
  function aktuell() {
    if (!knopf) return;
    var seite = /\/mein-profil(\.html)?$/.test(location.pathname);
    if (seite) knopf.setAttribute("aria-current", "page"); else knopf.removeAttribute("aria-current");
    var pl = menue && menue.querySelector("#pm-profil");
    if (pl) { if (seite) pl.setAttribute("aria-current", "page"); else pl.removeAttribute("aria-current"); }
  }
  // Desktop: Symbol hinter dem Menü; Handy (≤ 760 px): vor dem Menü, damit Tab-Reihenfolge und Anordnung (Logo, Profil, Menü) übereinstimmen
  var klein = window.matchMedia ? window.matchMedia("(max-width: 760px)") : null;
  function platzieren() {
    if (!wrap) return;
    var kopf = nav.parentNode;
    if (klein && klein.matches) kopf.insertBefore(wrap, nav); else kopf.insertBefore(wrap, nav.nextSibling);
    quer();
  }
  if (klein) { if (klein.addEventListener) klein.addEventListener("change", platzieren); else if (klein.addListener) klein.addListener(platzieren); }
  function bauen(o) {
    entfernen();
    zustand = o; abmeldeFn = o.abmelden;
    wrap = el("span", { class: "profil-wrap" });
    knopf = el("button", { type: "button", class: "profilknopf", id: "profilknopf", "aria-label": o.label || "Mein Profil", title: o.label || "Mein Profil", "aria-haspopup": "menu", "aria-expanded": "false", "aria-controls": "profilmenue" });
    knopf.innerHTML = SVG;
    wrap.appendChild(knopf); platzieren();
    menue = el("div", { class: "profilmenue", id: "profilmenue", role: "menu", "aria-label": o.label || "Mein Profil" });
    menue.hidden = true;
    menue.appendChild(el("div", { class: "profilmenue-name", id: "profilmenue-name" }, o.name || o.label || "Mein Profil"));
    if (o.profilLink) { var a = el("a", { href: o.profilLink, role: "menuitem", id: "pm-profil" }, o.profilText || "Mein Profil ansehen und bearbeiten"); menue.appendChild(a); }
    var b = el("button", { type: "button", role: "menuitem", id: "pm-abmelden", title: o.hinweis || "" }, "Abmelden");
    menue.appendChild(b);
    if (o.loeschen) {
      var l = el("button", { type: "button", role: "menuitem", id: "pm-loeschen", class: "loeschen" }, "Profil löschen …");
      menue.appendChild(l);
    }
    document.body.appendChild(menue);

    knopf.addEventListener("click", function () { if (menue.hidden) auf(); else zu(true); });
    knopf.addEventListener("keydown", function (e) { if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); if (menue.hidden) auf(); } });
    menue.addEventListener("keydown", function (e) {
      var l = eintraege(), i = l.indexOf(document.activeElement);
      if (e.key === "Escape") { e.preventDefault(); zu(true); }
      else if (e.key === "ArrowDown") { e.preventDefault(); l[(i + 1) % l.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); l[(i - 1 + l.length) % l.length].focus(); }
      else if (e.key === "Home") { e.preventDefault(); l[0].focus(); }
      else if (e.key === "End") { e.preventDefault(); l[l.length - 1].focus(); }
      else if (e.key === "Tab") zu(false);
    });
    menue.addEventListener("click", function (e) {
      var t = e.target.closest("a"); if (t) { zu(false); return; }
      if (e.target.closest("#pm-loeschen")) {
        // Löschen läuft in einem Bestätigungsdialog auf teilen.html (Wort LÖSCHEN); auf anderen Seiten dorthin wechseln
        zu(false);
        if (typeof window.AKProfilLoeschen === "function") window.AKProfilLoeschen(); else location.href = "/teilen.html?loeschen=1";
        return;
      }
      var ab = e.target.closest("#pm-abmelden"); if (!ab) return;
      // Zweistufig wie überall auf der Seite: erst fragen (Text im Knopf), dann ausführen
      if (o.frage && !ab.dataset.scharf) {
        ab.dataset.alt = ab.textContent; ab.dataset.scharf = "1"; ab.textContent = o.frage; ab.classList.add("gefahr");
        setTimeout(function () { if (ab.isConnected && ab.dataset.scharf) { ab.textContent = ab.dataset.alt; ab.classList.remove("gefahr"); delete ab.dataset.scharf; } }, 4000);
        return;
      }
      zu(false);
      if (typeof abmeldeFn === "function") abmeldeFn();
    });
    document.addEventListener("click", aussen, true);
    window.addEventListener("resize", zuAusLeise); window.addEventListener("scroll", zuAusLeise, { passive: true });
    window.addEventListener("hashchange", aktuell);
    aktuell();
  }
  function aussen(e) { if (menue && !menue.hidden && !menue.contains(e.target) && !knopf.contains(e.target)) zu(false); }
  // Ein Scroll-Ereignis unmittelbar nach dem Öffnen (Kopf scrollt am Handy mit, Seite springt zum Knopf) schließt das Menü nicht wieder
  function zuAusLeise(e) { if (e && e.type === "scroll" && Date.now() - geoeffnet < 400) return; zu(false); }
  function entfernen() {
    document.removeEventListener("click", aussen, true);
    window.removeEventListener("resize", zuAusLeise); window.removeEventListener("scroll", zuAusLeise);
    window.removeEventListener("hashchange", aktuell);
    if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap);
    if (menue && menue.parentNode) menue.parentNode.removeChild(menue);
    wrap = knopf = menue = zustand = null;
  }
  // Standardfall: Einreicher-Profil auf diesem Gerät
  var eigeneAbmeldung = null;
  function einreicher() {
    var name = lesen(NAME_KEY);
    bauen({
      label: "Mein Profil", loeschen: true, name: name || "Mein Profil", profilLink: "/mein-profil.html",
      frage: "Ohne Code kein Zurück. Abmelden?", hinweis: "Der Schlüssel wird von diesem Gerät entfernt. Ihr Profil bleibt bestehen. Zurück kommen Sie nur mit dem Wiederherstellungscode.",
      abmelden: function () {
        if (eigeneAbmeldung) { eigeneAbmeldung(); }
        else { try { localStorage.removeItem(KONTO_KEY); localStorage.removeItem(NAME_KEY); } catch (e) { /* gesperrt */ } }
        pruefen();
      }
    });
  }
  function pruefen() {
    if (window.AK_PROFIL_MANUELL) return;
    if (angemeldet()) { if (!knopf) einreicher(); else { var n = document.getElementById("profilmenue-name"); if (n) n.textContent = lesen(NAME_KEY) || "Mein Profil"; } }
    else entfernen();
  }
  window.AKProfilMenue = {
    setzen: function (o) { bauen(o || {}); }, entfernen: entfernen, pruefen: pruefen,
    beiAbmelden: function (fn) { eigeneAbmeldung = fn; },
    name: function (n) { try { if (n) localStorage.setItem(NAME_KEY, String(n)); else localStorage.removeItem(NAME_KEY); } catch (e) { /* gesperrt */ } pruefen(); }
  };
  pruefen();
})();
