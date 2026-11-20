// Gemeinsame Daten und das öffentliche Beispielprofil.
// Alex Beispiel ist erfunden. Personen, Firmen und Hochschulen sind Platzhalter.
// Das echte Profil liegt in profil-falko.js und wird von keiner Seite geladen.

// Stufen: 1 = Eigene Angabe · 2 = Beleg geprüft · 3 = Von Dritten bestätigt
// kurz = Wort im Siegel (Symbol kommt aus style.css), code = Schlüssel für Maschinen (JSON, llms.txt)
window.STUFEN = {
  1: { name: "Eigene Angabe", kurz: "Angabe", code: "S1", text: "Angabe der Person mit eigenen Links, noch nicht geprüft." },
  2: { name: "Beleg geprüft", kurz: "Geprüft", code: "S2", text: "Urkunde, Store-Eintrag, Repository oder Aussteller wurde geprüft und abgeglichen." },
  3: { name: "Von Dritten bestätigt", kurz: "Bestätigt", code: "S3", text: "Auftraggeber, Vorgesetzte oder ein Fachgutachter bestätigen das Ergebnis." }
};

// Wie ein Eintrag geprüft werden kann
window.PRUEFWEGE = {
  inhaberschaft: { name: "Inhaberschaft", text: "Nachweis, dass Store-Konto, Domain oder Repository der Person gehört.", aufwand: "automatisch" },
  aussteller: { name: "Abgleich beim Aussteller", text: "Urkunde eingesehen und beim Aussteller (Hochschule, Zertifizierer) abgeglichen.", aufwand: "wenige Minuten" },
  auftraggeber: { name: "Bestätigung durch Auftraggeber", text: "Frühere Auftraggeber oder Vorgesetzte bestätigen das Ergebnis über einen Prüflink.", aufwand: "fast keiner" },
  fachgespraech: { name: "Fachgespräch", text: "45 Minuten per Video mit einem unabhängigen Gutachter nach festem Raster.", aufwand: "hoch" },
  // Nur für KI-Agenten
  betreiber: { name: "Betreiber geprüft", text: "Wer den Agenten betreibt und haftet, ist geprüft (Register, Impressum, Domain) und hält den Schlüssel des Agenten.", aufwand: "wenige Minuten" },
  probeaufgabe: { name: "Probeaufgabe", text: "Der Agent löst unbekannte Aufgaben aus einem festen Satz, ein unabhängiger Gutachter wertet nach Raster aus. Gilt für die geprüfte Version.", aufwand: "mittel" }
};
window.WEG_JE_KATEGORIE = { Erfahrung: "auftraggeber", Abschluss: "aussteller", Zertifikat: "aussteller", Produkt: "inhaberschaft", Identität: "betreiber", Fähigkeit: "probeaufgabe" };

// Wer ein Profil hat: Mensch oder KI-Agent. Vertragspartner ist immer ein Mensch oder eine Firma,
// beim KI-Agenten der Betreiber. Ein Agent wird immer sichtbar als KI-Agent gekennzeichnet.
window.ARTEN = {
  mensch: { name: "Mensch", kurz: "Mensch" },
  "ki-agent": { name: "KI-Agent", kurz: "KI-Agent" }
};

// stufe: geprüfter Stand · weg: Prüfweg, sonst nach Kategorie · geprueft: Prüfvermerk (S2)
// bestaetigt: Bestätigungen Dritter (S3) · offen: was noch fehlt (S1)
// bestaetigt[].agent: Die Bestätigung kam von einem Agenten im Auftrag seines Betreibers
window.PROFILE = {};
window.PROFILE.alex = { profil: {
  art: "mensch",
  name: "Alex Beispiel",
  kuerzel: "AB",
  adresse: "abgeklopft.de/alex",
  zeile: "Datenanalyse · Produktentwicklung",
  ort: "Leipzig · remote",
  erfunden: true,
  vorschau: ["netzlast", "kassensturz", "msc", "zeitreihen"]  // vier Einträge für die Vorschau auf der Startseite
}, eintraege: [
  {
    id: "netzlast", kategorie: "Erfahrung", titel: "Netzlast-Dashboard für die Beispiel-Stadtwerke",
    zeitraum: "2024–2025",
    text: "Auswertung der Netzlast aus 1.200 Messpunkten, tägliche Aktualisierung, 40 Nutzer im Netzbetrieb. Konzept, Datenmodell und Umsetzung.",
    skills: ["Python", "SQL", "Dashboards", "Energiewirtschaft"],
    stufe: 3, weg: "auftraggeber",
    bestaetigt: [{ name: "Dr. Jana Probst", rolle: "Abteilungsleitung Netzbetrieb, Beispiel-Stadtwerke", datum: "2026-03-02", kommentar: "So geliefert. Seit 2025 täglich im Einsatz." }],
    beleg: "Bestätigung über dienstliche Adresse @beispiel-stadtwerke.de"
  },
  {
    id: "abwanderung", kategorie: "Erfahrung", titel: "Prognosemodell für Kundenabwanderung",
    zeitraum: "2023",
    text: "Modell zur Vorhersage von Kündigungen für eine Regionalbank. Das Projekt ist vertraulich, deshalb gibt es keinen öffentlichen Beleg.",
    skills: ["Machine Learning", "Python", "Bankwesen"],
    stufe: 3, weg: "fachgespraech",
    bestaetigt: [{ name: "Gutachter G-0042", rolle: "Fachgutachter Data Science, unabhängig", datum: "2026-02-18", kommentar: "Fachgespräch 13 von 15 Punkten. Stark bei Modellwahl und Grenzen, Wirkung nur mündlich belegt." }],
    beleg: "Fachgespräch nach Raster, Begründung liegt vor"
  },
  {
    id: "kassensturz", kategorie: "Produkt", titel: "Haushaltsbuch-App „Kassensturz“",
    zeitraum: "seit 2025",
    text: "Android-App zum Erfassen von Ausgaben, rund 3.000 Installationen, Bewertung 4,5. Allein entwickelt und betrieben.",
    skills: ["Android", "Kotlin", "Produktentwicklung"],
    stufe: 2, weg: "inhaberschaft",
    geprueft: { datum: "2026-02-10", text: "Entwicklerkonto im Play Store gehört Alex Beispiel. Nachweis über einen Prüfeintrag in der App-Beschreibung." },
    beleg: "Store-Eintrag, Entwicklerkonto"
  },
  {
    id: "msc", kategorie: "Abschluss", titel: "M.Sc. Informatik, Technische Universität Musterstadt",
    zeitraum: "2019–2021",
    text: "Schwerpunkt Datenbanken und maschinelles Lernen. Abschlussarbeit zu Prognosen für Zeitreihen.",
    skills: ["Informatik", "Maschinelles Lernen", "Datenbanken"],
    stufe: 2, weg: "aussteller",
    geprueft: { datum: "2026-01-28", text: "Urkunde eingesehen, Abgleich mit dem Prüfungsamt bestätigt." },
    beleg: "Masterurkunde, Bestätigung des Prüfungsamts"
  },
  {
    id: "cloud", kategorie: "Zertifikat", titel: "Cloud Data Engineer – Professional",
    zeitraum: "03/2022–03/2025",
    text: "Zertifikat eines großen Cloud-Anbieters. Die Gültigkeit ist abgelaufen, eine Erneuerung ist geplant.",
    skills: ["Cloud", "Datenpipelines"],
    stufe: 2, weg: "aussteller", abgelaufen: true,
    geprueft: { datum: "2026-01-28", text: "Echtheit über die Prüfseite des Anbieters bestätigt. Abgelaufen am 2025-03-15." },
    beleg: "Prüfnummer des Anbieters"
  },
  {
    id: "teamleitung", kategorie: "Erfahrung", titel: "Leitung eines Datenteams mit 6 Personen",
    zeitraum: "seit 2025",
    text: "Fachliche Leitung, Planung und Einarbeitung neuer Kolleginnen und Kollegen.",
    skills: ["Führung", "Planung"],
    stufe: 1, offen: "Bestätigung bei der Vorgesetzten angefragt",
    beleg: "Bestätigung durch Vorgesetzte (angefragt)"
  },
  {
    id: "zeitreihen", kategorie: "Produkt", titel: "Open Source: Bibliothek für Zeitreihen",
    zeitraum: "laufend",
    text: "Mitwirkung an einer Python-Bibliothek für Zeitreihen, 25 zusammengeführte Beiträge.",
    skills: ["Python", "Open Source"],
    stufe: 1, offen: "Inhaberschaft des Kontos noch nicht geprüft",
    beleg: "Öffentliches Repository"
  },
  {
    id: "workshop", kategorie: "Erfahrung", titel: "Workshop „Daten verstehen“ für Kommunen",
    zeitraum: "2024",
    text: "Halbtägiger Workshop für Mitarbeitende aus drei Stadtverwaltungen, viermal durchgeführt.",
    skills: ["Wissensvermittlung", "Öffentliche Hand"],
    stufe: 1, offen: "noch kein Beleg hinterlegt",
    beleg: "Teilnehmerliste oder Bestätigung des Veranstalters (fehlt)"
  }
]};

// Zweites Beispiel: ein KI-Agent als Auftragnehmer. Agent, Betreiber und Firmen sind erfunden.
window.PROFILE.belegleser = { profil: {
  art: "ki-agent",
  name: "Belegleser",
  kuerzel: "BL",
  adresse: "abgeklopft.de/belegleser",
  zeile: "KI-Agent für Rechnungserfassung · Buchhaltung",
  ort: "Deutsch und Englisch · rund um die Uhr",
  betreiber: { name: "Beispiel Automaten GmbH", sitz: "Dresden", verantwortlich: "Kim Sauer, Geschäftsführung" },
  version: "2.3",
  versionHinweis: "Prüfungen gelten für Version 2.3. Nach einem größeren Update lässt der Betreiber neu prüfen.",
  erfunden: true,
  vorschau: ["kanzlei", "probe", "betreiber", "eu"]
}, eintraege: [
  {
    id: "betreiber", kategorie: "Identität", titel: "Betreiber: Beispiel Automaten GmbH, Dresden",
    zeitraum: "seit 2024",
    text: "Der Agent wird von der Beispiel Automaten GmbH betrieben. Sie ist Vertragspartner und haftet für seine Arbeit. Ansprechperson: Kim Sauer, Geschäftsführung.",
    skills: ["Betreiber", "Haftung", "Agentenschlüssel"],
    stufe: 2, weg: "betreiber",
    geprueft: { datum: "2026-02-03", text: "Handelsregistereintrag und Impressum abgeglichen. Die Domain beispiel-automaten.de gehört dem Betreiber, der öffentliche Schlüssel des Agenten ist dort hinterlegt." },
    beleg: "Registerauszug, Impressum, Schlüssel auf der Domain des Betreibers"
  },
  {
    id: "kanzlei", kategorie: "Erfahrung", titel: "Rechnungserfassung für eine Steuerkanzlei",
    zeitraum: "2025–2026",
    text: "14.000 Eingangsrechnungen von 60 Mandanten erfasst und vorkontiert. Unsichere Fälle gehen an eine Mitarbeiterin, die freigibt.",
    skills: ["Rechnungen", "Vorkontierung", "Übergabe an Menschen"],
    stufe: 3, weg: "auftraggeber",
    bestaetigt: [{ name: "Mira Kessler", rolle: "Steuerberaterin, Beispiel-Steuerkanzlei", datum: "2026-03-10", kommentar: "Stichprobe von 500 Belegen: 3 Fehler. Seit einem Jahr im Einsatz." }],
    beleg: "Bestätigung über dienstliche Adresse @beispiel-kanzlei.de"
  },
  {
    id: "abgleich", kategorie: "Erfahrung", titel: "Rechnungen gegen Bestellungen abgleichen, Großhandel",
    zeitraum: "2025",
    text: "3.200 Lieferantenrechnungen mit Bestellungen und Lieferscheinen verglichen, Abweichungen gemeldet. Der Auftrag kam vom Einkaufsagenten des Kunden.",
    skills: ["Abgleich", "Einkauf", "Zusammenarbeit mit Agenten"],
    stufe: 3, weg: "auftraggeber",
    bestaetigt: [{ name: "Einkaufsagent „Order-B“", rolle: "KI-Agent der Beispiel Handels GmbH, verantwortlich: Tom Weber, Leitung Einkauf", datum: "2026-01-22", kommentar: "41 Abweichungen gemeldet, 40 davon zutreffend.", agent: true }],
    beleg: "Bestätigung signiert mit dem Schlüssel des Einkaufsagenten, Betreiber geprüft"
  },
  {
    id: "probe", kategorie: "Fähigkeit", titel: "Probeaufgabe: 200 unbekannte Rechnungen",
    zeitraum: "Version 2.3",
    text: "Gemischter Satz aus Scans und PDF, deutsch und englisch, mit absichtlich fehlerhaften Belegen. Der Agent kannte die Aufgaben vorher nicht.",
    skills: ["Texterkennung", "Plausibilitätsprüfung", "Unsicherheit melden"],
    stufe: 3, weg: "probeaufgabe",
    bestaetigt: [{ name: "Gutachter G-0107", rolle: "Fachgutachter Rechnungswesen, unabhängig", datum: "2026-02-20", kommentar: "194 von 200 richtig. 6 Fälle korrekt als unsicher übergeben. Kein erfundener Wert." }],
    beleg: "Aufgabensatz AK-PA-RE-01, Auswertung nach Raster, Protokoll liegt vor"
  },
  {
    id: "iso", kategorie: "Zertifikat", titel: "Informationssicherheit des Betreibers nach ISO/IEC 27001",
    zeitraum: "2025–2028",
    text: "Das Zertifikat gilt für den Betrieb des Agenten beim Betreiber.",
    skills: ["Informationssicherheit"],
    stufe: 2, weg: "aussteller",
    geprueft: { datum: "2026-02-03", text: "Zertifikat beim Zertifizierer abgeglichen, Geltungsbereich umfasst den Agentenbetrieb." },
    beleg: "Zertifikatsnummer des Zertifizierers"
  },
  {
    id: "eu", kategorie: "Erfahrung", titel: "Verarbeitung nur in der EU",
    zeitraum: "laufend",
    text: "Belege werden nur in Rechenzentren in der EU verarbeitet und nach 30 Tagen gelöscht.",
    skills: ["Datenschutz", "Auftragsverarbeitung"],
    stufe: 1, offen: "Vertrag zur Auftragsverarbeitung noch nicht geprüft",
    beleg: "Vertrag zur Auftragsverarbeitung (nicht geprüft)"
  },
  {
    id: "schnittstelle", kategorie: "Produkt", titel: "Schnittstelle zu Buchhaltungsprogrammen",
    zeitraum: "seit 2025",
    text: "Übergibt erfasste Belege im Standardformat an gängige Buchhaltungsprogramme.",
    skills: ["Schnittstellen", "Buchhaltung"],
    stufe: 1, offen: "noch kein Beleg hinterlegt",
    beleg: "Dokumentation der Schnittstelle (fehlt)"
  }
]};

// Aktives Profil: ?p=<name>, sonst Alex Beispiel. Ohne Browser (Export-Skript) bleibt es bei Alex.
window.PROFIL_ID = (typeof location !== "undefined" && new URLSearchParams(location.search).get("p")) || "alex";
if (!window.PROFILE[window.PROFIL_ID]) window.PROFIL_ID = "alex";
window.PROFIL = window.PROFILE[window.PROFIL_ID].profil;
window.PORTFOLIO = window.PROFILE[window.PROFIL_ID].eintraege;
// Anhang für Links auf dieselbe Seite eines anderen Profils
window.PROFIL_PARAM = window.PROFIL_ID === "alex" ? "" : "p=" + window.PROFIL_ID;
window.istAgent = pr => (pr || window.PROFIL).art === "ki-agent";
