// Ampel-Logik: bewertet jede Stunde für E-MTB und Gravel
// und sucht das beste Zeitfenster je Tag.
// Stufen: 0 = grün, 1 = gelb, 2 = rot.
// Art eines Grundes: 'ampel' (bestimmt die Farbe), 'warnung' und 'hinweis' (nur Text).

const GEWITTER = [95, 96, 99];
const EISREGEN = [56, 57, 66, 67];
const SCHNEE = [71, 73, 75, 77, 85, 86];

const r0 = x => Math.round(x);
const r1 = x => (Math.round(x * 10) / 10).toLocaleString('de-DE');

// Texte zu jedem Grund. v = schlimmster Wert im Zeitfenster.
export const TEXTE = {
  gewitter:  () => 'Gewitter angesagt',
  eisregen:  () => 'Gefrierender Regen – Glatteis',
  schnee:    () => 'Schneefall angesagt',
  boeen:     v => `Starke Böen bis ${r0(v)} km/h` ,
  boeenWald: v => `Böen bis ${r0(v)} km/h – im Wald Gefahr durch Astbruch`,
  regen:     v => `Regen während der Fahrt (bis ${r1(v)} mm pro Stunde)`,
  trailnass: v => `Trails nass: ${r0(v)} mm Regen in den letzten 3 Tagen – Forstwege statt Singletrails`,
  bodenfeucht: () => 'Boden laut Modell sehr feucht',
  kalt:      v => `Kalt: gefühlt nur ${r0(v)} °C`,
  gefroren:  () => 'Boden gefroren',
  tauen:     () => 'Boden taut auf – früh fahren oder Trails meiden',
  glaette:   () => 'Glättegefahr in Schattenlagen und auf Brücken',
  laub:      () => 'Nasses Laub: rutschig, verdeckte Wurzeln',
  akku:      () => 'Akku warm lagern, erst kurz vor der Fahrt einsetzen – Reichweite sinkt',
  daemmerung: v => `Zeitfenster reicht in die Dämmerung (Sonnenuntergang ${v}) – Licht mitnehmen`,
};

// Für den Vergleich "schlimmster Wert": bei diesen zählt der kleinste Wert
const KLEINSTER_WERT = new Set(['kalt']);

function summe(stunden, i, anzahl) {
  let s = 0;
  for (let k = Math.max(0, i - anzahl + 1); k <= i; k++) s += stunden[k].regen || 0;
  return s;
}

// Tiefste Bodentemperatur der Nacht vor diesem Tag (18 Uhr Vortag bis 9 Uhr)
function nachtMinimum(stunden, i) {
  const st = stunden[i];
  const start = i - st.stunde - 6;
  const ende = i - st.stunde + 9;
  let min = Infinity;
  for (let k = Math.max(0, start); k <= Math.min(stunden.length - 1, ende); k++) {
    if (stunden[k].bodenT != null) min = Math.min(min, stunden[k].bodenT);
  }
  return min;
}

// Bewertet alle Stunden. Ergebnis: Liste mit { emtb: [gründe], gravel: [gründe], emtbStufe, gravelStufe }
export function bewerteStunden(stunden, s) {
  return stunden.map((st, i) => {
    const g = { emtb: [], gravel: [] };
    const add = (rad, id, art, stufe, wert = null) => {
      for (const r of rad === 'beide' ? ['emtb', 'gravel'] : [rad]) g[r].push({ id, art, stufe, wert });
    };
    const r24 = summe(stunden, i, 24);
    const r48 = summe(stunden, i, 48);
    const r72 = summe(stunden, i, 72);
    const monat = Number(st.datum.slice(5, 7));

    if (GEWITTER.includes(st.code)) add('beide', 'gewitter', 'ampel', 2);
    if (EISREGEN.includes(st.code)) add('beide', 'eisregen', 'ampel', 2);
    if (SCHNEE.includes(st.code)) add('beide', 'schnee', 'ampel', 1);

    // Böen
    for (const rad of ['emtb', 'gravel']) {
      const b = s.boeen[rad];
      const id = rad === 'emtb' ? 'boeenWald' : 'boeen';
      if (st.boeen >= b.rot) add(rad, id, 'ampel', 2, st.boeen);
      else if (st.boeen >= b.gelb) add(rad, id, 'ampel', 1, st.boeen);
    }

    // Regen während der Fahrt
    if (st.regen > s.regenFahrt.gelb) add('beide', 'regen', 'ampel', 1, st.regen);

    // Trailnässe (nur E-MTB), Bodenfeuchte als Zusatzsignal
    const tn = s.trailnaesse;
    const sehrFeucht = st.bodenF != null && st.bodenF >= tn.bodenfeuchteNass;
    const f = sehrFeucht ? tn.bodenfeuchteVerstaerkt : 1;
    if (r24 > tn.regen24h * f || r72 > tn.regen72h * f) add('emtb', 'trailnass', 'ampel', 1, r72);
    if (sehrFeucht) add('emtb', 'bodenfeucht', 'hinweis', 0);

    // Gefühlte Temperatur
    for (const rad of ['emtb', 'gravel']) {
      if (st.gefuehlt < s.gefuehlt[rad]) add(rad, 'kalt', 'ampel', 1, st.gefuehlt);
    }

    // Bodenfrost, Auftauen, Glätte
    if (st.bodenT != null) {
      if (st.bodenT <= s.boden.gefroren) add('beide', 'gefroren', 'hinweis', 0);
      else if (nachtMinimum(stunden, i) <= s.boden.gefroren && st.stunde >= 9) add('emtb', 'tauen', 'warnung', 0);
      if (st.bodenT <= s.boden.glaette && (r24 >= s.boden.glaetteNachRegen24h || st.regen > 0)) {
        add('beide', 'glaette', 'warnung', 0);
      }
    }

    // Laub
    if (s.laub.monate.includes(monat) && r48 >= s.laub.regen48h) add('beide', 'laub', 'warnung', 0);

    // Akku
    if (st.temp < s.akkuKalt) add('emtb', 'akku', 'hinweis', 0);

    const stufe = liste => liste.reduce((m, x) => x.art === 'ampel' ? Math.max(m, x.stufe) : m, 0);
    return { ...g, emtbStufe: stufe(g.emtb), gravelStufe: stufe(g.gravel) };
  });
}

// Darf in dieser Stunde gefahren werden (Tageslicht + Dämmerung)?
export function istHell(st, tag, s) {
  if (!tag) return false;
  const beginn = st.stunde * 60;
  return beginn + 30 >= tag.aufgangMin && beginn + 60 <= tag.untergangMin + s.daemmerungMinuten;
}

// Fasst ein Zeitfenster zusammen: Stufe = schlimmste Stunde, Gründe ohne Doppelte
export function fasseZusammen(bewertung, rad, von, bis, tag, extra = []) {
  const map = new Map();
  let stufe = 0;
  for (let i = von; i < bis; i++) {
    const b = bewertung[i];
    stufe = Math.max(stufe, b[rad + 'Stufe']);
    for (const g of b[rad]) {
      const alt = map.get(g.id);
      if (!alt) { map.set(g.id, { ...g }); continue; }
      alt.stufe = Math.max(alt.stufe, g.stufe);
      if (g.wert != null) {
        alt.wert = alt.wert == null ? g.wert
          : KLEINSTER_WERT.has(g.id) ? Math.min(alt.wert, g.wert) : Math.max(alt.wert, g.wert);
      }
    }
  }
  for (const e of extra) map.set(e.id, e);
  const reihenfolge = { ampel: 0, warnung: 1, hinweis: 2 };
  const gruende = [...map.values()].sort((a, b) =>
    reihenfolge[a.art] - reihenfolge[b.art] || b.stufe - a.stufe);
  return { stufe, gruende: gruende.map(g => ({ ...g, text: TEXTE[g.id](g.wert) })) };
}

// Bestes Fenster eines Tages für ein Rad ('emtb', 'gravel' oder 'beide').
// 'beide' = das bessere der beiden Rad-Fenster (bei Gleichstand E-MTB).
// abStunde: frühester Beginn (für heute: jetzt).
// Reihenfolge: bessere Farbe vor längerem Fenster (2 Std. grün schlägt 3 Std. gelb).
export function bestesFenster(daten, bewertung, rad, datum, abStunde, s) {
  if (rad === 'beide') {
    const e = bestesFenster(daten, bewertung, 'emtb', datum, abStunde, s);
    const g = bestesFenster(daten, bewertung, 'gravel', datum, abStunde, s);
    if (!e || !g) return e || g;
    return g.wert < e.wert ? g : e;
  }
  const tag = daten.tage.find(t => t.datum === datum);
  const idx = [];
  daten.stunden.forEach((st, i) => {
    if (st.datum === datum && st.stunde >= abStunde && istHell(st, tag, s)) idx.push(i);
  });
  let best = null;
  const laengen = [s.fenster.lang, s.fenster.kurz];
  for (const laenge of [...laengen, 1]) {
    if (laenge === 1 && best) break; // 1 Stunde nur, wenn sonst nichts passt
    for (let k = 0; k + laenge <= idx.length; k++) {
      const von = idx[k];
      if (idx[k + laenge - 1] !== von + laenge - 1) continue; // lückenlos
      let max = 0, punkte = 0, waerme = 0;
      for (let i = von; i < von + laenge; i++) {
        const st = bewertung[i][rad + 'Stufe'];
        max = Math.max(max, st);
        punkte += [0, 1, 4][st];
        waerme += daten.stunden[i].gefuehlt;
      }
      const endeMin = (daten.stunden[von].stunde + laenge) * 60;
      if (endeMin > tag.untergangMin) punkte += 0.5;
      // Farbe zählt am meisten, dann Länge, dann Durchschnitt, dann Wärme
      const wert = max * 1000 + (s.fenster.lang - laenge) * 100 + (punkte / laenge) * 10 - waerme / laenge / 10;
      if (!best || wert < best.wert) best = { von, bis: von + laenge, wert, stufe: max };
    }
  }
  return best;
}

// Zusatz-Hinweis Dämmerung für ein Fenster
export function daemmerungsHinweis(daten, von, bis) {
  const st = daten.stunden[von];
  const tag = daten.tage.find(t => t.datum === st.datum);
  const endeMin = daten.stunden[bis - 1].stunde * 60 + 60;
  if (tag && endeMin > tag.untergangMin) {
    return [{ id: 'daemmerung', art: 'warnung', stufe: 0, wert: tag.untergang }];
  }
  return [];
}

// Klartext-Empfehlung aus beiden Ampeln
export function empfehlung(emtb, gravel, alternative, tag = 'Heute') {
  const hat = (z, id) => z.gruende.some(g => g.id === id && g.art === 'ampel');
  const nurNass = emtb.stufe === 1 && emtb.gruende.filter(g => g.art === 'ampel').every(g => g.id === 'trailnass');
  let text;
  if (emtb.stufe === 2 && gravel.stufe === 2) {
    text = hat(emtb, 'gewitter') ? `Gewitter – ${tag.toLowerCase()} lieber nicht fahren.` : `${tag} lieber nicht fahren.`;
  } else if (emtb.stufe === 0 && gravel.stufe === 0) {
    text = 'Gute Bedingungen für beide Räder – ab aufs Rad!';
  } else if (nurNass && gravel.stufe === 0) {
    text = `${tag} lieber Gravel – oder mit dem E-MTB Forstwege statt Singletrails.`;
  } else if (nurNass) {
    text = 'Mit dem E-MTB: Forstwege statt Singletrails.';
  } else if (emtb.stufe > gravel.stufe) {
    text = `${tag} lieber Gravel.`;
  } else if (gravel.stufe > emtb.stufe) {
    text = `${tag} lieber E-MTB.`;
  } else {
    text = 'Fahrbar, aber mit Vorsicht.';
  }
  if (alternative && Math.max(emtb.stufe, gravel.stufe) > 0) text += ' ' + alternative;
  return text;
}
