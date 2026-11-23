// Gemeinsame Funktionen: Hash, Speicher, Profil-Darstellung
const REG_KEY = "gaa_register_v1";       // ausgestellte Attestationen (Prüferansicht)
const LINK_KEY = "gaa_links_v1";         // persönliche Links je Empfänger
const OEFF_KEY = "gaa_oeffnungen_v1";    // Öffnungen der Links
const BEST_KEY = "gaa_bestaetigungen_v1"; // Bestätigungsanfragen an Auftraggeber

function kanonisch(obj) {
  // Schlüssel sortiert, damit derselbe Inhalt immer denselben Hash ergibt
  if (Array.isArray(obj)) return "[" + obj.map(kanonisch).join(",") + "]";
  if (obj && typeof obj === "object")
    return "{" + Object.keys(obj).sort().map(k => JSON.stringify(k) + ":" + kanonisch(obj[k])).join(",") + "}";
  return JSON.stringify(obj);
}
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
function lesen(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function schreiben(key, liste) { try { localStorage.setItem(key, JSON.stringify(liste)); } catch { /* Speicher gesperrt */ } }
const registerLesen = () => lesen(REG_KEY);
const registerSchreiben = l => schreiben(REG_KEY, l);
function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function neueId() { return Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }
const heuteIso = () => new Date().toISOString().slice(0, 10);

// Signatur: Ed25519, sonst ECDSA P-256 als Ersatz in älteren Browsern.
// Prototyp: Der private Schlüssel des Prüfers liegt im Browser. Produktiv liegt er nur auf dem Server.
const SCHL_KEY = "gaa_pruefer_schluessel_v1";
const VERTRAUT_KEY = "gaa_vertraute_schluessel_v1";
const ALGS = [{ name: "Ed25519" }, { name: "ECDSA", namedCurve: "P-256" }];
const signAlg = a => a.name === "ECDSA" ? { name: "ECDSA", hash: "SHA-256" } : { name: a.name };
const b64 = buf => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));

async function eigenerSchluessel(name) {
  let s = null; try { s = JSON.parse(localStorage.getItem(SCHL_KEY) || "null"); } catch {}
  if (s) return { ...s, privKey: await crypto.subtle.importKey("jwk", s.priv, s.alg, false, ["sign"]) };
  for (const alg of ALGS) {
    try {
      const kp = await crypto.subtle.generateKey(alg, true, ["sign", "verify"]);
      const priv = await crypto.subtle.exportKey("jwk", kp.privateKey), pub = await crypto.subtle.exportKey("jwk", kp.publicKey);
      const kid = "K-" + (await sha256(kanonisch(pub))).slice(0, 8).toUpperCase();
      s = { alg, priv, pub, kid, name };
      try { localStorage.setItem(SCHL_KEY, JSON.stringify(s)); } catch {}
      const v = lesen(VERTRAUT_KEY).filter(k => k.kid !== kid); v.push({ kid, name, alg, pub }); schreiben(VERTRAUT_KEY, v);
      return { ...s, privKey: kp.privateKey };
    } catch { /* Algorithmus nicht verfügbar, nächsten versuchen */ }
  }
  throw new Error("Dieser Browser kann nicht signieren.");
}
async function signieren(text, name) {
  const k = await eigenerSchluessel(name);
  const wert = await crypto.subtle.sign(signAlg(k.alg), k.privKey, new TextEncoder().encode(text));
  return { alg: k.alg, kid: k.kid, pruefer: k.name, pub: k.pub, wert: b64(wert) };
}
// Ergebnis: "keine" | "falsch" | "fremd" (gültig, Schlüssel nicht vertraut) | "vertraut"
async function signaturPruefen(sig, text) {
  if (!sig) return { status: "keine" };
  try {
    const pub = await crypto.subtle.importKey("jwk", sig.pub, sig.alg, false, ["verify"]);
    const ok = await crypto.subtle.verify(signAlg(sig.alg), pub, unb64(sig.wert), new TextEncoder().encode(text));
    if (!ok) return { status: "falsch" };
    // Vertraut: Schlüssel aus diesem Browser oder veröffentlichte Plattform-Schlüssel (/.well-known/jwks.json)
    const v = [...lesen(VERTRAUT_KEY), ...(window.VERTRAUT_EXTRA || [])]
      .find(k => k.kid === sig.kid && kanonisch(k.pub) === kanonisch(sig.pub));
    return v ? { status: "vertraut", name: v.name, kid: v.kid } : { status: "fremd", kid: sig.kid };
  } catch { return { status: "falsch" }; }
}

// Wirksame Stufe: Eine Zusage des Auftraggebers hebt den Eintrag auf S3
function bestaetigungenZu(id) { return lesen(BEST_KEY).filter(b => b.eintrag === id && b.status === "ja"); }
function stufeVon(p) { return bestaetigungenZu(p.id).length ? 3 : p.stufe; }

function eintragHtml(p, i) {
  const st = stufeVon(p), weg = PRUEFWEGE[p.weg || WEG_JE_KATEGORIE[p.kategorie]] || PRUEFWEGE.fachgespraech;
  const best = [...(p.bestaetigt || []).map(b => ({ antwortName: b.name, antwortRolle: b.rolle, antwortDatum: b.datum, kommentar: b.kommentar, agent: b.agent })),
    ...bestaetigungenZu(p.id)];
  return `
  <li class="lt-item">
    <button type="button" class="lt-btn" aria-expanded="false" aria-controls="d-${i}" data-id="${esc(p.id)}">
      <span class="badge b${st}" title="${esc(STUFEN[st].text)}">${STUFEN[st].siegel}</span>
      <span class="lt-titel">${esc(p.titel)}</span>
      <span class="lt-zeit">${esc(p.zeitraum)}</span>
    </button>
    <div class="lt-detail" id="d-${i}" hidden>
      <p>${esc(p.text)}</p>
      <p class="meta"><b>${esc(STUFEN[st].titel)}.</b> ${esc(STUFEN[st].text)}${p.abgelaufen ? ' <span class="exp">Gültigkeit abgelaufen.</span>' : ""}</p>
      ${p.geprueft && st === 2 ? `<p class="meta">Geprüft am ${esc(p.geprueft.datum)}: ${esc(p.geprueft.text)}</p>` : ""}
      ${p.offen && st === 1 ? `<p class="meta">Offen: ${esc(p.offen)}</p>` : ""}
      ${best.map(b => `<p class="meta" title="Name und Rolle sind Angaben der antwortenden Person.">Bestätigt von ${b.agent ? '<span class="tag art-agent">KI-Agent</span> ' : ""}${esc(b.antwortName)} (${esc(b.antwortRolle)}) am ${esc(b.antwortDatum)}${b.kommentar ? ": „" + esc(b.kommentar) + "“" : ""}</p>`).join("")}
      <p class="meta">${st === 1 ? "Möglicher Prüfweg" : "Prüfweg"}: ${esc(weg.name)}. Beleg: ${esc(p.beleg)}</p>
      <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
    </div>
  </li>`;
}
function profilZeigen(ziel, eintraege, beimOeffnen, darstellen = eintragHtml) {
  const el = document.getElementById(ziel);
  if (!el) return;
  el.innerHTML = `<ul class="lt-liste">${eintraege.map(darstellen).join("")}</ul>`;
  el.addEventListener("click", e => {
    const b = e.target.closest(".lt-btn"); if (!b) return;
    const d = document.getElementById(b.getAttribute("aria-controls"));
    const auf = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", auf); d.hidden = !auf;
    if (auf && beimOeffnen) beimOeffnen(b.dataset.id);
  });
}

// ---------- Server (abgeklopft-api, Cloudflare Worker + D1 in der EU) ----------
// Lokal (http://localhost:<port>) spricht die Seite mit "wrangler dev" auf Port 8787, sonst mit der Live-API.
// Alle anderen Herkünfte (auch https://localhost) nutzen die Live-API.
const API_LIVE = "https://abgeklopft-api.falko-guderian.workers.dev";
const API = location.protocol === "http:" && location.hostname === "localhost" ? "http://localhost:8787" : API_LIVE;
const KONTO_KEY = "ak_konto_v1"; // { id, schluessel } des eigenen Profils, nur auf diesem Gerät

class ApiFehler extends Error {
  constructor(status, code, meldung) { super(meldung); this.status = status; this.code = code; }
}
async function api(methode, pfad, body, schluessel) {
  const h = {};
  if (body !== undefined) h["Content-Type"] = "application/json";
  if (schluessel) h.Authorization = "Bearer " + schluessel;
  let r;
  try {
    r = await fetch(API + pfad, { method: methode, headers: h, body: body === undefined ? undefined : JSON.stringify(body), cache: "no-store" });
  } catch {
    throw new ApiFehler(0, "offline", navigator.onLine === false
      ? "Keine Internetverbindung. Bitte verbinden Sie sich und versuchen Sie es erneut."
      : "Keine Verbindung zum Server von abgeklopft.de. Bitte prüfen Sie Ihre Internetverbindung oder versuchen Sie es in ein paar Minuten erneut.");
  }
  let j = null; try { j = await r.json(); } catch {}
  if (!r.ok) {
    const m = (j && j.meldung) || (r.status >= 500 ? "Der Server hat einen Fehler gemeldet. Bitte später erneut versuchen." : "Fehler " + r.status + ".");
    throw new ApiFehler(r.status, (j && j.fehler) || "fehler", m);
  }
  return j;
}
function kontoLesen() {
  try { const k = JSON.parse(localStorage.getItem(KONTO_KEY) || "null"); return k && k.id && k.schluessel ? k : null; } catch { return null; }
}
function kontoSchreiben(k) { try { localStorage.setItem(KONTO_KEY, JSON.stringify({ id: k.id, schluessel: k.schluessel })); return true; } catch { return false; } }
function kontoWeg() { try { localStorage.removeItem(KONTO_KEY); } catch {} }
// Wiederherstellungscode: 10 Zeichen Profil-ID + 30 Zeichen Schlüssel, in Vierergruppen. Verwechslungen O/0, I/L/1 egal.
function codeLesen(s) {
  const t = String(s || "").toUpperCase().replace(/O/g, "0").replace(/[IL]/g, "1").replace(/[^0-9A-Z]/g, "");
  return t.length === 40 && !/[U]/.test(t) ? { id: t.slice(0, 10), schluessel: t.slice(10) } : null;
}
const kuerzelVon = name => String(name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join("").toUpperCase() || "?";
const sichereUrl = u => /^https?:\/\//i.test(String(u || ""));
function urlKurz(u) {
  try { const x = new URL(u); return (x.hostname + x.pathname).replace(/\/$/, "").slice(0, 60); } catch { return String(u).slice(0, 60); }
}
function datumDe(iso) {
  try { return new Date(iso).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" }); } catch { return iso; }
}
const ANTWORT_TEXT = { ja: "Ja, stimmt so", teilweise: "Teilweise", nein: "Nein" };
// Antwort eines Auftraggebers als Zeile: noch nicht geprüft, hebt die Stufe NICHT
function bestaetigungHtml(b) {
  if (b.status === "angefragt") return `<p class="meta">Bestätigung angefragt am ${esc(b.angefragt)}${b.an ? " bei " + esc(b.an) : ""}.</p>`;
  return `<p class="meta"><b>Bestätigung erhalten – noch nicht geprüft.</b> ${esc(ANTWORT_TEXT[b.antwort] || b.antwort)} · ${b.von === "ki-agent" ? '<span class="tag art-agent">KI-Agent</span> ' : ""}${esc(b.name)} (${esc(b.rolle)}, ${esc(b.firma)}${b.verantwortlich ? ", verantwortlich: " + esc(b.verantwortlich) : ""}) am ${esc(b.datum)}${b.kommentar ? ": „" + esc(b.kommentar) + "“" : ""}</p>`;
}
// Prüfobjekt eines Eintrags: feste Kurzzeile unter dem Siegel (nie eingeklappt), Details darunter einklappbar.
// Maßgeblich ist die signierte Fassung im Bericht; die Kopie unter "pruefung" dient nur als Rückfall. Alle Texte werden escaped.
function poKurzliste(liste, max) {
  const t = []; let n = 0;
  for (const x of liste) { if (n + x.length > max && t.length) break; t.push(x); n += x.length + 2; }
  return t.join("; ") + (t.length < liste.length ? "… (+" + (liste.length - t.length) + " weitere, siehe Details)" : "");
}
function pruefobjektHtml(e) {
  const b = e.pruefbericht;
  if (!b) return ""; // Eintrag ohne Bericht (S1): keine Zeile
  // Form der Antwort: pruefbericht.version und (bei Version 3) pruefbericht.pruefobjekt; Rückfall auf inhalt/pruefung (Profil-Hülle)
  const ver = b.version || (b.inhalt && b.inhalt.version) || 0;
  const po = b.pruefobjekt || (b.inhalt && b.inhalt.pruefobjekt) || (e.pruefung && e.pruefung.pruefobjekt) || null;
  if (!po && ver !== 2) return ""; // Version unbekannt: nichts behaupten
  if (!po || typeof po !== "object") return `<p class="po-zeile po-alt meta">Der Umfang der Prüfung ist nicht angegeben (Bericht vor Format 0.5).</p>`;
  const umfang = Array.isArray(po.umfang_geprueft) ? po.umfang_geprueft.map(String) : [];
  const nicht = Array.isArray(po.nicht_geprueft) ? po.nicht_geprueft.map(String) : [];
  const nichtText = po.nichts_ausgeschlossen === true ? "Nichts ausgeschlossen (vom Prüfer ausdrücklich bestätigt)" : poKurzliste(nicht, 110);
  const liste = (l, leer) => l.length ? `<ul>${l.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="meta">${leer}</p>`;
  return `<div class="po-zeile">
      <p class="po-kurz"><b>Geprüft:</b> ${esc(poKurzliste(umfang, 110))} (Stand: ${esc(po.version_stand)}). <b>Nicht geprüft:</b> ${esc(nichtText)}.</p>
      <details class="po-details"><summary>Details zur Prüfung</summary>
        <dl><dt>Gegenstand</dt><dd>${esc(po.gegenstand)}</dd><dt>Stand</dt><dd>${esc(po.version_stand)}</dd><dt>Methode</dt><dd>${esc(po.methode)}</dd></dl>
        <p class="po-kopf">Geprüft</p>${liste(umfang, "–")}
        <p class="po-kopf">Nicht geprüft</p>${po.nichts_ausgeschlossen === true ? `<p class="meta">Nichts ausgeschlossen (vom Prüfer ausdrücklich bestätigt)</p>` : liste(nicht, "–")}
      </details>
    </div>`;
}
// Teile eines Eintrags (Schritt D3): Gesamtstufe als feste Zeile, Liste der Teile einklappbar. Nur escaped Text.
const TEIL_TYP_TEXT = { produkt: "Produkt", prozess: "Prozess", dienstleistung: "Dienstleistung", dokument: "Dokument", abschluss: "Abschluss", sonstiges: "Sonstiges" };
const TEIL_BEZ_TEXT = { nach_ende: "zeitlich nach Ende von", nach_start: "zeitlich nach Start von", gleichzeitig: "zeitlich gleichzeitig mit", gleicher_ort: "am gleichen Ort wie", anderer_ort: "an einem anderen Ort als",
  setzt_voraus: "setzt voraus:", nutzt: "nutzt:", ersetzt: "ersetzt:", ist_variante_von: "ist Variante von" };
// Wirksame Stufe eines Teils: ohne gültigen Bericht S1
const teilStufe = t => (t.pruefbericht && t.gueltig !== false && (t.stufe === 2 || t.stufe === 3)) ? t.stufe : 1;
function teileGesamtHtml(e) {
  if (!Array.isArray(e.teile) || !e.teile.length || !e.gesamt) return "";
  const g = e.gesamt, st = [1, 2, 3].includes(g.stufe) ? g.stufe : 1;
  const titel = id => ((e.teile.find(t => t.id === id) || {}).titel) || id;
  const bg = Array.isArray(g.begrenzt_durch) ? g.begrenzt_durch.map(titel) : [];
  const zusatz = [g.abgeleitet ? "abgeleitet aus den Teilen" : "mit eigener Prüfung des Ganzen", bg.length ? "begrenzt durch " + bg.join(", ") : ""].filter(Boolean).join("; ");
  return `<p class="te-gesamt"><b>Gesamtstufe: S${st}</b> (${esc(STUFEN[st].siegel)}; ${esc(zusatz)}). Sie ist die niedrigste Stufe der Pflichtteile.</p>`;
}
function teileListeHtml(e) {
  if (!Array.isArray(e.teile) || !e.teile.length) return "";
  const titel = id => ((e.teile.find(t => t.id === id) || {}).titel) || id;
  const li = e.teile.map(t => {
    const st = teilStufe(t);
    const ab = (t.abhaengig_von || []).map(d => `${esc(TEIL_BEZ_TEXT[d.art] || d.art)} ${esc(titel(d.teil))}`).join("; ");
    return `<li class="te-teil"><p class="te-kopf"><span class="badge b${st}" title="${esc(STUFEN[st].text)}">${STUFEN[st].siegel}</span> <b>${esc(t.titel)}</b>
        <span class="meta">${esc(TEIL_TYP_TEXT[t.typ] || t.typ)} · ${t.pflicht === false ? "optional (senkt die Gesamtstufe nicht)" : "Pflichtteil"}${t.ort ? " · " + esc(t.ort) : ""}</span></p>
      ${ab ? `<p class="meta te-ab">Abhängig: ${ab}</p>` : ""}
      ${t.pruefbericht && t.gueltig === false ? `<p class="meta te-ab">Der Prüfbericht dieses Teils ist abgelaufen und zählt als S1.</p>` : ""}
      ${t.pruefbericht ? pruefobjektHtml(t) : `<p class="meta te-ab">Kein gültiger Prüfbericht: zählt als S1.</p>`}</li>`;
  }).join("");
  return `<details class="te-details"><summary>Teile (${e.teile.length})</summary><ul class="te-liste">${li}</ul></details>`;
}
// Prozess (D4): Beobachtungszeitraum im Siegelbereich (nur mit Bericht) und Prozessdaten am Eintrag. Nur escaped Text.
const PROZESS_WEG_NAME = { prozess_dokumentation: "Verfahrensdokument gegen Beobachtung", prozess_stichprobe: "Stichprobe aus Prozessprotokollen", prozess_bestaetigung: "Bestätigung durch Prozessverantwortliche" };
const NACHWEIS_TEXT = { dokumentation: "Verfahrensdokumentation", protokolle: "Protokolle der Vorgänge", beobachtung: "Beobachtung vor Ort", kennzahlen: "Kennzahlen", audit_fremd: "Fremdes Audit" };
function prozessZeitraumHtml(e, st) {
  if (e.kategorie !== "Prozess" || !e.zeitraum || !e.pruefbericht || st === 1) return "";
  const weg = PROZESS_WEG_NAME[e.pruefbericht.pruefweg] || (window.PRUEFWEGE && (PRUEFWEGE[e.pruefbericht.pruefweg] || {}).name) || e.pruefbericht.pruefweg || "";
  return `<p class="pz-zeile"><b>Beobachtungszeitraum:</b> ${esc(e.zeitraum)}. Im Zeitraum ${esc(e.zeitraum)} wurde nach diesem Verfahren gearbeitet, geprüft: ${esc(weg)}.</p>`;
}
function prozessDatenHtml(e) {
  const p = e.prozess; if (e.kategorie !== "Prozess" || !p || typeof p !== "object") return "";
  const dl = [["Ziel", p.ziel], ["Auslöser", p.ausloeser], ["Ergebnis", p.ergebnis], ["Beobachtungszeitraum", e.zeitraum]].filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join("");
  const rollen = (p.rollen || []).length ? `<p class="meta">Rollen: ${p.rollen.map(esc).join(", ")}</p>` : "";
  const kz = (p.kennzahlen || []).length ? `<p class="meta">Kennzahlen (Angaben der Person, nicht geprüft):</p><ul>${p.kennzahlen.map(k => `<li>${esc(k.name)}: ${esc(k.wert)}${k.einheit ? " " + esc(k.einheit) : ""}${k.zeitraum ? ", " + esc(k.zeitraum) : ""}${k.quelle ? " (Quelle: " + esc(k.quelle) + ")" : ""}</li>`).join("")}</ul>` : "";
  const nw = (p.nachweisart || []).length ? `<p class="meta">Nachweisart: ${p.nachweisart.map(a => esc(NACHWEIS_TEXT[a] || a)).join(", ")}</p>` : "";
  return `<div class="pz-daten"><dl>${dl}</dl>${rollen}${kz}${nw}</div>`;
}
// Eintrag eines selbst angelegten Profils (immer Stufe 1)
function serverEintragHtml(e, i) {
  const mitTeilen = Array.isArray(e.teile) && e.teile.length && e.gesamt;
  // Stufe 2/3 nur mit Prüfbericht (signiert vom Server); bei Teilen zählt die berechnete Gesamtstufe
  const st = mitTeilen ? ([2, 3].includes(e.gesamt.stufe) ? e.gesamt.stufe : 1) : (e.stufe === 2 || e.stufe === 3) && e.pruefbericht ? e.stufe : 1;
  const belege = (e.belege || []).map(u => sichereUrl(u)
    ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow ugc">${esc(urlKurz(u))}</a>` : esc(u)).join(" · ");
  return `
  <li class="lt-item">
    <button type="button" class="lt-btn" aria-expanded="false" aria-controls="d-${i}" data-id="${esc(e.id)}">
      <span class="badge b${st}" title="${esc(STUFEN[st].text)}">${STUFEN[st].siegel}</span>
      <span class="lt-titel">${esc(e.titel)}</span>
      <span class="lt-zeit">${esc(e.zeitraum || "")}</span>
    </button>
    ${pruefobjektHtml(e)}${prozessZeitraumHtml(e, st)}${teileGesamtHtml(e)}
    <div class="lt-detail" id="d-${i}" hidden>
      ${e.text ? `<p class="mehrzeilig">${esc(e.text)}</p>` : ""}
      ${prozessDatenHtml(e)}
      ${teileListeHtml(e)}
      <p class="meta"><b>${esc(STUFEN[st].titel)}.</b> ${st === 1 ? "Selbst eingetragen, von abgeklopft.de nicht geprüft." : !e.pruefbericht ? `Gesamtstufe aus den Berichten der Teile berechnet. Nachrechnen: <a href="/verify.html">verify.html</a>.` : `Prüfbericht ${esc(e.pruefbericht.kennung)}, ausgestellt ${esc(e.pruefbericht.ausgestellt)}, gültig bis ${esc(e.pruefbericht.gueltigBis)}.${e.pruefbericht.beispiel ? " Pilot-Testschlüssel: nur Vorführung des Verfahrens, keine echte Prüfung." : ""} Nachrechnen: <a href="/verify.html">verify.html</a>.`}</p>
      ${(e.bestaetigungen || []).map(bestaetigungHtml).join("")}
      <p class="meta">Links der Person: ${belege || "keine"}</p>
      <div>${(e.faehigkeiten || []).map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
    </div>
  </li>`;
}
