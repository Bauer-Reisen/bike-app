# Fitness-App – Bauplan Version 1

Bezug: [ANFORDERUNGEN.md](ANFORDERUNGEN.md). Bauweise wie die Bike-App: reine Web-App, ES-Module, IndexedDB, Service Worker „Netz zuerst“, Prüfskripte unter `tools/*.mjs` mit node. Rechenlogik ohne Bildschirm-Code, damit sie mit node prüfbar ist.

Jeder Abschnitt endet mit einem Test, der ohne die späteren Abschnitte funktioniert. Erst weiter, wenn der Test besteht.

---

## Abschnitt 1 – Grundgerüst und Installation
- Repository, GitHub Pages, `index.html`, `manifest.webmanifest` (`display: standalone`, eigene `id`/`scope`), Icons, `sw.js` mit Cache-Präfix `fitness-app-`, `version.json`.
- `js/db.js` aus der Bike-App übernehmen, Datenbankname `fitness-app`, alle Speicher aus dem Datenmodell anlegen.
- Leiste unten: Heute · Training · Essen · Körper · Mehr.
- `tools/check-privat.mjs` (vor jedem Push), `tools/check-sw.mjs` (jede Datei aus `js/` und `daten/` steht in der Cache-Liste), `tools/server.mjs`.

**Test:** Am iPhone zum Home-Bildschirm hinzufügen, öffnen, Flugmodus an, erneut öffnen → App startet. `check-sw` und `check-privat` grün.

## Abschnitt 2 – Backup
- Export als JSON über das Teilen-Menü, Import ersetzt nach Rückfrage, Prüfung von `app` und `format`.
- Backup-Erinnerung (über 14 Tage und neue Einträge).
- Einstiegshinweis „nur vom Home-Bildschirm nutzen“.

**Test:** `tools/check-backup.mjs`: erfundene Daten → Export → Import → identisch. Am iPhone: Datei in „Dateien“ sichern und wieder laden.

## Abschnitt 3 – Profil und Körperdaten
- Profil-Formular; Gewicht und Taille eintragen, optionale weitere Umfänge; Verlauf als einfache Linie mit 7-Tage-Mittel.
- Messanleitungen als kurzer Text.
- Beschwerden/Unverträglichkeiten: Freitext, Datum, aktiv/erledigt.
- `js/koerper.js` (Mittelwert, Alter aus Geburtsdatum) ohne Bildschirm-Code.

**Test:** `tools/check-koerper.mjs`: 7-Tage-Mittel mit Lücken, „zu wenig Daten“ bei unter 4 Werten, Alter am Geburtstag.

## Abschnitt 4 – Gerätekatalog
- `daten/geraete.js` mit 30 Vorlagen und Übungen (aus `grundlagen/C.md`), Prioritätslisten je Muster.
- Abhaken „vorhanden“, Stufenliste je Gerät einstellen, eigenes Gerät anlegen, „wie Gerät X“, Einstellungen (Sitzhöhe …).

**Test:** `tools/check-katalog.mjs`: jede Übung hat ein Gerät, keine doppelten ids, keine freien Gewichte, jedes Muster hat mindestens eine Übung, Stufenliste sortiert. Am iPhone: eigenes Gerät in unter 30 s anlegen.

## Abschnitt 5 – Vorschlagslogik
- `js/vorschlag.js`: Plan aus dem Katalog bilden; Vorgabe je Übung (Stufe, Sätze, Ziel-Wdh.) aus Stand, Pausentagen, Abstand, Muskelkater; Folgesatz-Regel; Auswertung nach dem Training mit Begründungstext.
- Alle Regeln aus Anforderungen Abschnitt 1a, Schwellen gesammelt in einer Datei `js/regeln.js`.

**Test:** `tools/check-vorschlag.mjs` mit erfundenen Verläufen, mindestens: 2× erfüllt → +1 Stufe; 1× easy → kein Sprung; 2× verfehlt → −1 Stufe; großer Sprung → Obergrenze 15; Pausen 7/8/15/29 Tage; Muskelkater stark in Beinen; Abzüge stapeln sich nicht unter 1 Satz; „nicht bewertet“ zählt nicht.

## Abschnitt 6 – Training im Studio
- Heute-Bildschirm mit Startknopf; Ablauf Aufwärmen → Übung → Satz → Pause → Abschluss.
- 4 Feedback-Knöpfe in der Daumenzone (mind. 60 px hoch), Plus/Minus statt Tastatur, Rückgängig.
- Pausentimer über Endzeit, Wake Lock mit Neuanforderung nach Rückkehr.
- Sofortiges Speichern je Satz, „Fortsetzen?“, Abbruch nach 4 h.
- „später“, „tut weh“, Anzeige aktiver Beschwerden, Abschluss mit Änderungsliste.

**Test:** Einmal komplett im Studio trainieren. Prüfpunkte: normaler Satz = 1 Tipp; App mitten im Training wegwischen → Fortsetzen klappt ohne Verlust; Bildschirm 2 Min. aus → Timer zeigt richtige Restzeit; offline ohne Fehler.

## Abschnitt 7 – Nachträgliches Feedback
- Muskelkater-Karte 12–72 h nach dem Training, Muskelgruppen, „Schmerz“-Weg, Einstellung an/aus.

**Test:** Mit verstellter Gerätezeit bzw. erfundenem Trainingsdatum: Karte erscheint bei 13 h, nicht bei 11 h und 73 h, nur einmal; „stark Beine“ ändert den nächsten Vorschlag sichtbar (deckt sich mit check-vorschlag).

## Abschnitt 8 – Bedarf
- `js/bedarf.js`: Grundumsatz, Pausentag, Trainingstag-Zuschlag, Ziele, Rundung, Untergrenzen; Schalter „heute trainiere ich noch“.
- Seite „Wie wird gerechnet?“.

**Test:** `tools/check-bedarf.mjs`: Beispielpersonen gegen von Hand gerechnete Werte; Trainingstag > Pausentag; Eiweiß gleich; nie unter Grundumsatz.

## Abschnitt 9 – Essen erfassen
- „+ Shake“ mit eingestellter Portion; Schnelleingabe kcal/Eiweiß; Zuletzt/Favoriten; Grundliste `daten/lebensmittel.js`; 10–15 Mahlzeitvorschläge nach Restbedarf sortiert.
- Tagesbalken Eiweiß/kcal auf Heute und Essen.

**Test:** Shake in 1 Tipp, eine Mahlzeit aus „Zuletzt“ in unter 10 s; Vorschläge ändern sich mit dem Restbedarf; alles offline.

## Abschnitt 10 – Supplements
- `daten/supplemente.js` mit Prüfliste, Mangel-Block und Ausschlussliste aus Anforderungen Abschnitt 3; Markieren „nehme ich“.

**Test:** `tools/check-quellen.mjs`: jeder Prüflisten-Eintrag hat Nutzen, Dosis, Risiken, Ausschlussgründe, mindestens eine Quelle und ein Stand-Datum; jeder Ausschluss-Eintrag hat eine Begründung.

## Abschnitt 11 – Abnahme Version 1
- Zwei Wochen echter Gebrauch. Danach: Schwellen in `js/regeln.js` nachstellen, Punkte aus „Später“ priorisieren.

**Test:** Alle `tools/check-*.mjs` grün; Backup vom iPhone auf einem frisch installierten Stand eingespielt → alles da.
