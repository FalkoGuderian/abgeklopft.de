// Startseite: Vorschau der Beispielprofile als Karussell (Alex Beispiel, Belegleser).
// Daten aus data.js (PROFILE, STUFEN), je Profil die Einträge aus profil.vorschau.
// Ohne JavaScript bleibt das statische Alex-Beispiel im HTML stehen.
// Bedienung: Auto-Wechsel alle 6 s (nicht bei „Bewegung reduzieren“), Pause bei Hover, Fokus, Berührung
// und verborgenem Tab; Punkte, Wischen, Pfeiltasten; Klick öffnet das Beispiel.
(function () {
  var box = document.getElementById("vorschau");
  if (!box || !window.PROFILE || !window.STUFEN) return;
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  };
  var BEISPIELE = [
    { id: "alex", href: "profil.html", punkt: "Beispiel Person" },
    { id: "belegleser", href: "profil.html?p=belegleser", punkt: "Beispiel KI-Agent" }
  ].filter(function (b) { return window.PROFILE[b.id]; });
  if (BEISPIELE.length < 2) return;

  function folieHtml(b, i) {
    var x = window.PROFILE[b.id], p = x.profil, agent = p.art === "ki-agent";
    var liste = (p.vorschau || x.eintraege.slice(0, 4).map(function (e) { return e.id; })).map(function (id) {
      return x.eintraege.filter(function (e) { return e.id === id; })[0];
    }).filter(Boolean);
    var kurz = p.name.replace(/ Beispiel$/, "").replace(/^Belegleser$/, "Belegassistent");
    var art = agent
      ? '<span class="tag art-agent">KI-Agent</span> <span class="meta">Betreiber: ' + esc(p.betreiber.name) + " · Version " + esc(p.version) + "</span>"
      : "";
    // kein role="group" am Link: das nähme ihm die Link-Rolle für Screenreader
    return '<a class="folie" href="' + b.href + '" aria-label="Beispiel ansehen: ' + esc(kurz) + ", " + (agent ? "KI-Agent" : "Person") + " (" + (i + 1) + " von " + BEISPIELE.length + ')">' +
      '<div class="lt">' +
        "<h2>Nachweise für " + esc(kurz) + "</h2>" +
        '<p class="zeile">' + esc(p.zeile) + "</p>" +
        (art ? '<p class="artzeile">' + art + "</p>" : "") +
      "</div>" +
      '<ul class="lt-liste">' + liste.map(function (e) {
        return '<li class="lt-item"><div class="lt-btn"><span class="badge b' + e.stufe + '">' + esc(window.STUFEN[e.stufe].siegel) + '</span><span class="lt-titel">' + esc(e.titel) + "</span></div></li>";
      }).join("") + "</ul>" +
      '<span class="folie-hinweis">Beispiel ansehen →</span>' +
    "</a>";
  }

  box.classList.add("karussell");
  box.setAttribute("role", "region");
  box.setAttribute("aria-roledescription", "Karussell");
  box.setAttribute("aria-label", "Beispielprofile");
  box.removeAttribute("aria-hidden");
  box.innerHTML = '<span class="band" aria-hidden="true">Fiktives Beispiel</span><p class="nur-vorlesen">Fiktives Beispiel</p><div class="folien">' + BEISPIELE.map(folieHtml).join("") + "</div>" +
    '<div class="punkte">' + BEISPIELE.map(function (b, i) {
      return '<button type="button" class="punkt" data-i="' + i + '" aria-label="' + b.punkt + '"></button>';
    }).join("") + '<button type="button" class="pause" aria-pressed="false" aria-label="Wechsel anhalten"><span aria-hidden="true">❚❚</span></button></div>' +
    '<p class="nur-vorlesen" aria-live="polite" id="vorschau-ansage"></p>';

  var folien = [].slice.call(box.querySelectorAll(".folie"));
  var punkte = [].slice.call(box.querySelectorAll(".punkt"));
  var ansage = document.getElementById("vorschau-ansage");
  var ruhig = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var aktiv = 0, timer = null, pausen = {}, beruehrtBis = 0, angehalten = false, wechsel = 0;
  var pauseKnopf = box.querySelector(".pause");

  function zeige(i, vonHand) {
    aktiv = (i + folien.length) % folien.length;
    folien.forEach(function (f, j) {
      var an = j === aktiv;
      f.classList.toggle("an", an);
      f.setAttribute("aria-hidden", an ? "false" : "true");
      f.tabIndex = an ? 0 : -1;
    });
    punkte.forEach(function (p, j) { p.setAttribute("aria-current", j === aktiv ? "true" : "false"); });
    box.dataset.folie = BEISPIELE[aktiv].id; // für eine spätere Prüf-Animation beim Wechsel
    if (vonHand) ansage.textContent = BEISPIELE[aktiv].punkt + ": " + window.PROFILE[BEISPIELE[aktiv].id].profil.name;
  }
  function pausiert() {
    for (var k in pausen) if (pausen[k]) return true;
    return angehalten || Date.now() < beruehrtBis || document.hidden;
  }
  function takt() {
    clearInterval(timer);
    if (ruhig) return;
    timer = setInterval(function () {
      if (pausiert()) return;
      zeige(aktiv + 1, false);
      // WCAG 2.2.2: nach einem vollen Durchlauf bleibt das Karussell stehen; „Weiter“ startet es wieder
      if (++wechsel >= folien.length) anhalten(true);
    }, 6000);
  }
  function anhalten(an) {
    angehalten = an; wechsel = 0;
    pauseKnopf.setAttribute("aria-pressed", String(an));
    pauseKnopf.setAttribute("aria-label", an ? "Wechsel fortsetzen" : "Wechsel anhalten");
    pauseKnopf.firstChild.textContent = an ? "▶" : "❚❚";
    if (an) clearInterval(timer); else takt();
  }
  pauseKnopf.addEventListener("click", function () { anhalten(!angehalten); });
  if (ruhig) { angehalten = true; pauseKnopf.setAttribute("aria-pressed", "true"); pauseKnopf.setAttribute("aria-label", "Wechsel fortsetzen"); pauseKnopf.firstChild.textContent = "▶"; }
  function vonHand(i) { zeige(i, true); if (!angehalten) takt(); }

  punkte.forEach(function (p) { p.addEventListener("click", function () { vonHand(Number(p.dataset.i)); }); });
  box.addEventListener("mouseenter", function () { pausen.maus = true; });
  box.addEventListener("mouseleave", function () { pausen.maus = false; });
  // Pause nur bei Tastaturfokus; ein Mausklick auf einen Punkt soll den Auto-Wechsel nicht dauerhaft anhalten
  box.addEventListener("focusin", function (e) {
    var t = e.target; try { pausen.fokus = t.matches(":focus-visible"); } catch (x) { pausen.fokus = true; }
  });
  box.addEventListener("focusout", function (e) { if (!box.contains(e.relatedTarget)) pausen.fokus = false; });
  box.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      pausen.fokus = true; // Tastatur im Karussell: bis zum Verlassen anhalten
      vonHand(aktiv + (e.key === "ArrowRight" ? 1 : -1));
      var f = folien[aktiv]; if (box.contains(document.activeElement) && document.activeElement.classList.contains("folie")) f.focus();
    }
  });
  // Wischen am Handy; nach einer Berührung 10 s Pause
  var startX = null, startY = 0, gewischt = false;
  box.addEventListener("touchstart", function (e) {
    var t = e.touches[0]; startX = t.clientX; startY = t.clientY; gewischt = false; beruehrtBis = Date.now() + 10000;
  }, { passive: true });
  box.addEventListener("touchend", function (e) {
    if (startX === null) return;
    var t = e.changedTouches[0], dx = t.clientX - startX, dy = t.clientY - startY;
    startX = null; beruehrtBis = Date.now() + 10000;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) { gewischt = true; vonHand(aktiv + (dx < 0 ? 1 : -1)); }
  }, { passive: true });
  box.addEventListener("click", function (e) { if (gewischt && e.target.closest(".folie")) { e.preventDefault(); gewischt = false; } }, true);

  zeige(0, false);
  takt();
})();
