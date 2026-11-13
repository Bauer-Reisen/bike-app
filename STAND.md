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
- [x] **Abschnitt 1 – Heute fahren?** (13.11.2026, Version 0.1.0) – gebaut und lokal getestet, **noch nicht veröffentlicht** (GitHub-Repo fehlt noch)
  - Dateien: `js/schwellen.js` (alle Schwellen + 3 Voreinstellungen), `js/ampel.js` (Regeln, bestes Fenster, Empfehlung), `js/wetter.js` (Open-Meteo + Ortssuche), `js/db.js` (IndexedDB + Backup), `js/app.js` (Oberfläche).
  - Prüfen: `node tools/check-ampel.mjs` (25 Testfälle), `node tools/check-privat.mjs` (läuft auch automatisch vor jedem Push).
  - Eigene Suchwörter für die Privat-Prüfung: `.privat-woerter.txt` (wird nie hochgeladen).
  - Entscheidungen: „Warnungen“ (Auftauen, Glätte, Laub, Dämmerung) und „Hinweise“ (gefroren, Akku, Bodenfeuchte) ändern die Ampelfarbe nicht, nur „gelb/rot“-Regeln. Zusätzlich: Eisregen = rot, Schneefall = gelb.
  - Lokal testen: Vorschau `bike-app` (launch.json in `Uebergabe-App\.claude\`), Port 5600.
- [ ] Abschnitt 2 – Routen (wartet auf GPX-Dateien vom Freund der Nutzerin)
- [ ] Abschnitt 3 – Fahrtenbuch und Statistik
- [ ] Abschnitt 4 – Trainingsmodus 100 km
- [ ] Abschnitt 5 – Technikseite (+ Service Worker für Pannen-Modus)

## Veröffentlichen
- Git ist eingerichtet (Branch `main`, Autor `Bauer-Reisen` mit noreply-Adresse).
- Repo `Bauer-Reisen/bike-app` angelegt (Nutzerin, 13.11.2026), erster Push erledigt. Hochladen künftig mit `git push` (Zugang gespeichert, Privat-Prüfung läuft vorher).
- Pages einschalten (Settings → Pages → Branch `main`, Ordner `/ (root)`): macht die Nutzerin – danach hier abhaken. [ ]
- Der Link wird dann sein: https://bauer-reisen.github.io/bike-app/
