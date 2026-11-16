// Wächter für Rundgang und „Was ist neu?“ – läuft vor jedem Hochladen (pre-push).
// Schlägt fehl, wenn eine größere Neuerung nicht im Rundgang erklärt ist
// oder die Versionsnummern nicht zusammenpassen.
import fs from 'node:fs';
import { KARTEN, NEUES } from '../js/hilfe-daten.js';
import { VERSION } from '../js/version.js';

const zahl = v => v.split('.').map(Number);
const mindestens = (a, b) => {
  const x = zahl(a), y = zahl(b);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  return true;
};
const fehler = [];

for (const n of NEUES) {
  if (n.rundgang === 'klein') continue;
  for (const id of n.rundgang) {
    const k = KARTEN.find(x => x.id === id);
    if (!k) fehler.push(`${n.v} „${n.titel}“: Rundgang-Karte „${id}“ gibt es nicht`);
    else if (!mindestens(k.stand, n.v)) fehler.push(`${n.v} „${n.titel}“: Karte „${k.titel}“ ist noch Stand ${k.stand} – Text ergänzen und stand auf ${n.v} setzen`);
  }
}
if (zahl(VERSION)[2] === 0 && !NEUES.some(n => n.v === VERSION)) fehler.push(`Version ${VERSION} hat keinen „Was ist neu?“-Eintrag`);
if (NEUES.length && !mindestens(VERSION, NEUES[0].v)) fehler.push(`„Was ist neu?“ ${NEUES[0].v} ist neuer als die App (${VERSION})`);
if (new Set(KARTEN.map(k => k.id)).size !== KARTEN.length) fehler.push('Rundgang-Karten haben doppelte Kennungen');

const sw = /const VERSION = '([^']+)'/.exec(fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8'))?.[1];
const vj = JSON.parse(fs.readFileSync(new URL('../version.json', import.meta.url), 'utf8')).version;
if (sw !== VERSION) fehler.push(`sw.js hat Version ${sw}, js/version.js hat ${VERSION}`);
if (vj !== VERSION) fehler.push(`version.json hat Version ${vj}, js/version.js hat ${VERSION}`);

if (fehler.length) {
  console.error('✗ Hilfe/Version nicht aktuell:\n  ' + fehler.join('\n  '));
  process.exit(1);
}
console.log(`✓ Rundgang, „Was ist neu?“ und Versionsnummern passen (${VERSION}).`);
