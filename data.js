// Gemeinsame Daten und das öffentliche Beispielprofil.
// Alex Beispiel ist erfunden. Personen, Firmen und Hochschulen sind Platzhalter.
// Das echte Profil liegt in profil-falko.js und wird von keiner Seite geladen.

// Stufen: 1 = Eigene Angabe · 2 = Beleg geprüft · 3 = Von Dritten bestätigt
// kurz = Wort im Siegel (Symbol kommt aus style.css), code = Schlüssel für Maschinen (JSON, llms.txt)
window.STUFEN = {
  1: { name: "Eigene Angabe", kurz: "Angabe", siegel: "Eingereicht", titel: "Nichts geprüft", code: "S1", text: "Angabe der Person mit eigenen Links, noch nicht geprüft." },
  2: { name: "Beleg geprüft", kurz: "Geprüft", siegel: "Geprüft", titel: "Beleg geprüft", code: "S2", text: "Urkunde, Store-Eintrag, Repository oder Aussteller wurde geprüft und abgeglichen." },
  3: { name: "Von Dritten bestätigt", kurz: "Bestätigt", siegel: "Abgenommen", titel: "Vom Auftraggeber bestätigt", code: "S3", text: "Auftraggeber, Vorgesetzte oder ein Fachgutachter bestätigen das Ergebnis." }
};

// Wie ein Eintrag geprüft werden kann
window.PRUEFWEGE = {
  inhaberschaft: { name: "Inhaberschaft", text: "Nachweis, dass Store-Konto, Domain oder Repository der Person gehört.", aufwand: "automatisch" },
  aussteller: { name: "Abgleich beim Aussteller", text: "Urkunde eingesehen und beim Aussteller (Hochschule, Zertifizierer) abgeglichen.", aufwand: "wenige Minuten" },
  auftraggeber: { name: "Bestätigung durch Auftraggeber", text: "Frühere Auftraggeber oder Vorgesetzte bestätigen das Ergebnis über einen Prüflink.", aufwand: "fast keiner" },
  fachgespraech: { name: "Fachgespräch", text: "45 Minuten per Video mit einem unabhängigen Gutachter nach festem Raster.", aufwand: "hoch" },
  // Nur für KI-Agenten
  betreiber: { name: "Betreiber geprüft", text: "Wer den Agenten betreibt und haftet, ist geprüft (Register, Impressum, Domain) und hält den Schlüssel des Agenten.", aufwand: "wenige Minuten" },
  probeaufgabe: { name: "Probeaufgabe", text: "Der Agent löst unbekannte Aufgaben aus einem festen Satz, ein unabhängiger Gutachter wertet nach Raster aus. Gilt für die geprüfte Version.", aufwand: "mittel" },
  // Nur für Skill-Sätze (Kategorie Skill-Satz, KI-Agenten): Bericht Version 4, gilt nur für den geprüften Hash
  referenzlauf: { name: "Referenzlauf mit Auswertung durch den Prüfer", text: "Der Prüfer lässt die Referenzfälle mit dem gemeldeten Skill-Satz laufen und wertet das Ergebnis aus. Das Siegel gilt nur für genau diesen Skill-Satz (Hash) und diese Referenzfälle.", aufwand: "hoch" },
  referenzlauf_abnahme: { name: "Referenzlauf mit Abnahme", text: "Wie der Referenzlauf, zusätzlich bestätigt ein Abnehmer den Skill-Satz mit seinem Hash (mindestens 59 geheime Fälle).", aufwand: "hoch" },
  // Nur für Prozesse (Kategorie Prozess und Teile vom Typ prozess)
  prozess_dokumentation: { name: "Verfahrensdokument gegen Beobachtung", text: "Das Verfahrensdokument wird gegen die tatsächliche Arbeitsweise im Beobachtungszeitraum abgeglichen.", aufwand: "mittel" },
  prozess_stichprobe: { name: "Stichprobe aus Prozessprotokollen", text: "Ein Prüfer zieht eine Stichprobe aus Protokollen und Vorgängen und gleicht sie mit dem Verfahrensdokument ab.", aufwand: "mittel" },
  prozess_bestaetigung: { name: "Bestätigung durch Prozessverantwortliche", text: "Prozessverantwortliche oder Abnehmer des Ergebnisses bestätigen die Anwendung, der Prüfer sichtet das Verfahren.", aufwand: "gering" }
};
window.WEG_JE_KATEGORIE = { Erfahrung: "auftraggeber", Abschluss: "aussteller", Zertifikat: "aussteller", Produkt: "inhaberschaft", Dienstleistung: "auftraggeber", Identität: "betreiber", Fähigkeit: "probeaufgabe", Projekt: "inhaberschaft", Prozess: "prozess_dokumentation", "Skill-Satz": "referenzlauf" };

// Wer ein Profil hat: Person oder KI-Agent. Vertragspartner ist immer eine Person oder eine Firma,
// beim KI-Agenten der Betreiber. Ein Agent wird immer sichtbar als KI-Agent gekennzeichnet.
window.ARTEN = {
  mensch: { name: "Person", kurz: "Person" },
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
    pruefobjekt: {"gegenstand": "Das Netzlast-Dashboard der Beispiel-Stadtwerke (Projekt 2024–2025), wie im Profil beschrieben", "version_stand": "Angaben im Profil, Bestätigung vom 2026-03-02", "umfang_geprueft": ["Antwort von Dr. Jana Probst (Abteilungsleitung Netzbetrieb, Beispiel-Stadtwerke) über die dienstliche Adresse: Name, Rolle und Firma stimmen mit der Absenderadresse überein"], "nicht_geprueft": ["Eigene Prüfung des Ergebnisses durch abgeklopft.de", "Fachliche Richtigkeit des Ergebnisses", "Eigenanteil von Alex Beispiel im Einzelnen"], "methode": "Bestätigungsanfrage per Prüflink an die Auftraggeberin, Antwort dem Eintrag zugeordnet; keine eigene Abnahme des Dashboards"},
    zeitraum: "2024–2025",
    text: "Auswertung der Netzlast aus 1.200 Messpunkten, tägliche Aktualisierung, 40 Nutzer im Netzbetrieb. Konzept, Datenmodell und Umsetzung.",
    skills: ["Python", "SQL", "Dashboards", "Energiewirtschaft"],
    stufe: 3, weg: "auftraggeber",
    bestaetigt: [{ name: "Dr. Jana Probst", rolle: "Abteilungsleitung Netzbetrieb, Beispiel-Stadtwerke", datum: "2026-03-02", kommentar: "So geliefert. Seit 2025 täglich im Einsatz." }],
    beleg: "Bestätigung über dienstliche Adresse @beispiel-stadtwerke.de"
  },
  {
    id: "abwanderung", kategorie: "Erfahrung", titel: "Prognosemodell für Kundenabwanderung",
    pruefobjekt: {"gegenstand": "Prognosemodell für Kundenabwanderung einer Regionalbank (vertrauliches Projekt, 2023)", "version_stand": "Fachgespräch vom 2026-02-18", "umfang_geprueft": ["Fachgespräch (45 Minuten, Video) zu Modellwahl, Validierung und Grenzen nach festem Raster: 13 von 15 Punkten"], "nicht_geprueft": ["Das Modell selbst und die Daten (vertraulich, nicht eingesehen)", "Wirkung im Einsatz (nur mündlich belegt)"], "methode": "Fachgespräch mit unabhängigem Gutachter G-0042 nach Raster, Begründung liegt vor"},
    zeitraum: "2023",
    text: "Modell zur Vorhersage von Kündigungen für eine Regionalbank. Das Projekt ist vertraulich, deshalb gibt es keinen öffentlichen Beleg.",
    skills: ["Machine Learning", "Python", "Bankwesen"],
    stufe: 3, weg: "fachgespraech",
    bestaetigt: [{ name: "Gutachter G-0042", rolle: "Fachgutachter Data Science, unabhängig", datum: "2026-02-18", kommentar: "Fachgespräch 13 von 15 Punkten. Stark bei Modellwahl und Grenzen, Wirkung nur mündlich belegt." }],
    beleg: "Fachgespräch nach Raster, Begründung liegt vor"
  },
  {
    id: "kassensturz", kategorie: "Produkt", titel: "Haushaltsbuch-App „Kassensturz“",
    pruefobjekt: {"gegenstand": "Haushaltsbuch-App „Kassensturz“: Entwicklerkonto und Store-Eintrag im Play Store", "version_stand": "Store-Eintrag, Stand 2026-02-10", "umfang_geprueft": ["Inhaberschaft: Das Entwicklerkonto gehört Alex Beispiel (Prüfeintrag in der App-Beschreibung)"], "nicht_geprueft": ["Qualität", "Funktion und Sicherheit der App", "Installationszahl und Bewertung"], "methode": "Abgleich des Entwicklerkontos mit einem Prüfeintrag in der App-Beschreibung"},
    zeitraum: "seit 2025",
    text: "Android-App zum Erfassen von Ausgaben, rund 3.000 Installationen, Bewertung 4,5. Allein entwickelt und betrieben.",
    skills: ["Android", "Kotlin", "Produktentwicklung"],
    stufe: 2, weg: "inhaberschaft",
    geprueft: { datum: "2026-02-10", text: "Entwicklerkonto im Play Store gehört Alex Beispiel. Nachweis über einen Prüfeintrag in der App-Beschreibung." },
    beleg: "Store-Eintrag, Entwicklerkonto"
  },
  {
    id: "msc", kategorie: "Abschluss", titel: "M.Sc. Informatik, Technische Universität Musterstadt",
    pruefobjekt: {"gegenstand": "Masterurkunde M.Sc. Informatik, Universität Musterstadt (2021)", "version_stand": "Urkunde und Auskunft des Prüfungsamts, Stand 2026-01-28", "umfang_geprueft": ["Echtheit und Inhalt der Urkunde (Name, Abschluss, Datum) beim Prüfungsamt abgeglichen"], "nicht_geprueft": ["Fachliche Leistung hinter dem Abschluss", "Inhalt der Abschlussarbeit"], "methode": "Urkunde eingesehen, Rückfrage beim Prüfungsamt"},
    zeitraum: "2019–2021",
    text: "Schwerpunkt Datenbanken und maschinelles Lernen. Abschlussarbeit zu Prognosen für Zeitreihen.",
    skills: ["Informatik", "Maschinelles Lernen", "Datenbanken"],
    stufe: 2, weg: "aussteller",
    geprueft: { datum: "2026-01-28", text: "Urkunde eingesehen, Abgleich mit dem Prüfungsamt bestätigt." },
    beleg: "Masterurkunde, Bestätigung des Prüfungsamts"
  },
  {
    id: "cloud", kategorie: "Zertifikat", titel: "Cloud Data Engineer – Professional",
    pruefobjekt: {"gegenstand": "Zertifikat „Cloud Data Engineer – Professional“ eines Cloud-Anbieters (2022–2025)", "version_stand": "Prüfseite des Anbieters, Stand 2026-01-28", "umfang_geprueft": ["Echtheit des Zertifikats über die Prüfseite des Anbieters; abgelaufen am 2025-03-15"], "nicht_geprueft": ["Fachliche Leistung hinter dem Abschluss", "Fachliche Kenntnisse nach Ablauf des Zertifikats"], "methode": "Abgleich der Prüfnummer auf der Prüfseite des Anbieters"},
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
  },
  {
    id: "verbrauchsportal",
    kategorie: "Projekt",
    titel: "Verbrauchsportal für Kundinnen und Kunden der Beispiel-Stadtwerke",
    zeitraum: "2025",
    text: "Webportal, in dem Haushalte ihren Strom- und Wärmeverbrauch sehen und eine Prognose erhalten. Vier Teilergebnisse: Datenmodell, Auswertung, Oberfläche und Einführung im Kundenservice.",
    skills: ["Python", "Webentwicklung", "Prognosen"],
    stufe: 2,
    weg: "inhaberschaft",
    beleg: "Repository, Bestätigung der Leitung Kundenservice",
    teile: [
      {"id": "datenmodell", "titel": "Datenmodell und Datenimport", "typ": "produkt", "pflicht": true, "zeitraum": {"von": "2025-01", "bis": "2025-03"}, "ort": "Leipzig, remote", "stufe": 2, "weg": "inhaberschaft", "beleg": "Repository verbrauchsportal-daten", "geprueft": {"datum": "2026-02-24", "text": "Repository gehört Alex Beispiel (Prüfeintrag in der README)."}, "pruefobjekt": {"gegenstand": "Repository „verbrauchsportal-daten“ (Datenmodell und Importskripte)", "version_stand": "Hauptzweig, Stand 2026-02-24", "umfang_geprueft": ["Inhaberschaft: Das Repository gehört Alex Beispiel (Prüfeintrag in der README)"], "nicht_geprueft": ["Qualität", "Funktion des Imports", "Sicherheit der Daten"], "methode": "Abgleich des Repository-Kontos mit einem Prüfeintrag"}},
      {"id": "auswertung", "titel": "Auswertungsmodul (Verbrauchsprognose)", "typ": "produkt", "pflicht": true, "zeitraum": {"von": "2025-03", "bis": "2025-06"}, "abhaengig_von": [{"teil": "datenmodell", "beziehung": "logisch", "art": "setzt_voraus"}, {"teil": "datenmodell", "beziehung": "zeitlich", "art": "nach_ende"}], "stufe": 2, "weg": "inhaberschaft", "beleg": "Repository verbrauchsportal-auswertung", "geprueft": {"datum": "2026-02-24", "text": "Repository gehört Alex Beispiel (Prüfeintrag in der README)."}, "pruefobjekt": {"gegenstand": "Repository „verbrauchsportal-auswertung“ (Prognosemodul)", "version_stand": "Hauptzweig, Stand 2026-02-24", "umfang_geprueft": ["Inhaberschaft: Das Repository gehört Alex Beispiel (Prüfeintrag in der README)"], "nicht_geprueft": ["Qualität", "Genauigkeit der Prognose"], "methode": "Abgleich des Repository-Kontos mit einem Prüfeintrag"}},
      {"id": "oberflaeche", "titel": "Kundenoberfläche (Web)", "typ": "produkt", "pflicht": true, "zeitraum": {"von": "2025-05", "bis": "2025-09"}, "abhaengig_von": [{"teil": "auswertung", "beziehung": "logisch", "art": "nutzt"}, {"teil": "auswertung", "beziehung": "zeitlich", "art": "gleichzeitig", "hinweis": "ab Juli mit fertigem Modul"}], "stufe": 3, "weg": "auftraggeber", "beleg": "Bestätigung über dienstliche Adresse @beispiel-stadtwerke.de", "bestaetigt": [{"name": "Sven Albrecht", "rolle": "Leitung Kundenservice, Beispiel-Stadtwerke", "datum": "2026-03-18", "kommentar": "Portal seit September im Einsatz, wird von den Kundenberaterinnen genutzt."}], "pruefobjekt": {"gegenstand": "Die Kundenoberfläche des Verbrauchsportals der Beispiel-Stadtwerke", "version_stand": "Angaben im Profil, Bestätigung vom 2026-03-18", "umfang_geprueft": ["Antwort von Sven Albrecht (Leitung Kundenservice, Beispiel-Stadtwerke) über die dienstliche Adresse: Name, Rolle und Firma stimmen überein"], "nicht_geprueft": ["Eigene Prüfung des Ergebnisses durch abgeklopft.de", "Fachliche Richtigkeit und Nutzbarkeit der Oberfläche"], "methode": "Bestätigungsanfrage per Prüflink an den Auftraggeber, Antwort dem Teil zugeordnet"}},
      {"id": "betrieb", "titel": "Einführung im Kundenservice", "typ": "prozess", "pflicht": false, "zeitraum": {"von": "2025-09", "bis": "2025-12"}, "ort": "Kundenservice der Beispiel-Stadtwerke", "abhaengig_von": [{"teil": "oberflaeche", "beziehung": "logisch", "art": "setzt_voraus"}, {"teil": "oberflaeche", "beziehung": "raeumlich", "art": "anderer_ort", "hinweis": "gebaut remote, eingesetzt im Kundenservice"}], "stufe": 1, "offen": "Einführung noch nicht geprüft", "beleg": "Einführungsprotokoll (nicht geprüft)"}
    ]
  },
  {
    id: "freigabe",
    kategorie: "Prozess",
    titel: "Rechnungsfreigabe im Vier-Augen-Verfahren, Beispiel-Stadtwerke",
    zeitraum: "2025-01 bis 2025-12",
    text: "Eingangsrechnungen werden erfasst, fachlich geprüft, von einer zweiten Person freigegeben und gebucht. Alex Beispiel hat das Verfahren aufgebaut und dokumentiert.",
    skills: ["Prozessgestaltung", "Dokumentation", "Rechnungswesen"],
    stufe: 2,
    weg: "prozess_stichprobe",
    geprueft: {"datum": "2026-03-05", "text": "Stichprobe aus den Workflow-Protokollen 2025 mit dem Verfahrensdokument abgeglichen."},
    beleg: "Verfahrensdokument v3.1, Workflow-Protokolle 2025",
    prozess: {"ziel": "Keine Rechnung wird ohne zwei unabhängige Prüfungen bezahlt.", "ausloeser": "Rechnung geht im Posteingang oder als E-Rechnung ein.", "ergebnis": "Gebuchte, freigegebene Rechnung mit Prüfvermerk.", "rollen": ["Erfassung", "Fachliche Prüfung", "Freigabe (Budgetverantwortung)", "Buchhaltung"], "kennzahlen": [{"name": "Durchlaufzeit", "wert": 4.2, "einheit": "Tage (Median)", "zeitraum": "2025", "quelle": "Workflow-Protokoll"}, {"name": "Rechnungen im Jahr", "wert": 1840, "einheit": "Stück", "zeitraum": "2025", "quelle": "Workflow-Protokoll"}], "nachweisart": ["dokumentation", "protokolle"]},
    pruefobjekt: {"gegenstand": "Das Verfahren „Rechnungsfreigabe“ der Beispiel-Stadtwerke, wie im Dokument v3.1 beschrieben und in den Workflow-Protokollen 2025 angewendet", "version_stand": "Verfahrensdokument v3.1 vom 2025-01-15; Protokolle bis 2025-12-31", "umfang_geprueft": ["Beobachtungszeitraum: 2025-01 bis 2025-12", "Einhaltung der zwei Prüfschritte durch zwei verschiedene Personen", "Reihenfolge der Schritte", "Stichprobe: 60 von 1840 Vorgängen (zufällig gezogen)"], "nicht_geprueft": ["Qualität und Wirksamkeit des Prozesses", "Sachliche Richtigkeit der einzelnen Rechnungen", "Zahlungsfreigaben ab 50.000 € (anderer Prozess)", "IT-Sicherheit des Workflow-Systems"], "methode": "Stichprobe aus Protokollen, Abgleich mit dem Verfahrensdokument, kein Vor-Ort-Audit"}
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
    pruefobjekt: {"gegenstand": "Betreiber des Agenten Belegleser: Beispiel Automaten GmbH, Dresden", "version_stand": "Agent Version 2.3, Registerstand 2026-02-03", "umfang_geprueft": ["Handelsregistereintrag und Impressum der Beispiel Automaten GmbH abgeglichen", "Domain beispiel-automaten.de gehört dem Betreiber, der öffentliche Schlüssel des Agenten ist dort hinterlegt"], "nicht_geprueft": ["Verhalten des Agenten im Einsatz", "Eingesetztes Modell und seine Eigenschaften"], "methode": "Abgleich mit Handelsregister, Impressum und Domain des Betreibers"},
    zeitraum: "seit 2024",
    text: "Der Agent wird von der Beispiel Automaten GmbH betrieben. Sie ist Vertragspartner und haftet für seine Arbeit. Ansprechperson: Kim Sauer, Geschäftsführung.",
    skills: ["Betreiber", "Haftung", "Agentenschlüssel"],
    stufe: 2, weg: "betreiber",
    geprueft: { datum: "2026-02-03", text: "Handelsregistereintrag und Impressum abgeglichen. Die Domain beispiel-automaten.de gehört dem Betreiber, der öffentliche Schlüssel des Agenten ist dort hinterlegt." },
    beleg: "Registerauszug, Impressum, Schlüssel auf der Domain des Betreibers"
  },
  {
    id: "kanzlei", kategorie: "Erfahrung", titel: "Rechnungserfassung für eine Steuerkanzlei",
    pruefobjekt: {"gegenstand": "Rechnungserfassung des Agenten Belegleser für eine Steuerkanzlei (2025–2026)", "version_stand": "Agent Version 2.3, Bestätigung vom 2026-03-10", "umfang_geprueft": ["Antwort von Mira Kessler (Steuerberaterin, Beispiel-Steuerkanzlei) über die dienstliche Adresse: Name, Rolle und Firma stimmen überein"], "nicht_geprueft": ["Eigene Prüfung des Ergebnisses durch abgeklopft.de", "Die Stichprobe von 500 Belegen (Angabe der Auftraggeberin, nicht nachgerechnet)"], "methode": "Bestätigungsanfrage per Prüflink an die Auftraggeberin, Antwort dem Eintrag zugeordnet"},
    zeitraum: "2025–2026",
    text: "14.000 Eingangsrechnungen von 60 Mandanten erfasst und vorkontiert. Unsichere Fälle gehen an eine Mitarbeiterin, die freigibt.",
    skills: ["Rechnungen", "Vorkontierung", "Übergabe an Personen"],
    stufe: 3, weg: "auftraggeber",
    bestaetigt: [{ name: "Mira Kessler", rolle: "Steuerberaterin, Beispiel-Steuerkanzlei", datum: "2026-03-10", kommentar: "Stichprobe von 500 Belegen: 3 Fehler. Seit einem Jahr im Einsatz." }],
    beleg: "Bestätigung über dienstliche Adresse @beispiel-kanzlei.de"
  },
  {
    id: "abgleich", kategorie: "Erfahrung", titel: "Rechnungen gegen Bestellungen abgleichen, Großhandel",
    pruefobjekt: {"gegenstand": "Abgleich von Rechnungen mit Bestellungen im Großhandel durch den Agenten Belegleser (2025)", "version_stand": "Agent Version 2.3, Bestätigung vom 2026-01-22", "umfang_geprueft": ["Antwort des Einkaufsagenten „Order-B“ der Beispiel Handels GmbH, signiert mit dessen Schlüssel; Betreiber des Einkaufsagenten gehört zu den geprüften Angaben"], "nicht_geprueft": ["Eigene Prüfung des Ergebnisses durch abgeklopft.de", "Die gemeldeten 41 Abweichungen im Einzelnen (Angabe des Einkaufsagenten)"], "methode": "Bestätigungsanfrage an den Einkaufsagenten, Antwort mit Signatur und verantwortlicher Person gesichtet"},
    zeitraum: "2025",
    text: "3.200 Lieferantenrechnungen mit Bestellungen und Lieferscheinen verglichen, Abweichungen gemeldet. Der Auftrag kam vom Einkaufsagenten des Kunden.",
    skills: ["Abgleich", "Einkauf", "Zusammenarbeit mit Agenten"],
    stufe: 3, weg: "auftraggeber",
    bestaetigt: [{ name: "Einkaufsagent „Order-B“", rolle: "KI-Agent der Beispiel Handels GmbH, verantwortlich: Tom Weber, Leitung Einkauf", datum: "2026-01-22", kommentar: "41 Abweichungen gemeldet, 40 davon zutreffend.", agent: true }],
    beleg: "Bestätigung signiert mit dem Schlüssel des Einkaufsagenten, Betreiber geprüft"
  },
  {
    id: "probe", kategorie: "Fähigkeit", titel: "Probeaufgabe: 200 unbekannte Rechnungen",
    pruefobjekt: {"gegenstand": "Probeaufgabe „200 unbekannte Rechnungen“ (Aufgabensatz AK-PA-RE-01) für den Agenten Belegleser", "version_stand": "Agent Version 2.3, Auswertung vom 2026-02-20", "umfang_geprueft": ["194 von 200 Rechnungen richtig bearbeitet, 6 Fälle korrekt als unsicher übergeben, kein erfundener Wert"], "nicht_geprueft": ["Verhalten bei anderen Aufgaben als dem Aufgabensatz", "Verhalten in anderen Versionen des Agenten"], "methode": "Feste Aufgaben, die der Agent vorher nicht kannte, Auswertung nach Raster durch Gutachter G-0107"},
    zeitraum: "Version 2.3",
    text: "Gemischter Satz aus Scans und PDF, deutsch und englisch, mit absichtlich fehlerhaften Belegen. Der Agent kannte die Aufgaben vorher nicht.",
    skills: ["Texterkennung", "Plausibilitätsprüfung", "Unsicherheit melden"],
    stufe: 3, weg: "probeaufgabe",
    bestaetigt: [{ name: "Gutachter G-0107", rolle: "Fachgutachter Rechnungswesen, unabhängig", datum: "2026-02-20", kommentar: "194 von 200 richtig. 6 Fälle korrekt als unsicher übergeben. Kein erfundener Wert." }],
    beleg: "Aufgabensatz AK-PA-RE-01, Auswertung nach Raster, Protokoll liegt vor"
  },
  {
    id: "iso", kategorie: "Zertifikat", titel: "Informationssicherheit des Betreibers nach ISO/IEC 27001",
    pruefobjekt: {"gegenstand": "ISO/IEC-27001-Zertifikat des Betreibers, Geltungsbereich Agentenbetrieb (2025–2028)", "version_stand": "Zertifizierer-Auskunft, Stand 2026-02-03", "umfang_geprueft": ["Zertifikat beim Zertifizierer abgeglichen; der Geltungsbereich umfasst den Betrieb des Agenten"], "nicht_geprueft": ["Fachliche Leistung hinter dem Abschluss", "Wirksamkeit der Sicherheitsmaßnahmen im Alltag"], "methode": "Abgleich der Zertifikatsnummer beim Zertifizierer"},
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
