// Prüft den Trainingsplan-Aufbau. Aufruf: node tools/check-training.mjs
import { erstellePlan } from '../js/training.js';
let fehler = 0;
function pruefe(name, eingabe, heute, test) {
  const p = erstellePlan(eingabe, heute);
  const km = p.stufen.map(s => (s.entlastung ? '(' + s.km + ')' : s.km)).join(' ');
  const ok = test(p);
  if (!ok) fehler++;
  console.log(`${ok ? 'OK  ' : 'FEHLER'} ${name}: Start ${p.start}, ${p.stufen.length} Aufbauwochen: ${km}`);
}
const basis = { rad: 'gravel', tage: 3, hmEvent: null };
const spitze = p => Math.max(...p.stufen.map(s => s.km));
const steigungOk = p => { let l = 0; for (const s of p.stufen) { if (s.entlastung) continue; if (l && s.km > l * 1.2 + 5) return false; l = s.km; } return true; };
pruefe('10 Wochen, Start 30 km', { ...basis, event: '2027-01-24', startKm: 30 }, '2026-11-13', p => p.stufen.length === 10 && spitze(p) >= 55 && steigungOk(p) && p.stufen[2].entlastung);
pruefe('20 Wochen → 12er-Plan', { ...basis, event: '2027-04-04', startKm: 40 }, '2026-11-13', p => p.stufen.length === 11 && spitze(p) >= 70 && spitze(p) <= 80 && p.start > '2026-11-13');
pruefe('4 Wochen → flacher', { ...basis, event: '2026-12-10', startKm: 30 }, '2026-11-13', p => spitze(p) < 70 && steigungOk(p));
pruefe('Schon fit (80 km)', { ...basis, event: '2027-01-24', startKm: 80 }, '2026-11-13', p => spitze(p) <= 80);
pruefe('Nur 1 Woche', { ...basis, event: '2026-11-20', startKm: 30 }, '2026-11-13', p => p.stufen.length <= 1);
pruefe('Ohne Vorfahrten (0 km)', { ...basis, event: '2027-02-07', startKm: 0 }, '2026-11-13', p => p.stufen[0].km === 20 && steigungOk(p));
console.log(fehler ? `\n${fehler} Fehler` : '\nAlles in Ordnung.');
process.exit(fehler ? 1 : 0);
