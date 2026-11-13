// Bereinigt GPX-Dateien für die kuratierten Routen:
// - kürzt Anfang und Ende um je 300 m (kein Wohnort erkennbar)
// - entfernt Namen, Zeitstempel, Gerätedaten, Puls usw. (schreibt nur Koordinaten + Höhe)
// - trägt die Route in routen/routen.json ein (Angaben, die nicht in der Datei stehen, als Parameter)
//
// Aufruf:
// node tools/gpx-bereinigen.mjs <eingabe.gpx> --id kreuzberg --name "Kreuzberg-Runde" --rad emtb[,gravel]
//      --untergrund "Waldweg,Trail" --nass ja|nein --start "Parkplatz X" [--hinweis "Text"]...
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { leseGpx, kuerzen, auswerten, vereinfache, packe, schreibeGpx } from '../js/gpx.js';

const args = process.argv.slice(2);
const datei = args[0];
const opt = { hinweis: [] };
for (let i = 1; i < args.length; i += 2) {
  const k = args[i].replace(/^--/, '');
  if (k === 'hinweis') opt.hinweis.push(args[i + 1]); else opt[k] = args[i + 1];
}
for (const k of ['id', 'name', 'rad', 'untergrund', 'nass']) {
  if (!opt[k]) { console.error(`Fehlt: --${k}`); process.exit(1); }
}
if (!/^[a-z0-9-]+$/.test(opt.id)) { console.error('--id nur Kleinbuchstaben, Zahlen, Bindestrich'); process.exit(1); }

const { punkte } = leseGpx(readFileSync(datei, 'utf8'));
const gekuerzt = kuerzen(punkte.map(({ lat, lon, ele }) => ({ lat, lon, ele })), 300);
if (gekuerzt.length < 10) { console.error('Spur zu kurz nach dem Kürzen.'); process.exit(1); }
const w = auswerten(gekuerzt);
const ziel = `routen/${opt.id}.gpx`;
writeFileSync(ziel, schreibeGpx(opt.name, vereinfache(gekuerzt, 3)));

const eintrag = {
  id: opt.id, name: opt.name, rad: opt.rad.split(','), km: Math.round(w.km * 10) / 10, hm: w.hm,
  untergrund: opt.untergrund.split(',').map(s => s.trim()), nass: opt.nass === 'ja',
  start: { name: opt.start || '', lat: +gekuerzt[0].lat.toFixed(4), lon: +gekuerzt[0].lon.toFixed(4) },
  hinweise: opt.hinweis, datei: ziel, spur: packe(vereinfache(gekuerzt, 15)),
};
const liste = existsSync('routen/routen.json') ? JSON.parse(readFileSync('routen/routen.json', 'utf8')) : [];
const i = liste.findIndex(r => r.id === opt.id);
if (i >= 0) liste[i] = eintrag; else liste.push(eintrag);
writeFileSync('routen/routen.json', JSON.stringify(liste, null, 1));
console.log(`✓ ${opt.name}: ${eintrag.km} km, ${eintrag.hm} Hm, ${punkte.length} → ${gekuerzt.length} Punkte, gespeichert als ${ziel}`);
