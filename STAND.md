# STAND – Bike-App

Für eine neue Sitzung: zuerst diese Datei lesen. Die Nutzerin kann nicht programmieren:
Antworten auf Deutsch, knapp, nichts Technisches erklären, nur sagen, was sie testen oder liefern soll.
Claude legt keine Konten an und gibt keine Passwörter ein.

Den vollständigen Auftrag (5 Abschnitte, Regeln) hat die Nutzerin am 13.11.2026 im Chat gegeben.
Kernpunkte: statische Website auf GitHub Pages (öffentliches Repo `bike-app`), iPhone/Safari zuerst,
große Knöpfe, persönliche Daten nur in IndexedDB, Backup als JSON, nach jedem Abschnitt veröffentlichen,
Link + 3–5 Testpunkte nennen und auf Okay warten.
Nicht bauen: Konten, Gruppen-Statistik, Strava-Anbindung, eigenes Routing, Ranglisten, Puls/Watt.

## Vorab-Prüfung (13.11.2026)
- Open-Meteo: Bodentemperatur (`soil_temperature_0cm`), Bodenfeuchte (`soil_moisture_0_to_1cm`) und `past_days=3` kommen am Standard-Endpunkt, selbst getestet für die Rhön.
- iOS: Wake Lock geht in Home-Bildschirm-Apps ab iOS 18.4. Geolocation nur, solange die App im Vordergrund ist. → Aufzeichnung (Abschnitt 3) ist als Experiment machbar, wenn das Display anbleibt.
- GPX-Export: Bosch Flow ja (Aktivität → ⋯ → GPX herunterladen), Komoot ja (App oder Website), Strava ja (nur Website → ⋯ → GPX exportieren).

## Abschnitte
- [x] **Abschnitt 1 – Heute fahren?** (13.11.2026, Version 0.1.0) – veröffentlicht: https://bauer-reisen.github.io/bike-app/
  - Dateien: `js/schwellen.js` (alle Schwellen + 3 Voreinstellungen), `js/ampel.js` (Regeln, bestes Fenster, Empfehlung), `js/wetter.js` (Open-Meteo + Ortssuche), `js/db.js` (IndexedDB + Backup), `js/app.js` (Oberfläche).
  - Prüfen: `node tools/check-ampel.mjs` (25 Testfälle), `node tools/check-privat.mjs` (läuft auch automatisch vor jedem Push).
  - Eigene Suchwörter für die Privat-Prüfung: `.privat-woerter.txt` (wird nie hochgeladen).
  - Entscheidungen: „Warnungen“ (Auftauen, Glätte, Laub, Dämmerung) und „Hinweise“ (gefroren, Akku, Bodenfeuchte) ändern die Ampelfarbe nicht, nur „gelb/rot“-Regeln. Zusätzlich: Eisregen = rot, Schneefall = gelb.
  - Lokal testen: Vorschau `bike-app` (launch.json in `Uebergabe-App\.claude\`), Port 5600.
- [~] **Abschnitt 2 – Routen** (13.11.2026, Version 0.2.0) – alles gebaut außer den kuratierten Touren (GPX vom Freund fehlt noch)
  - `js/routen.js`: Karte, „Routen in der Nähe“ (nach Entfernung), bei nasser Trail-Ampel nässetaugliche zuerst, Filter E-MTB/Gravel, Komoot-Suche (`/de-de/discover/<Ort>/@lat,lon/tours?sport=mtb|mtb_easy`, getestet), eigene GPX-Routen (nur im Gerät), Detail mit Steckbrief, Ampel entlang der Strecke (Start, höchster, entferntester Punkt), „GPX an andere App geben“, blauer Standortpunkt (◎).
  - Kuratierte Touren: `node tools/gpx-bereinigen.mjs <datei.gpx> --id x --name "…" --rad emtb[,gravel] --untergrund "Waldweg,Trail" --nass ja|nein --start "…" [--hinweis "…"]` → kürzt 300 m, entfernt Zeit/Namen/Geräte, schreibt `routen/<id>.gpx` und den Eintrag in `routen/routen.json`. Vorher die Nutzerin je Route nach Rad-Typ, Untergrund, Nässe fragen.
  - Nutzerin will vorerst KEIN eigenes Routing (13.11.2026).
- [x] **Abschnitt 3 – Fahrtenbuch** (13.11.2026, Version 0.2.0): `js/fahrten.js`, `js/gpx.js`. Von Hand / GPX-Import / Aufzeichnung (Experiment, Wake Lock, Zwischenspeicher `kv aufzeichnung`). Statistik je Rad, Backup-Erinnerung bei jeder 5. Fahrt. E-MTB: Unterstützung + Restakku im Formular.
- [x] **Abschnitt 4 – Training** (13.11.2026, Version 0.2.0): `js/training.js`, Test `node tools/check-training.mjs`. Höchstens 12 Wochen, jede 3. Entlastung, Spitze 75 km, höchstens +15 %/Woche; nicht geschaffte Wochen verschieben den Plan; Hinweis bei zu wenig Wochen.
- [x] **Abschnitt 5 – Technik** (13.11.2026, Version 0.2.0): `js/technik.js`, `js/technik-daten.js` (Texte), `js/rad-grafik.js` (SVG). Pannen-Modus auch auf „Heute“, Notruf 112, Standort per WhatsApp. `sw.js`: Netz zuerst (max. 4 s), sonst gespeicherte Kopie – Updates kommen so bei allen an. Offline getestet (Server aus → App + Panne gehen).
  - Foto-Wünsche an die Nutzerin stehen in den Anleitungen als „📷 Foto folgt“ (Kupplungsschalter Schaltwerk, Plug-Werkzeug, Multitool mit Kettennieter, Schaltwerk von hinten, Kettenlehre, Bremssattel von oben, Einstellschraube).
- Bei jeder Veröffentlichung: Version in `js/version.js` UND `sw.js` erhöhen.

## Veröffentlichen
- Git ist eingerichtet (Branch `main`, Autor `Bauer-Reisen` mit noreply-Adresse).
- Repo `Bauer-Reisen/bike-app` angelegt (Nutzerin, 13.11.2026), erster Push erledigt. Hochladen künftig mit `git push` (Zugang gespeichert, Privat-Prüfung läuft vorher).
- Pages einschalten (Settings → Pages → Branch `main`, Ordner `/ (root)`): erledigt (13.11.2026), Seite online geprüft.
- Link: https://bauer-reisen.github.io/bike-app/
- **Version 0.2.0 (alle Bereiche außer kuratierten Touren) veröffentlicht. Nutzerin wollte durchbauen ("bau was ohne GPX möglich ist"). Warte auf ihren iPhone-Test und auf die GPX-Dateien.**
