// Prüft die Ampel-Regeln mit erfundenen Wetterlagen.
// Aufruf: node tools/check-ampel.mjs
import { bewerteStunden, fasseZusammen, empfehlung } from '../js/ampel.js';
import { schwellenFuer } from '../js/schwellen.js';

// 4 Tage à 24 Stunden, Grundwetter: 12 °C, trocken, ruhig, Juli
function lage(aenderung = () => {}, monat = '07') {
  const st = [];
  for (let d = 0; d < 4; d++) for (let h = 0; h < 24; h++) {
    const x = {
      datum: `2026-${monat}-1${d}`, stunde: h, temp: 12, gefuehlt: 12, regen: 0,
      code: 1, boeen: 20, bodenT: 10, bodenF: 0.25,
    };
    aenderung(x, d, h);
    st.push(x);
  }
  return st;
}
const I = 3 * 24 + 12; // Tag 4, 12 Uhr
let fehler = 0;
function pruefe(name, stunden, erwartet, preset = 'normal') {
  const b = bewerteStunden(stunden, schwellenFuer(preset));
  const e = fasseZusammen(b, 'emtb', I, I + 1, null);
  const g = fasseZusammen(b, 'gravel', I, I + 1, null);
  const ids = [...e.gruende, ...g.gruende].map(x => x.id);
  const ok = (erwartet.emtb == null || e.stufe === erwartet.emtb)
    && (erwartet.gravel == null || g.stufe === erwartet.gravel)
    && (erwartet.ids || []).every(id => ids.includes(id))
    && (erwartet.nicht || []).every(id => !ids.includes(id));
  if (!ok) fehler++;
  console.log(`${ok ? 'OK  ' : 'FEHLER'} ${name}: E-MTB ${e.stufe}, Gravel ${g.stufe} [${[...new Set(ids)].join(', ')}]`
    + (ok ? '' : `  erwartet ${JSON.stringify(erwartet)}`));
  return { e, g };
}

pruefe('Schönwetter', lage(), { emtb: 0, gravel: 0, nicht: ['akku'] });
pruefe('Böen 45', lage(x => { x.boeen = 45; }), { emtb: 0, gravel: 1 });
pruefe('Böen 52', lage(x => { x.boeen = 52; }), { emtb: 1, gravel: 1 });
pruefe('Böen 57', lage(x => { x.boeen = 57; }), { emtb: 1, gravel: 2 });
pruefe('Böen 62', lage(x => { x.boeen = 62; }), { emtb: 2, gravel: 2 });
pruefe('Böen 45 hart im Nehmen', lage(x => { x.boeen = 45; }), { emtb: 0, gravel: 0 }, 'hart');
pruefe('Böen 42 vorsichtig', lage(x => { x.boeen = 42; }), { emtb: 1, gravel: 1 }, 'vorsichtig');
pruefe('12 mm Regen gestern', lage((x, d, h) => { if (d === 2 && h >= 20) x.regen = 3; }), { emtb: 1, gravel: 0, ids: ['trailnass'] });
pruefe('26 mm in 3 Tagen, je Tag wenig', lage((x, d, h) => { if (d < 3 && h === 14) x.regen = 9; }), { emtb: 1, gravel: 0, ids: ['trailnass'] });
pruefe('6 mm, Boden sehr feucht', lage((x, d, h) => { x.bodenF = 0.43; if (d === 3 && h === 2) x.regen = 6; }), { emtb: 1, ids: ['trailnass', 'bodenfeucht'] });
pruefe('Regen jetzt 1,5 mm/h', lage((x, d, h) => { if (d === 3 && h === 12) x.regen = 1.5; }), { emtb: 1, gravel: 1, ids: ['regen'] });
pruefe('Gewitter', lage((x, d, h) => { if (d === 3 && h === 12) x.code = 95; }), { emtb: 2, gravel: 2, ids: ['gewitter'] });
pruefe('Gefühlt 1 °C', lage(x => { x.gefuehlt = 1; x.temp = 4; }), { emtb: 0, gravel: 1, ids: ['kalt', 'akku'] });
pruefe('Gefühlt -2 °C', lage(x => { x.gefuehlt = -2; x.temp = 1; }), { emtb: 1, gravel: 1 });
pruefe('Boden gefroren', lage(x => { x.bodenT = -1; x.temp = 3; x.gefuehlt = 3; }), { ids: ['gefroren'], nicht: ['tauen'] });
pruefe('Frost-Tau-Wechsel', lage((x, d, h) => { x.bodenT = (h < 9) ? -2 : 4; }), { ids: ['tauen'], emtb: 0 });
pruefe('Glätte nach Regen', lage((x, d, h) => { x.bodenT = 1; if (d === 3 && h === 6) x.regen = 1; }), { ids: ['glaette'] });
pruefe('Keine Glätte ohne Nässe', lage(x => { x.bodenT = 1; }), { nicht: ['glaette'] });
pruefe('Laub im November nach Regen', lage((x, d, h) => { if (d === 2 && h === 18) x.regen = 2; }, '11'), { ids: ['laub'] });
pruefe('Kein Laub im Juli', lage((x, d, h) => { if (d === 2 && h === 18) x.regen = 2; }), { nicht: ['laub'] });

// Empfehlungen
const z = (stufe, ...ids) => ({ stufe, gruende: ids.map(id => ({ id, art: 'ampel', stufe })) });
const tests = [
  [z(1, 'trailnass'), z(0), 'Heute lieber Gravel – oder mit dem E-MTB Forstwege statt Singletrails.'],
  [z(1, 'trailnass'), z(1, 'kalt'), 'Mit dem E-MTB: Forstwege statt Singletrails.'],
  [z(2, 'boeenWald'), z(1, 'boeen'), 'Heute lieber Gravel.'],
  [z(0), z(0), 'Gute Bedingungen für beide Räder – ab aufs Rad!'],
  [z(2, 'gewitter'), z(2, 'gewitter'), 'Gewitter – heute lieber nicht fahren.'],
];
for (const [e, g, soll] of tests) {
  const ist = empfehlung(e, g, '');
  const ok = ist === soll;
  if (!ok) fehler++;
  console.log(`${ok ? 'OK  ' : 'FEHLER'} Empfehlung: ${ist}`);
}

console.log(fehler ? `\n${fehler} Fehler` : '\nAlles in Ordnung.');
process.exit(fehler ? 1 : 0);
