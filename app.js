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
      <span class="badge b${st}" title="${esc(STUFEN[st].text)}">${STUFEN[st].kurz}</span>
      <span class="lt-titel">${esc(p.titel)}</span>
      <span class="lt-zeit">${esc(p.zeitraum)}</span>
    </button>
    <div class="lt-detail" id="d-${i}" hidden>
      <p>${esc(p.text)}</p>
      <p class="meta"><b>${esc(STUFEN[st].name)}.</b> ${esc(STUFEN[st].text)}${p.abgelaufen ? ' <span class="exp">Gültigkeit abgelaufen.</span>' : ""}</p>
      ${p.geprueft && st === 2 ? `<p class="meta">Geprüft am ${esc(p.geprueft.datum)}: ${esc(p.geprueft.text)}</p>` : ""}
      ${p.offen && st === 1 ? `<p class="meta">Offen: ${esc(p.offen)}</p>` : ""}
      ${best.map(b => `<p class="meta">Bestätigt von ${b.agent ? '<span class="tag art-agent">KI-Agent</span> ' : ""}${esc(b.antwortName)} (${esc(b.antwortRolle)}) am ${esc(b.antwortDatum)}${b.kommentar ? ": „" + esc(b.kommentar) + "“" : ""}</p>`).join("")}
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
// Eintrag eines selbst angelegten Profils (immer Stufe 1)
function serverEintragHtml(e, i) {
  const belege = (e.belege || []).map(u => sichereUrl(u)
    ? `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer nofollow ugc">${esc(urlKurz(u))}</a>` : esc(u)).join(" · ");
  return `
  <li class="lt-item">
    <button type="button" class="lt-btn" aria-expanded="false" aria-controls="d-${i}" data-id="${esc(e.id)}">
      <span class="badge b1" title="${esc(STUFEN[1].text)}">${STUFEN[1].kurz}</span>
      <span class="lt-titel">${esc(e.titel)}</span>
      <span class="lt-zeit">${esc(e.zeitraum || "")}</span>
    </button>
    <div class="lt-detail" id="d-${i}" hidden>
      ${e.text ? `<p class="mehrzeilig">${esc(e.text)}</p>` : ""}
      <p class="meta"><b>${esc(STUFEN[1].name)}.</b> Selbst eingetragen, von abgeklopft.de nicht geprüft.</p>
      ${(e.bestaetigungen || []).map(bestaetigungHtml).join("")}
      <p class="meta">Links der Person: ${belege || "keine"}</p>
      <div>${(e.faehigkeiten || []).map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
    </div>
  </li>`;
}
