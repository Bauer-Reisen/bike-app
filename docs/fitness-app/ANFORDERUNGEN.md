# Fitness-App – Anforderungen

Stand: 23.11.2026. Planung, noch nichts gebaut.
Grundlage: Berichte der Agenten A–H in [`grundlagen/`](grundlagen/) (F = Kritik). Bei Widersprüchen gilt die Auflösung von F, sofern unten nicht anders vermerkt.
Kennzeichnung: **(ungeprüft)** = Faustregel oder Fakt ohne geprüfte Quelle; vor dem Bau bzw. im Test bestätigen.

Rahmen: reine Web-App (HTML/CSS/JS) auf GitHub Pages, zum Home-Bildschirm hinzugefügt, ohne Server, ohne Anmeldung, ohne laufende Kosten, ohne KI-Schnittstellen. Alle Daten bleiben im iPhone. Training im Studio ohne freie Gewichte.

---

## 1. Funktionsliste

### Version 1

**Start „Heute“**
- Ein Satz zur Lage („Heute: Training – 5 Übungen, ca. 45 Min.“ oder „Ruhetag empfohlen“), ein großer Knopf „Training starten“ bzw. „Training fortsetzen“.
- Darunter: Eiweiß und kcal heute (Ist/Ziel), Knopf „+ Shake“.
- Karte „Wie geht's nach dem Training?“ (Muskelkater-Abfrage), wenn fällig.
- Banner „Backup machen“, wenn fällig.

**Training**
- Ganzkörperplan aus den 4 Mustern Drücken, Ziehen, Beine, Rumpf; nur Übungen an Geräten, die im eigenen Katalog als vorhanden markiert sind.
- Ablauf als feste Schrittfolge: Aufwärmen → Übung → Satz → Pause → … → Abschluss.
- Satz eintragen mit 1 Tipp: Gewicht und Wiederholungen sind vorbelegt; der Tipp auf eine der 4 Feedback-Stufen speichert den Satz und startet die Pause.
- Feedback-Stufen: **easy · passend · gerade so · nicht geschafft**. Abweichende Wiederholungen/Gewicht per Plus/Minus, „Rückgängig“ 5 s lang.
- Sichtbare Rückmeldung, was die App aus dem Feedback macht: in der Pause („Nächster Satz: 8 Wdh. statt 10“), nach der Übung („Nächstes Mal: 40 kg, +1 Stufe – weil 2× alles passend“), auf dem Abschluss-Bildschirm als Liste.
- Pausentimer über gespeicherte Endzeit (läuft auch nach Bildschirm aus richtig weiter), „+30 s“, „Überspringen“.
- Bildschirm wach halten (Wake Lock, ab iOS 18.4 in Home-Bildschirm-Apps), abschaltbar; fehlt die Funktion, wird still darauf verzichtet.
- Geräte-Einstellungen (Sitzhöhe, Lehne, Griff) beim Satz sichtbar, mit einem Tipp änderbar.
- Jeder Satz wird sofort gespeichert; „Training fortsetzen?“ nach Unterbrechung; nach 4 h automatisch beendet.
- Übung „später“ (Gerät besetzt) oder „tut weh“ (ausblenden, Alternative mit gleichem Muster).
- **Nachträgliches Feedback:** beim ersten Öffnen 12–72 h nach einem Training eine Karte „kein · leicht · stark · überspringen“, bei leicht/stark optional Muskelgruppen antippen; zusätzlich „Schmerz, nicht Muskelkater“. Höchstens 1 Frage je Training, abschaltbar.
- Steigerung, Entlastung und Wiedereinstieg nach Pausen automatisch nach den Regeln in Abschnitt 1a.

**Gerätekatalog**
- 30 Vorlagen (Maschinen, Seilzug, Klimmzugstange, Dipstangen, Hyperextension-Bank, Boden, Medizin-/Gewichtsball, 5 Ausdauergeräte) mit Alternativnamen und zugeordneten Übungen (Tabelle in [`grundlagen/C.md`](grundlagen/C.md)). Abhaken „im Studio vorhanden“.
- Eigenes Gerät: Pflicht nur Name, Muster, Belastungsart; oder „wie Gerät X“ kopieren.
- Gewichtsstufen je Gerät als Liste (aus Start/Schritt/Max erzeugt oder frei eingegeben), Anzeige wie am Gerät („35 kg“ oder „Platte 7“).

**Körperdaten**
- Profil: Geburtsdatum, Geschlecht, Größe, Alltags-Aktivität (3 Stufen), Ziel (Aufbau/Halten/Abnehmen).
- Gewicht mit Verlauf; Hauptzahl ist der 7-Tage-Mittelwert (mind. 4 Wiegungen in 7 Tagen, sonst „zu wenig Daten“). Kurze Messanleitung (morgens, nach Toilette, vor Essen, gleiche Waage).
- Taillenumfang (Messstelle nach WHO: Mitte zwischen unterster Rippe und Beckenkamm, nach dem Ausatmen), Verlauf; Erinnerung alle 2–4 Wochen.
- Weitere Umfänge (Brust, Oberarm, Oberschenkel) als optionale Messarten im gleichen Verlauf, ohne Einfluss auf Berechnungen.
- Freitext „Beschwerden/Einschränkungen“ und „Unverträglichkeiten“, je Eintrag mit Datum und Status aktiv/erledigt; aktive Beschwerden werden im Training oben angezeigt, aber nicht ausgewertet.

**Ernährung**
- Tagesziel kcal und Eiweiß aus Profil, Gewicht (7-Tage-Mittel), Ziel und Training (Regeln in Abschnitt 1b); Trainingstag mit Zuschlag, Pausentag ohne.
- „+ Shake“: Eiweißpulver-Portion einmal einstellen (g Pulver, g Eiweiß, kcal vom Etikett), dann 1 Tipp.
- Schnelleingabe: Name (optional) + kcal + Eiweiß; Listen „Zuletzt“ und „Favoriten“ (1 Tipp fügt hinzu, Portion ½/1/1½).
- Lokale Grundliste mit ca. 80 generischen Lebensmitteln (kcal/Eiweiß je 100 g und je üblicher Portion), offline.
- Ca. 10–15 feste Mahlzeitvorschläge (alltagstauglich, mit kcal/Eiweiß), sortiert nach dem, was heute noch fehlt; per Tipp übernehmen.
- Seite „Wie wird gerechnet?“ mit Formeln und Quellen; Hinweis „keine medizinische Beratung“.

**Supplements**
- Statische Prüfliste (Abschnitt 3) mit Nutzen, Dosis, Risiken, Ausschlussgründen, Quellen, Stand-Datum; Ausschlussliste aufklappbar. Die App schlägt nichts von sich aus vor; der Nutzer kann einen Eintrag als „nehme ich“ markieren.

**Daten**
- Speicher IndexedDB; App nur vom Home-Bildschirm nutzen (dort keine 7-Tage-Löschung; Hinweis beim Einstieg).
- Backup: Export als JSON-Datei über das Teilen-Menü, Import ersetzt nach Rückfrage alle Daten; Formatnummer wird geprüft.
- Backup-Erinnerung: über 14 Tage seit dem letzten Backup und neue Einträge seitdem.
- Vollständig offline nutzbar.

### Später
- Training: zwei Plan-Varianten im Wechsel (A/B), Oberkörper/Unterkörper-Split ab ca. 4 Trainings pro Woche, Klimmzug-/Dip-Leiter (Negative → volle Wdh.), automatisches Deload, Übungstausch bei Stagnation, Testsätze zum Finden des Startgewichts, Aufwärmsatz-Berechnung, Supersätze, Ausführungsbilder, Ton beim Pausenende, Händigkeit.
- Muskelkater 4 Stufen mit „Muster ersetzen“, Tagesform-Abfrage vor dem Training.
- Körper: Taille/Größe-Hinweis (NICE: ab 0,5 erhöht) und Taillen-Grenzwerte (WHO: Männer ab 94 / 102 cm) als neutraler Hinweis; Beschwerden mit Körperregion/Seite/Stärke und Hinweispunkt bei passenden Übungen; Fotos.
- Ernährung: Kalorienziel am Gewichtstrend nachjustieren (Regel steht schon fest, Abschnitt 1b); Barcode-Scan mit Open Food Facts; größere Lebensmittelliste aus dem Bundeslebensmittelschlüssel (BLS 4.0, Lizenz klären); Unverträglichkeiten als Filter-Tags; Handmaß-Portionen; Mahlzeit-Vorlagen aus mehreren Zutaten; Fett/Kohlenhydrate.
- Daten: Zusammenführen beim Import, Schema-Migration (sobald es Version 2 gibt), mehrere Profile auf einem Gerät, Gerätekatalog an andere weitergeben, mehrere Studios.
- Supplements: Kreatin als tägliches Abhaken.

---

## 1a. Trainingsregeln Version 1

Quellen: ACSM Position Stand 2009 (Progression Models), WHO-Leitlinien 2020, Schoenfeld et al. 2016/2019 (Frequenz), Zourdos et al. 2016 und Helms et al. 2016 (Wiederholungen in Reserve), Bosquet et al. 2013 (Pausen), Cheung et al. 2003 (Muskelkater). Konkrete Schwellenwerte sind praxisübliche Faustregeln **(ungeprüft)**. Gewichte werden **nur in Gerätestufen** gerechnet, nie in Prozent. Bei Stufe + Zusatzgewicht bilden alle Kombinationen eine sortierte Liste; „+1 Stufe“ ist der nächste Eintrag.

| Thema | Regel |
|---|---|
| Plan | Ganzkörper: je 1 Übung Drücken, Ziehen, Beine, Rumpf, optional 1 Zusatzübung. Je Muster eine Prioritätsliste; genommen wird die erste Übung mit vorhandenem Gerät, mehrgelenkig vor eingelenkig. |
| Einstieg | Erste 14 Tage ab dem ersten Training: 2 Sätze, Ziel 10–12 Wdh., bewusst leicht. Danach 3 Sätze. Startstufe gibt der Nutzer ein (Vorschlag: kleinste Stufe); ab Satz 2 korrigiert die Feedback-Regel. |
| Bereich | Maschinen 8–12 Wdh. Rumpf je Übung fest: Zeit 20–60 s (Steigerung +10 s) oder 10–15 Wdh. Körpergewicht: Steigerung über Wdh. |
| Feedback-Stufen | easy = ≥ 4 Wdh. wären noch gegangen · passend = 2–3 · gerade so = 0–1 · nicht geschafft = Ziel verfehlt. Satz ohne Feedback = „nicht bewertet“, zählt nicht für Steigerung. |
| Im selben Training (Folgesatz) | easy → +2 Wdh. (höchstens Obergrenze); 2. easy in Folge → +1 Stufe. passend → gleich. gerade so → Ziel −1 Wdh. nicht geschafft → −1 Stufe. Senken ist immer erlaubt, Erhöhen höchstens 1× je Übung und Training. |
| Nächstes Training | Ein Training gilt als „erfüllt“, wenn alle Sätze die Obergrenze erreichen und mindestens passend sind. 2 erfüllte Trainings in Folge → +1 Stufe, Ziel zurück auf 8. Mindestens die Hälfte der Sätze easy in 2 Trainings in Folge → +1 Stufe. Einzelnes easy → Ziel +1 Wdh., kein Gewichtssprung. |
| Fehlschlag | Ein Training gilt als „verfehlt“, wenn mindestens 1 Satz nicht geschafft ist. 1× verfehlt → gleiches Gewicht. 2× in Folge → −1 Stufe, Ziel 10. |
| Großer Sprung | Ist die nächste Stufe mehr als 10 % schwerer: Obergrenze 15 statt 12, nach dem Sprung Ziel und Untergrenze 6. |
| Pausen | Tage seit letztem Training: ≤ 7 normal · 8–14 keine Steigerung, Ziel −2 Wdh. · 15–28 −1 Stufe und 2 Sätze für ein Training · > 28 −2 Stufen und Einstieg (2 Sätze) für 7 Tage. Ab 8 Tagen Pause beginnt die Zählung „in Folge“ neu. |
| Kurzer Abstand | Weniger als 48 h seit dem letzten Training: „Ruhetag empfohlen“; wird trotzdem trainiert, keine Erhöhung und −1 Satz je Übung **(ungeprüft)**. |
| Muskelkater | Muskelgruppen: Brust/Schulter, Rücken, Arme, Beine, Rumpf. leicht → keine Wirkung. stark → Übungen dieser Gruppe ohne Erhöhung, −1 Satz. Muskelkater zählt nie als Fehlschlag. |
| Schmerz | „Schmerz, nicht Muskelkater“ oder „tut weh“ bei einer Übung → keine Regel, nur Hinweis „ärztlich oder physiotherapeutisch abklären“ und Angebot, die Übung auszublenden. Feste Zeile: „Bei Schmerz, Schwindel, Brustdruck abbrechen.“ |
| Untergrenze | Abzüge stapeln sich höchstens bis 1 Satz je Übung. |
| Entlastung | Kein automatisches Deload. Nach 2 verfehlten Trainings in Folge mit mindestens 2 betroffenen Übungen bietet die App eine leichte Woche an (Sätze halbieren). |
| Aufwärmen | 5–8 Min. Laufband, Ergometer, Air Bike oder Rudergerät locker; Dauer optional erfassen. |
| Oberste Stufe erreicht | Hinweis „mehr Wdh. oder einarmig/einbeinig“. |

## 1b. Ernährungsregeln Version 1

- Grundumsatz Mifflin-St Jeor (Mifflin et al. 1990, Am J Clin Nutr 51:241), Mann: 10 × kg + 6,25 × cm − 5 × Alter + 5. Gewicht = 7-Tage-Mittel, Alter aus Geburtsdatum.
- Pausentag = Grundumsatz × Alltagsfaktor (sitzend 1,4 · teils gehend 1,6 · körperlich arbeitend 1,8; Sport nicht eingerechnet). Stufen an den PAL-Werten der DGE ausrichten **(ungeprüft)**.
- Trainingstag = Pausentag + (MET − 1) × kg × Stunden; Dauer aus dem erfassten Training, sonst 60 Min.; MET für Gerätetraining ca. 5 **(ungeprüft, im Compendium of Physical Activities nachsehen)**. Ein Tag gilt als Trainingstag, sobald ein Training gestartet ist oder der Nutzer „heute trainiere ich noch“ antippt.
- Ziele: Halten ±0 kcal, 1,6 g Eiweiß/kg · Aufbau +10 %, 1,8 g/kg · Abnehmen −20 % (höchstens −500 kcal), 2,0 g/kg. Eiweiß: ISSN Position Stand Jäger et al. 2017 (1,4–2,0 g/kg), Morton et al. 2018 (Nutzen flacht ab ca. 1,6 g/kg ab). Untergrenze DGE 0,8 g/kg. Die Prozentwerte für kcal sind übliche Praxis **(ungeprüft)**.
- Eiweiß an Trainings- und Pausentagen gleich; der Unterschied liegt bei den kcal.
- Rundung auf 50 kcal und 5 g Eiweiß. Untergrenze kcal = Grundumsatz.
- Später, Nachjustieren: erste Anpassung frühestens 21 Tage nach Start (und nach Beginn von Kreatin, wegen Wasser); dann Wochenmittel jetzt gegen vor 14 Tagen; Vorschlag ±150 kcal, nur mit Bestätigung, frühestens 14 Tage nach der letzten Änderung.

---

## 2. Datenmodell

IndexedDB, Datenbankname `fitness-app`. Jeder Eintrag: `id` (zufällig), `geaendert` (ISO-Zeit). Mitgelieferte Vorlagen (Geräte, Übungen, Lebensmittel, Mahlzeitvorschläge, Supplements) liegen als Daten-Dateien in der App, nicht in der Datenbank und nicht im Backup.

| Speicher | Felder | Hinweis |
|---|---|---|
| `kv` | Einstellungen: `portionShake`, `wakeLock`, `katerFrage`, `letztesBackup`, `heuteTraining` (Datum), `supplementeMarkiert[]` | Schlüssel/Wert |
| `profil` | `geburtsdatum`, `geschlecht`, `groesseCm`, `alltagsfaktor`, `ziel`, `startDatum` | genau 1 Eintrag; `id` bereitet spätere Profile vor |
| `messungen` | `datum`, `art` (`gewicht`, `taille`, `brust`, `oberarm`, `oberschenkel`), `wert`, `einheit`, `notiz` | eine Zeile je Messung; neue Arten ohne Schemaänderung |
| `notizen` | `typ` (`beschwerde`, `unvertraeglichkeit`), `text`, `beginn`, `status` (`aktiv`/`erledigt`), `erledigtAm` | nie überschreiben, nur Status ändern |
| `geraete` | `vorlageId` oder eigene Felder (`name`, `muster`, `belastungsart`: `kg`/`koerper`/`zeit`/`ausdauer`/`ball`), `vorhanden`, `stufen[]`, `zusatz[]`, `anzeige` (`kg`/`stufe`), `einstellungen[{name, wert}]`, `notiz` | Vorlage wird nur referenziert, Nutzerwerte überschreibt kein Update |
| `uebungen` | eigene Übungen: `name`, `muster`, `muskelgruppe`, `belastungsart`, `hinweis` | Vorlagen-Übungen aus der Daten-Datei |
| `geraetUebung` | `geraetId`, `uebungId`, `ausgeblendet`, `stand` {`stufenIndex`, `zielWdh`, `saetze`, `erfuelltInFolge`, `verfehltInFolge`, `easyInFolge`} | hieran hängen Fortschritt und Steigerung |
| `trainings` | `start`, `ende`, `status` (`laeuft`/`beendet`), `aufwaermen` {`geraetId`, `minuten`}, `uebungen[]` (Reihenfolge, Vorgaben), `aenderungen[]` (Text für Abschluss), `nachbefragung` {`stufe`: kein/leicht/stark/schmerz/keine Angabe, `gruppen[]`, `am`}, `pauseEndeUm` | `pauseEndeUm` für den Timer |
| `saetze` | `trainingId`, `geraetUebungId`, `nr`, `stufenIndex`, `zusatz`, `wdh`, `sekunden`, `feedback` (`easy`/`passend`/`geradeSo`/`nichtGeschafft`/`nichtBewertet`), `zeit` | sofort beim Tipp gespeichert |
| `essen` | `datum`, `zeit`, `name`, `kcal`, `eiweiss`, `portion`, `quelle` (`shake`/`grundliste`/`vorschlag`/`frei`), `vorlageId` | |
| `favoriten` | `name`, `kcal`, `eiweiss`, `portion` | eigene Lebensmittel/Mahlzeiten |

Backup-Datei: `{ app: "fitness-app", format: 1, schema: 1, erstellt, daten: { <speicher>: [...] } }`.

---

## 3. Supplements

Bedingungen: (a) gute Studienlage (Übersichtsarbeiten oder Positionspapiere anerkannter Fachgesellschaften), (b) klar belegter Nutzen für Kraft/Muskelaufbau, (c) geringes Risiko bei üblicher Dosis. Recherche H, Stichproben geprüft durch F (Websuche, Volltexte nicht gelesen). Bei Koffein weiche ich von H ab: Es erfüllt (b) nicht (siehe Ausschlussliste), genauso wie Beta-Alanin aus diesem Grund ausgeschlossen ist.

### Eiweißpulver (bereits genommen, kein Prüfgegenstand)
Zählt zur Tages-Eiweißmenge. Morton et al. 2018, Br J Sports Med 52:376, doi 10.1136/bjsports-2017-097608.

### Prüfliste

**Kreatin-Monohydrat** – erfüllt alle drei Bedingungen
- Nutzen: mehr Kraft und mehr Muskelzuwachs bei Krafttraining, bei Einsteigern wie Trainierten.
- Studienlage: Kreider et al. 2017, ISSN Position Stand, J Int Soc Sports Nutr 14:18, doi 10.1186/s12970-017-0173-z (vom Industrieverband Council for Responsible Nutrition beauftragt und mitfinanziert); Antonio et al. 2021, J Int Soc Sports Nutr 18:13, doi 10.1186/s12970-021-00412-w; IOC Consensus Statement Maughan et al. 2018, Br J Sports Med 52:439, doi 10.1136/bjsports-2018-099027. EU-Gesundheitsangabe VO (EU) 2017/672 (Wirkung von Krafttraining auf Muskelkraft, gilt für Erwachsene über 55).
- Dosis: 3–5 g täglich, Zeitpunkt egal, Ladephase nicht nötig (Antonio 2021).
- Risiken: 1–2 kg mehr Gewicht durch Wasser in den Muskeln **(Größenordnung ungeprüft)** – die App erklärt das im Gewichtsverlauf; Magen-Darm-Beschwerden bei großen Einzeldosen. Nierenschaden bei Gesunden nicht belegt (Kreider 2017, Antonio 2021).
- Nicht nehmen bzw. nur nach ärztlicher Rücksprache: Nierenerkrankung oder eingeschränkte Nierenfunktion. Kreatin erhöht den Kreatinin-Blutwert → vor Blutuntersuchungen Arzt informieren.
- Reinheit: reines Monohydrat; Produkte mit Prüfung auf Dopingsubstanzen (Kölner Liste) bevorzugen – keine Garantie.

**Nur bei ärztlich festgestelltem Mangel** (ohne Blutwert kein Nutzen für das Ziel belegt): Vitamin D (Beaudart et al. 2014, J Clin Endocrinol Metab 99:4336), Magnesium, Zink, Eisen, Vitamin B12 bei veganer Ernährung.

### Ausschlussliste

| Präparat | verfehlt | Begründung |
|---|---|---|
| Koffein | b | Kleiner kurzfristiger Effekt auf Kraft (Grgic et al. 2018, J Int Soc Sports Nutr 15:11: SMD 0,20, Unterkörper nicht signifikant, 46 Personen), kein Muskelaufbau. Vermerk: Kaffee reicht; EFSA 2015 hält 200 mg je Einzeldosis und 400 mg/Tag für unbedenklich, schon 100 mg können den Schlaf stören – bei Abendtraining beachten. |
| Beta-Alanin | b | Nutzen nur bei Belastungen von 0,5–10 Min. (Saunders et al. 2017, Br J Sports Med 51:658). |
| Natriumbicarbonat | b, c | Nutzen bei intensiven Intervallen, nicht Muskelaufbau; häufig Magen-Darm-Probleme (Grgic et al. 2021, ISSN). |
| Nitrat / Rote Bete | b | Belege vor allem für Ausdauer (IOC 2018). |
| HMB | b | Bei Trainierten kein relevanter Effekt (Rowlands & Thomson 2009). |
| BCAA | b | Kein Nutzen für Muskelaufbau belegt (Wolfe 2017, J Int Soc Sports Nutr 14:30). |
| EAA | b | Kein Zusatznutzen bei gedecktem Eiweißbedarf **(ungeprüft)**. |
| Citrullin / Arginin | a, b | Kleiner, uneinheitlicher Akuteffekt (Trexler et al. 2019, Sports Med 49:707). |
| Omega-3 | b | Kein klar belegter Kraft-/Muskeleffekt bei Gesunden. |
| Ashwagandha | a, c | Wenige, uneinheitliche Studien; BfR-Mitteilung 39/2024 warnt vor Leberschäden bis Leberversagen, keine sichere Menge ableitbar. |
| Tribulus / „Testosteron-Booster“ | b, c | Erhöht Testosteron nicht (Qureshi et al. 2014); Booster teils verunreinigt. |
| Fatburner / Grüntee-Extrakt | b, c | Kein Muskelaufbau; ab 800 mg EGCG/Tag Hinweise auf Leberschäden (EFSA 2018), EU-Beschränkung seit Dezember 2022 (VO (EU) 2022/2340). |
| Glutamin, L-Carnitin, Kollagen, Multivitamin, CLA | b | Kein belegter Nutzen für Kraft/Muskelaufbau bei Gesunden **(Quellen ungeprüft)**. |

Vollständige Quellen mit Links: [`grundlagen/H.md`](grundlagen/H.md), Prüfung: [`grundlagen/F.md`](grundlagen/F.md).

---

## 4. Vor dem Bau am Gerät bzw. Original prüfen

1. Speicher der Home-Bildschirm-App getrennt vom Safari-Tab? (bestimmt den Einstiegshinweis)
2. Wake Lock in der Home-Bildschirm-App am eigenen iPhone; braucht iOS 18.4 oder neuer.
3. Vor „Barcode später“: Darf der Browser Open Food Facts direkt abfragen (CORS)? Aus der Planungsumgebung nicht testbar.
4. DGE-PAL-Stufen und MET-Wert Gerätetraining (Abschnitt 1b).
5. Lizenz BLS 4.0, falls die Grundliste daraus kommen soll; sonst Werte aus Packungsangaben/eigener Quelle mit Quellenfeld.
