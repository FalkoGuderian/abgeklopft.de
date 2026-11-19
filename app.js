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
    const v = lesen(VERTRAUT_KEY).find(k => k.kid === sig.kid && kanonisch(k.pub) === kanonisch(sig.pub));
    return v ? { status: "vertraut", name: v.name, kid: v.kid } : { status: "fremd", kid: sig.kid };
  } catch { return { status: "falsch" }; }
}

// Wirksame Stufe: Eine Zusage des Auftraggebers hebt den Eintrag auf S3
function bestaetigungenZu(id) { return lesen(BEST_KEY).filter(b => b.eintrag === id && b.status === "ja"); }
function stufeVon(p) { return bestaetigungenZu(p.id).length ? 3 : p.stufe; }

function eintragHtml(p, i) {
  const st = stufeVon(p), weg = PRUEFWEGE[p.weg || WEG_JE_KATEGORIE[p.kategorie]] || PRUEFWEGE.fachgespraech;
  const best = [...(p.bestaetigt || []).map(b => ({ antwortName: b.name, antwortRolle: b.rolle, antwortDatum: b.datum, kommentar: b.kommentar })),
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
      ${best.map(b => `<p class="meta">Bestätigt von ${esc(b.antwortName)} (${esc(b.antwortRolle)}) am ${esc(b.antwortDatum)}${b.kommentar ? ": „" + esc(b.kommentar) + "“" : ""}</p>`).join("")}
      <p class="meta">${st === 1 ? "Möglicher Prüfweg" : "Prüfweg"}: ${esc(weg.name)}. Beleg: ${esc(p.beleg)}</p>
      <div>${p.skills.map(s => `<span class="tag">${esc(s)}</span>`).join("")}</div>
    </div>
  </li>`;
}
function profilZeigen(ziel, eintraege, beimOeffnen) {
  const el = document.getElementById(ziel);
  if (!el) return;
  el.innerHTML = `<ul class="lt-liste">${eintraege.map(eintragHtml).join("")}</ul>`;
  el.addEventListener("click", e => {
    const b = e.target.closest(".lt-btn"); if (!b) return;
    const d = document.getElementById(b.getAttribute("aria-controls"));
    const auf = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", auf); d.hidden = !auf;
    if (auf && beimOeffnen) beimOeffnen(b.dataset.id);
  });
}
