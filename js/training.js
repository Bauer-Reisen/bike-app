// Trainingsmodus 100 km: Wochenziele, Fortschritt aus dem Fahrtenbuch, ohne Druck
import { alle, speichere, loesche } from './db.js';
import { el, toast, frage, zahl, dauer, RAD_NAME, heuteIso, plusTage, wochenStart, datumKurz, datumLang } from './ui.js';
import { state } from './zustand.js';
import { bestesFenster } from './ampel.js';
import { jetztDE } from './wetter.js';

const ZIEL_MARKE = 75;        // Zielmarke auf dem Balken
const SPITZE = 75;            // längste Trainingsfahrt (70–80 km)
const MAX_STEIGERUNG = 1.15;  // höchstens +15 % je Aufbauwoche
const MAX_WOCHEN = 12;
const EMTB_KMH = 14;          // grobe Schätzung für Fahrzeit im Gelände mit Unterstützung

let box = null;

export async function zeige(container) {
  box = container;
  if (!zeige.verbunden) {
    const neu = () => { if (box?.isConnected && !box.hidden) zeichne(); };
    window.addEventListener('wetter', neu);
    window.addEventListener('daten', neu);
    zeige.verbunden = true;
  }
  await zeichne();
}

const runde5 = x => Math.max(5, Math.round(x / 5) * 5);
const wochenZwischen = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / (7 * 86400000));

async function zeichne() {
  const plan = (await alle('plan')).find(p => p.id === 'plan');
  box.innerHTML = '';
  if (!plan) return eingabe();
  await auswerten(plan);
  ansicht(plan);
}

// ---------------- Plan erstellen ----------------
export function erstellePlan({ event, rad, tage, hmEvent, startKm }, heute = heuteIso()) {
  const eventWoche = wochenStart(event);
  let start = wochenStart(heute);
  let wochen = wochenZwischen(start, eventWoche) + 1; // inkl. Event-Woche
  if (wochen > MAX_WOCHEN) { start = plusTage(eventWoche, -7 * (MAX_WOCHEN - 1)); wochen = MAX_WOCHEN; }
  const aufbau = Math.max(0, wochen - 1); // letzte Woche ruhig
  const stufen = [];
  const anzahlLang = aufbau - Math.floor(aufbau / 3);
  const s0 = Math.min(Math.max(startKm * 1.1, 20), SPITZE);
  const spitze = anzahlLang > 1 ? Math.min(Math.max(SPITZE, s0), s0 * MAX_STEIGERUNG ** (anzahlLang - 1)) : s0;
  let n = 0, letzte = s0;
  for (let w = 0; w < aufbau; w++) {
    if ((w + 1) % 3 === 0) { stufen.push({ km: runde5(letzte * 0.7), entlastung: true }); continue; }
    const km = anzahlLang > 1 ? s0 * (spitze / s0) ** (n / (anzahlLang - 1)) : s0;
    letzte = km; n++;
    stufen.push({ km: runde5(km), entlastung: false });
  }
  return {
    id: 'plan', event, rad, tage, hmEvent: hmEvent || null, startKm,
    start, p: 0, ausgewertetBis: plusTage(start, -7), wiederholen: null, verlauf: {},
    stufen, erstellt: heute,
  };
}

async function eingabe(alt = null) {
  const fahrten = await alle('fahrten');
  const vor4 = plusTage(heuteIso(), -28);
  let rad = alt?.rad || 'emtb';
  let tage = alt?.tage || 3;
  const laengste = r => fahrten.filter(f => f.rad === r && f.datum >= vor4).reduce((m, f) => Math.max(m, f.km), 0);

  const event = el('input', { type: 'date', class: 'feld', min: plusTage(heuteIso(), 7), value: alt?.event || '' });
  const km = el('input', { type: 'text', class: 'feld', inputmode: 'decimal', autocomplete: 'off', value: Math.round(laengste(rad)) || '' });
  const hm = el('input', { type: 'number', class: 'feld', inputmode: 'numeric', min: '0', placeholder: 'z. B. 1500', value: alt?.hmEvent || '' });
  const kmHinweis = el('p', { class: 'klein-text' });
  const hmBox = el('label', { class: 'feld-label' }, 'Höhenmeter des Events', hm);

  const radBox = el('div', { class: 'wahl zwei' });
  const zeichneRad = () => {
    radBox.innerHTML = '';
    for (const r of ['emtb', 'gravel']) radBox.append(el('button', { class: 'knopf' + (r === rad ? ' aktiv' : ''), onclick: () => { rad = r; km.value = Math.round(laengste(r)) || ''; zeichneRad(); } }, RAD_NAME[r]));
    hmBox.hidden = rad !== 'emtb';
    const l = laengste(rad);
    kmHinweis.textContent = l ? `Aus deinem Fahrtenbuch vorgeschlagen (${RAD_NAME[rad]}, letzte 4 Wochen). Du kannst den Wert ändern.` : 'Kein Eintrag im Fahrtenbuch in den letzten 4 Wochen – trag eine Schätzung ein.';
  };
  zeichneRad();
  const tageBox = el('div', { class: 'chips' });
  const zeichneTage = () => {
    tageBox.innerHTML = '';
    for (let t = 2; t <= 6; t++) tageBox.append(el('button', { class: 'chip gross' + (t === tage ? ' aktiv' : ''), onclick: () => { tage = t; zeichneTage(); } }, String(t)));
  };
  zeichneTage();

  box.append(
    el('h2', {}, 'Dein Weg zu 100 km'),
    el('p', {}, 'Ein Plan mit Wochenzielen statt festen Tagen. Du bestimmst das Tempo – verpasste Wochen verschieben den Plan einfach.'),
    el('label', { class: 'feld-label' }, 'Datum des Events (oder deiner 100-km-Tour)', event),
    el('p', { class: 'feld-label' }, 'Mit welchem Rad?'), radBox,
    el('label', { class: 'feld-label' }, 'Längste Fahrt der letzten 4 Wochen (km)', km), kmHinweis,
    el('p', { class: 'feld-label' }, 'Wie viele Tage pro Woche kannst du fahren?'), tageBox,
    hmBox,
    el('button', {
      class: 'knopf', onclick: async () => {
        if (!event.value) { toast('Bitte das Datum des Events wählen.'); return; }
        if (event.value < plusTage(heuteIso(), 7)) { toast('Das Event sollte mindestens eine Woche entfernt sein.'); return; }
        const startKm = parseFloat(String(km.value).replace(',', '.')) || 0;
        if (rad === 'emtb' && !(parseInt(hm.value) > 0)) { toast('Bitte die Höhenmeter des Events eintragen.'); hm.focus(); return; }
        const plan = erstellePlan({ event: event.value, rad, tage, hmEvent: rad === 'emtb' ? parseInt(hm.value) : null, startKm });
        await speichere('plan', plan);
        zeichne();
      },
    }, 'Plan erstellen'),
    hinweisArzt(),
  );
}

const hinweisArzt = () => el('p', { class: 'klein-text arzt' },
  'Der Plan ersetzt keine ärztliche Beratung. Bei Vorerkrankungen oder Wiedereinstieg vorher abklären lassen.');

// ---------------- Wochen auswerten (aus dem Fahrtenbuch) ----------------
async function auswerten(plan) {
  const fahrten = (await alle('fahrten')).filter(f => f.rad === plan.rad);
  const dieseWoche = wochenStart(heuteIso());
  let w = plusTage(plan.ausgewertetBis, 7);
  let geaendert = false;
  while (w < dieseWoche && w < wochenStart(plan.event)) {
    const ziel = plan.stufen[plan.p];
    const ende = plusTage(w, 6);
    const lang = fahrten.filter(f => f.datum >= w && f.datum <= ende).reduce((m, f) => Math.max(m, f.km), 0);
    const geschafft = ziel && lang >= ziel.km * 0.9;
    plan.verlauf[w] = { ziel: ziel?.km ?? null, lang, geschafft, entlastung: !!ziel?.entlastung };
    if (w >= plan.start && geschafft && plan.wiederholen !== w) plan.p = Math.min(plan.p + 1, plan.stufen.length - 1);
    plan.ausgewertetBis = w;
    w = plusTage(w, 7);
    geaendert = true;
  }
  if (geaendert) await speichere('plan', plan);
}

// ---------------- Ansicht ----------------
async function ansicht(plan) {
  const heute = heuteIso();
  const woche = wochenStart(heute);
  const eventWoche = wochenStart(plan.event);
  const bisEvent = Math.max(0, wochenZwischen(woche, eventWoche));
  const fahrten = (await alle('fahrten')).filter(f => f.rad === plan.rad);
  const laengste = fahrten.filter(f => f.datum >= plan.erstellt).reduce((m, f) => Math.max(m, f.km), 0);
  const vorStart = woche < plan.start;
  const eventVorbei = heute > plan.event;
  const ruhewoche = woche === eventWoche;
  const ziel = plan.stufen[plan.p];
  const spitze = Math.max(...plan.stufen.map(s => s.km), 0);

  box.append(
    el('div', { class: 'karte' },
      el('div', { class: 'fahrt-kopf' }, el('b', {}, `${RAD_NAME[plan.rad]} · Event ${datumLang(plan.event)}`)),
      el('div', { class: 'stat-gross' }, eventVorbei ? 'Event vorbei' : bisEvent === 0 ? 'Event-Woche' : `${bisEvent} ${bisEvent === 1 ? 'Woche' : 'Wochen'}`, el('small', {}, eventVorbei || bisEvent === 0 ? '' : ' bis zum Event')),
      balken(laengste),
    ),
  );

  if (eventVorbei) {
    box.append(el('p', {}, 'Wie war’s? Trag die Fahrt ins Fahrtenbuch ein. Für ein neues Ziel einfach einen neuen Plan erstellen.'),
      el('button', { class: 'knopf', onclick: neuerPlan }, 'Neuen Plan erstellen'), hinweisArzt());
    return;
  }

  // Ehrlicher Hinweis bei zu wenig Wochen
  const restWochen = Math.max(0, wochenZwischen(woche, eventWoche));
  const erreichbar = Math.max(...plan.stufen.slice(plan.p, plan.p + Math.max(1, restWochen)).map(s => s.km), ziel?.km || 0);
  if (!plan.stufen.length) {
    box.append(el('div', { class: 'grund hinweis' }, 'Bis zum Event ist zu wenig Zeit für einen Aufbauplan. Fahr bis dahin locker und ruh dich vor dem Event aus.'));
  } else if (erreichbar < 70) {
    box.append(el('div', { class: 'grund hinweis' },
      `Ehrlich gesagt: Bis zum Event reicht die Zeit für eine längste Trainingsfahrt von etwa ${zahl(erreichbar)} km – statt die Steigerung steiler zu machen, bleibt der Plan gemütlich. `,
      'Die 100 km sind trotzdem möglich, wenn du sie ruhig angehst und Pausen einplanst. Oder du wählst für dieses Mal ein kürzeres Ziel.'));
  }

  // Diese Woche
  box.append(el('h2', {}, vorStart ? `Plan startet am ${datumKurz(plan.start)}` : ruhewoche ? 'Diese Woche: ruhig' : 'Diese Woche'));
  if (vorStart) {
    box.append(el('p', {}, 'Bis dahin: einfach regelmäßig locker fahren, so wie es dir Spaß macht.'));
  } else if (ruhewoche) {
    box.append(el('div', { class: 'karte' },
      el('p', {}, 'Keine lange Fahrt mehr. 1–2 kurze, lockere Runden halten die Beine frisch.'),
      el('p', {}, 'Rad checken (Reifen, Bremsen, Kette), Akku voll laden, Verpflegung planen. Gut schlafen.')));
  } else if (ziel) {
    const lang = fahrten.filter(f => f.datum >= woche && f.datum <= plusTage(woche, 6)).reduce((m, f) => Math.max(m, f.km), 0);
    const kurz = plan.tage >= 3 ? 2 : 1;
    const kurzKm = Math.max(15, runde5(ziel.km * 0.35));
    box.append(el('div', { class: 'karte woche' },
      ziel.entlastung ? el('p', { class: 'entlastung' }, '🌿 Entlastungswoche – der Körper baut jetzt auf.') : null,
      el('p', {}, el('b', {}, 'Lange Fahrt: '), `${zahl(ziel.km)} km`,
        plan.rad === 'emtb' ? ` · ca. ${dauer(ziel.km / EMTB_KMH * 60)} und ${zahl(runde5(plan.hmEvent * ziel.km / 100) )} Hm` : ''),
      el('p', {}, el('b', {}, `Dazu ${kurz} kurze, lockere ${kurz === 1 ? 'Runde' : 'Runden'}: `), `je etwa ${zahl(kurzKm)} km – Tempo, bei dem du dich unterhalten kannst.`),
      lang >= ziel.km * 0.9
        ? el('p', { class: 'geschafft' }, `✓ Lange Fahrt geschafft (${zahl(lang, 1)} km). Schön!`)
        : lang ? el('p', { class: 'klein-text' }, `Längste Fahrt diese Woche bisher: ${zahl(lang, 1)} km.`) : null,
      lang >= ziel.km * 0.9 ? null : besterTag(plan, woche),
      plan.rad === 'emtb' ? akkuNotiz(fahrten, woche, ziel) : null,
    ));
    box.append(el('div', { class: 'wahl zwei' },
      el('button', { class: 'knopf hell', onclick: () => wiederholen(plan, woche) }, plan.wiederholen === woche ? '✓ Wird wiederholt' : 'Woche wiederholen'),
      el('button', { class: 'knopf hell', disabled: plan.p === 0, onclick: () => zurueck(plan) }, 'Eine Stufe zurück')));
    box.append(el('p', { class: 'klein-text' }, 'Du bestimmst das Tempo. Klappt eine Woche nicht, geht es nächste Woche mit demselben Ziel weiter.'));
  }

  // Ausblick
  box.append(el('h2', {}, 'Wochen bis zum Event'));
  const liste = el('div', { class: 'wochen-liste' });
  let p = plan.p;
  for (let w = vorStart ? plan.start : woche, i = 0; w <= eventWoche; w = plusTage(w, 7), i++) {
    const istEvent = w === eventWoche;
    const s = plan.stufen[Math.min(p, plan.stufen.length - 1)];
    liste.append(el('div', { class: 'wochen-zeile' + (w === woche ? ' jetzt' : '') },
      el('span', {}, `${datumKurz(w)}`),
      el('span', {}, istEvent ? '🏁 Ruhig + Event' : s ? `${s.entlastung ? '🌿 ' : ''}${zahl(s.km)} km` : '–')));
    if (!istEvent && w >= plan.start) p++;
  }
  box.append(liste);

  // Bisheriger Verlauf (ohne rote Warnungen)
  const vergangen = Object.entries(plan.verlauf).filter(([w]) => w >= plan.start).sort();
  if (vergangen.length) {
    box.append(el('h3', {}, 'Bisher'));
    for (const [w, v] of vergangen) {
      box.append(el('div', { class: 'wochen-zeile' }, el('span', {}, datumKurz(w)),
        el('span', {}, v.geschafft ? `✓ ${zahl(v.lang, 1)} km` : v.lang ? `${zahl(v.lang, 1)} km – Ziel wandert mit` : 'Pause – Ziel wandert mit')));
    }
  }

  box.append(
    el('button', { class: 'knopf hell', onclick: neuerPlan }, 'Plan ändern oder neu erstellen'),
    hinweisArzt(),
  );
}

function balken(laengste) {
  const anteil = Math.min(100, laengste);
  return el('div', { class: 'balken-box' },
    el('div', { class: 'klein-text' }, `Längste Fahrt auf dem Weg zur 100: ${zahl(laengste, 1)} km`),
    el('div', { class: 'balken', role: 'img', 'aria-label': `${zahl(laengste)} von 100 km, Zielmarke 75 km` },
      el('div', { class: 'balken-fuell', style: `width:${anteil}%` }),
      el('div', { class: 'balken-marke', style: `left:${ZIEL_MARKE}%` })),
    el('div', { class: 'balken-skala' }, el('span', {}, '0'), el('span', { style: `left:${ZIEL_MARKE}%` }, `${ZIEL_MARKE}`), el('span', {}, '100 km')));
}

// Bester Tag dieser Woche aus der Ampel
function besterTag(plan, woche) {
  if (!state.daten || !state.bewertung) return el('p', { class: 'klein-text' }, 'Sobald das Wetter geladen ist (Seite „Heute“), schlägt die App hier den besten Tag für die lange Fahrt vor.');
  const jetzt = jetztDE();
  const ende = plusTage(woche, 6);
  let best = null;
  for (const t of state.daten.tage) {
    if (t.datum < jetzt.datum || t.datum > ende) continue;
    const ab = t.datum === jetzt.datum ? (jetzt.minute < 30 ? jetzt.stunde : jetzt.stunde + 1) : 0;
    const f = bestesFenster(state.daten, state.bewertung, plan.rad, t.datum, ab, state.s);
    if (f && (!best || f.wert < best.f.wert)) best = { t, f };
  }
  if (!best) return el('p', { class: 'klein-text' }, 'Für den Rest dieser Woche gibt es noch keine Wettervorhersage.');
  const st = state.daten.stunden[best.f.von];
  return el('p', { class: 'bester-tag' }, el('span', { class: 'punkt', style: `background:var(--${['gruen', 'gelb', 'rot'][best.f.stufe]})` }),
    `Bester Tag für die lange Fahrt: ${datumKurz(best.t.datum)}, ab etwa ${st.stunde} Uhr (Ampel ${['grün', 'gelb', 'rot'][best.f.stufe]}).`);
}

// Nach jeder langen E-MTB-Fahrt: Unterstützung und Restakku notieren
function akkuNotiz(fahrten, woche, ziel) {
  const lange = fahrten.filter(f => f.datum >= woche && f.datum <= plusTage(woche, 6) && f.km >= ziel.km * 0.9)
    .sort((a, b) => b.km - a.km)[0];
  if (!lange) return el('p', { class: 'klein-text' }, 'Nach der langen Fahrt: Notiere im Fahrtenbuch Unterstützungsstufe und Restakku – so lernst du, wie weit dein Akku reicht.');
  if (lange.restakku != null) return el('p', { class: 'klein-text' }, `🔋 ${lange.unterstuetzung || '–'}, Restakku ${lange.restakku} % nach ${zahl(lange.km, 1)} km.`);
  return el('button', {
    class: 'knopf hell', onclick: async () => { const { formular } = await import('./fahrten.js'); formular(lange); },
  }, '🔋 Unterstützung und Restakku notieren');
}

async function wiederholen(plan, woche) {
  plan.wiederholen = plan.wiederholen === woche ? null : woche;
  await speichere('plan', plan);
  toast(plan.wiederholen ? 'Diese Woche wird wiederholt – nächste Woche gilt dasselbe Ziel.' : 'Wiederholen aufgehoben.');
  zeichne();
}

async function zurueck(plan) {
  plan.p = Math.max(0, plan.p - 1);
  await speichere('plan', plan);
  toast('Eine Stufe zurück. Kein Problem!');
  zeichne();
}

async function neuerPlan() {
  const alt = (await alle('plan')).find(p => p.id === 'plan');
  if (alt && !await frage('Den aktuellen Plan ersetzen? Deine Fahrten bleiben erhalten.', 'Neu erstellen')) return;
  await loesche('plan', 'plan');
  box.innerHTML = '';
  eingabe(alt);
}

