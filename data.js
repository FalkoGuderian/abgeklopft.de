// Gemeinsame Daten und das öffentliche Beispielprofil.
// Alex Beispiel ist erfunden. Personen, Firmen und Hochschulen sind Platzhalter.
// Das echte Profil liegt in profil-falko.js und wird von keiner Seite geladen.

// Stufen: 1 = Eigene Angabe · 2 = Beleg geprüft · 3 = Von Dritten bestätigt
window.STUFEN = {
  1: { name: "Eigene Angabe", kurz: "S1", text: "Angabe der Person mit eigenen Links, noch nicht geprüft." },
  2: { name: "Beleg geprüft", kurz: "S2", text: "Urkunde, Store-Eintrag, Repository oder Aussteller wurde geprüft und abgeglichen." },
  3: { name: "Von Dritten bestätigt", kurz: "S3", text: "Auftraggeber, Vorgesetzte oder ein Fachgutachter bestätigen das Ergebnis." }
};

// Wie ein Eintrag geprüft werden kann
window.PRUEFWEGE = {
  inhaberschaft: { name: "Inhaberschaft", text: "Nachweis, dass Store-Konto, Domain oder Repository der Person gehört.", aufwand: "automatisch" },
  aussteller: { name: "Abgleich beim Aussteller", text: "Urkunde eingesehen und beim Aussteller (Hochschule, Zertifizierer) abgeglichen.", aufwand: "wenige Minuten" },
  auftraggeber: { name: "Bestätigung durch Auftraggeber", text: "Frühere Auftraggeber oder Vorgesetzte bestätigen das Ergebnis über einen Prüflink.", aufwand: "fast keiner" },
  fachgespraech: { name: "Fachgespräch", text: "45 Minuten per Video mit einem unabhängigen Gutachter nach festem Raster.", aufwand: "hoch" }
};
window.WEG_JE_KATEGORIE = { Erfahrung: "auftraggeber", Abschluss: "aussteller", Zertifikat: "aussteller", Produkt: "inhaberschaft" };

window.PROFIL = {
  name: "Alex Beispiel",
  kuerzel: "AB",
  adresse: "abgeklopft.de/alex",
  zeile: "Datenanalyse · Produktentwicklung",
  ort: "Leipzig · remote",
  erfunden: true
};

// stufe: geprüfter Stand · weg: Prüfweg, sonst nach Kategorie · geprueft: Prüfvermerk (S2)
// bestaetigt: Bestätigungen Dritter (S3) · offen: was noch fehlt (S1)
window.PORTFOLIO = [
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
];
