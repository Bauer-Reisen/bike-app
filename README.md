# Bike-App

Kleine Fahrrad-App fürs Handy: „Heute fahren?“ mit Ampel für E-MTB und Gravel,
später Routen, Fahrtenbuch, Trainingsplan und Technik-Hilfe.

- Reine Website (HTML, CSS, JavaScript), ohne Server und ohne Anmeldung.
- Persönliche Daten (Orte, Fahrten, Plan) bleiben nur im Gerät des jeweiligen Nutzers.
- Wetterdaten: [Open-Meteo.com](https://open-meteo.com/) (CC BY 4.0).
- Karte: © [OpenStreetMap](https://www.openstreetmap.org/copyright)-Mitwirkende, dargestellt mit [Leaflet](https://leafletjs.com/) (BSD-2, siehe `vendor/leaflet/LICENSE`).

## Ampel-Schwellen ändern

Alle Schwellen stehen in [`js/schwellen.js`](js/schwellen.js).
Prüfen danach: `node tools/check-ampel.mjs`

## Prüfen

- `node tools/check-ampel.mjs` – Ampel-Regeln
- `node tools/check-training.mjs` – Trainingsplan
- `node tools/check-privat.mjs` – nichts Privates im Repository (läuft vor jedem Push)

## Kuratierte Routen hinzufügen

`node tools/gpx-bereinigen.mjs <datei.gpx> --id <id> --name "…" --rad emtb --untergrund "Waldweg,Trail" --nass ja --start "…"`

## Lokal testen

`node tools/server.mjs` → http://localhost:5600
