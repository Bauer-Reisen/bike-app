// Fahrtenbuch: eintragen (Hand / GPX / Aufzeichnung), Statistik, Backup-Erinnerung
import { kv, alle, speichere, loesche, neueId } from './db.js';
import { leseGpx, auswerten, vereinfache, packe, entpacke, abstand } from './gpx.js';
import {
  el, toast, dialog, frage, zahl, dauer, RAD_NAME, datumLang, heuteIso,
  wochenStart, ladeLeaflet, osmLayer,
} from './ui.js';
import { melde } from './zustand.js';

let box = null;
let jahr = new Date().getFullYear();

export async function ladeFahrten() {
  return (await alle('fahrten')).sort((a, b) => b.datum.localeCompare(a.datum) || (b.erstellt || 0) - (a.erstellt || 0));
}

export async function zeige(container) {
  box = container;
  if (!zeige.verbunden) {
    window.addEventListener('daten', () => { if (box?.isConnected && !box.hidden) zeichne(); });
    zeige.verbunden = true;
  }
  await zeichne();
  pruefeUnterbrocheneAufzeichnung();
}

async function zeichne() {
  const fahrten = await ladeFahrten();
  box.innerHTML = '';
  box.append(
    el('div', { class: 'wahl zwei oben-abstand' },
      el('button', { class: 'knopf', onclick: () => formular() }, '＋ Von Hand'),
      el('button', { class: 'knopf', onclick: gpxImport }, '📄 GPX-Datei'),
    ),
    el('button', { class: 'knopf hell aufzeichnen', onclick: aufzeichnungStart },
      '⏺ Fahrt aufzeichnen', el('small', {}, ' (Display muss anbleiben) – Experiment')),
  );

  // Jahre zur Auswahl
  const jahre = [...new Set([new Date().getFullYear(), ...fahrten.map(f => Number(f.datum.slice(0, 4)))])].sort((a, b) => b - a);
  if (!jahre.includes(jahr)) jahr = jahre[0];
  box.append(el('h2', {}, 'Statistik ' + jahr));
  if (jahre.length > 1) {
    const w = el('div', { class: 'chips' });
    for (const j of jahre) w.append(el('button', { class: 'chip' + (j === jahr ? ' aktiv' : ''), onclick: () => { jahr = j; zeichne(); } }, String(j)));
    box.append(w);
  }
  box.append(statistik(fahrten, jahr));

  box.append(el('h2', {}, `Fahrten (${fahrten.length})`));
  if (!fahrten.length) {
    box.append(el('p', { class: 'klein-text' }, 'Noch keine Fahrten. Trag deine erste Fahrt ein – von Hand, aus einer GPX-Datei (z. B. aus Bosch Flow, Komoot oder Strava) oder per Aufzeichnung.'));
    return;
  }
  const liste = el('div', { class: 'fahrt-liste' });
  for (const f of fahrten) {
    const quelle = { gpx: '📄', hand: '✍︎', aufzeichnung: '⏺', route: '🗺' }[f.quelle] || '';
    liste.append(el('button', { class: 'fahrt', onclick: () => formular(f) },
      el('span', { class: 'fahrt-kopf' }, el('b', {}, datumLang(f.datum)), el('span', { class: 'rad-tag ' + f.rad }, RAD_NAME[f.rad])),
      el('span', {}, `${zahl(f.km, 1)} km · ${zahl(f.hm || 0)} Hm${f.minuten ? ' · ' + dauer(f.minuten) : ''} ${quelle}`),
      f.notiz ? el('small', {}, f.notiz) : null,
    ));
  }
  box.append(liste);
}

// ---------------- Statistik ----------------
export function kennzahlen(liste) {
  const wochen = new Set(liste.map(f => wochenStart(f.datum)));
  return {
    km: liste.reduce((a, f) => a + (f.km || 0), 0),
    hm: liste.reduce((a, f) => a + (f.hm || 0), 0),
    min: liste.reduce((a, f) => a + (f.minuten || 0), 0),
    laengste: liste.reduce((a, f) => Math.max(a, f.km || 0), 0),
    anzahl: liste.length,
    wochen: wochen.size,
  };
}

function statistik(fahrten, j) {
  const imJahr = fahrten.filter(f => f.datum.startsWith(String(j)));
  const jetzt = new Date();
  const monat = `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, '0')}`;
  const v = new Date(jetzt.getFullYear(), jetzt.getMonth() - 1, 15);
  const vormonat = `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}`;
  const MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  const raster = el('div', { class: 'statistik' });
  for (const rad of ['emtb', 'gravel']) {
    const l = imJahr.filter(f => f.rad === rad);
    const k = kennzahlen(l);
    const kmM = fahrten.filter(f => f.rad === rad && f.datum.startsWith(monat)).reduce((a, f) => a + f.km, 0);
    const kmV = fahrten.filter(f => f.rad === rad && f.datum.startsWith(vormonat)).reduce((a, f) => a + f.km, 0);
    const diff = kmM - kmV;
    const zeile = (name, wert) => el('div', { class: 'stat-zeile' }, el('span', {}, name), el('b', {}, wert));
    raster.append(el('div', { class: 'stat-karte' },
      el('h3', {}, RAD_NAME[rad]),
      el('div', { class: 'stat-gross' }, zahl(k.km), el('small', {}, ' km')),
      zeile('Höhenmeter', zahl(k.hm)),
      zeile('Fahrzeit', k.min ? dauer(k.min) : '–'),
      zeile('Längste Fahrt', k.laengste ? zahl(k.laengste, 1) + ' km' : '–'),
      zeile('Fahrten', zahl(k.anzahl)),
      zeile('Aktive Wochen', zahl(k.wochen)),
      j === jetzt.getFullYear() ? el('div', { class: 'stat-vergleich' },
        `${MONATE[jetzt.getMonth()]}: ${zahl(kmM)} km`, el('br'),
        `${MONATE[v.getMonth()]}: ${zahl(kmV)} km`,
        kmM || kmV ? el('br') : null,
        kmM || kmV ? (diff >= 0 ? `${zahl(diff)} km mehr als im Vormonat` : `${zahl(-diff)} km weniger als im Vormonat`) : null) : null,
    ));
  }
  return raster;
}

// ---------------- Formular ----------------
export function formular(f = null, vorgabe = {}) {
  const neu = !f;
  const d = { datum: heuteIso(), rad: 'emtb', km: '', hm: '', minuten: null, notiz: '', ...(f || {}), ...vorgabe };
  const { inhalt, schliessen } = dialog(neu ? 'Fahrt eintragen' : 'Fahrt bearbeiten');
  let rad = d.rad;

  const feld = (label, input) => el('label', { class: 'feld-label' }, label, input);
  const datum = el('input', { type: 'date', class: 'feld', value: d.datum, max: heuteIso() });
  const km = el('input', { type: 'text', class: 'feld', inputmode: 'decimal', autocomplete: 'off', value: d.km !== '' ? zahl(d.km, 1) : '' });
  const hm = el('input', { type: 'number', class: 'feld', inputmode: 'numeric', step: '1', min: '0', value: d.hm ?? '' });
  const std = el('input', { type: 'number', class: 'feld', inputmode: 'numeric', min: '0', placeholder: 'Std.', 'aria-label': 'Stunden', value: d.minuten ? Math.floor(d.minuten / 60) : '' });
  const min = el('input', { type: 'number', class: 'feld', inputmode: 'numeric', min: '0', max: '59', placeholder: 'Min.', 'aria-label': 'Minuten', value: d.minuten ? d.minuten % 60 : '' });
  const notiz = el('input', { type: 'text', class: 'feld', maxlength: '80', value: d.notiz || '', placeholder: 'optional, z. B. Kreuzberg-Runde' });

  // E-MTB-Zusatz für den Trainingsplan
  const STUFEN = ['Eco', 'Tour', 'Sport/eMTB', 'Turbo', 'gemischt'];
  let stufe = d.unterstuetzung || '';
  const stufenBox = el('div', { class: 'chips' });
  const zeichneStufen = () => {
    stufenBox.innerHTML = '';
    for (const s of STUFEN) stufenBox.append(el('button', { type: 'button', class: 'chip' + (s === stufe ? ' aktiv' : ''), onclick: () => { stufe = stufe === s ? '' : s; zeichneStufen(); } }, s));
  };
  zeichneStufen();
  const restakku = el('input', { type: 'number', class: 'feld', inputmode: 'numeric', min: '0', max: '100', placeholder: '%', value: d.restakku ?? '' });
  const emtbBox = el('div', { class: 'karte emtb-zusatz' },
    el('b', {}, 'Nur E-MTB (für den Trainingsplan, freiwillig)'),
    el('p', { class: 'klein-text' }, 'Meist genutzte Unterstützung'), stufenBox,
    feld('Restakku nach der Fahrt (%)', restakku));

  const radWahl = el('div', { class: 'wahl zwei' });
  const zeichneRad = () => {
    radWahl.innerHTML = '';
    for (const r of ['emtb', 'gravel']) radWahl.append(el('button', { type: 'button', class: 'knopf' + (r === rad ? ' aktiv' : ''), onclick: () => { rad = r; zeichneRad(); } }, RAD_NAME[r]));
    emtbBox.hidden = rad !== 'emtb';
  };
  zeichneRad();

  inhalt.append(
    d.quelle === 'gpx' && neu ? el('p', { class: 'klein-text' }, 'Aus der GPX-Datei gelesen – bitte prüfen und das Rad wählen.') : null,
    d.quelle === 'route' && neu ? el('p', { class: 'klein-text' }, 'Werte von der Route übernommen – passe sie an, wenn du abgekürzt oder verlängert hast.') : null,
    d.quelle === 'aufzeichnung' && neu ? el('p', { class: 'klein-text' }, 'Aus der Aufzeichnung – bitte prüfen. Höhenmeter vom Handy-GPS sind oft ungenau.') : null,
    el('p', { class: 'feld-label' }, 'Rad'), radWahl,
    feld('Datum', datum),
    el('div', { class: 'wahl zwei' }, feld('Kilometer', km), feld('Höhenmeter', hm)),
    el('p', { class: 'feld-label' }, 'Fahrzeit (Stunden und Minuten)'),
    el('div', { class: 'wahl zwei' }, std, min),
    feld('Notiz', notiz),
    emtbBox,
    el('button', {
      class: 'knopf', onclick: async () => {
        const kmWert = parseFloat(String(km.value).replace(',', '.'));
        if (!datum.value) { toast('Bitte ein Datum wählen.'); return; }
        if (!(kmWert > 0)) { toast('Bitte die Kilometer eintragen.'); km.focus(); return; }
        const minuten = (parseInt(std.value) || 0) * 60 + (parseInt(min.value) || 0);
        const fahrt = {
          ...(f || {}),
          id: f?.id || neueId(),
          erstellt: f?.erstellt || Date.now(),
          quelle: d.quelle || 'hand',
          datum: datum.value, rad, km: Math.round(kmWert * 10) / 10,
          hm: parseInt(hm.value) || 0, minuten: minuten || null,
          notiz: notiz.value.trim(),
          spur: d.spur || null,
          unterstuetzung: rad === 'emtb' ? stufe || null : null,
          restakku: rad === 'emtb' && restakku.value !== '' ? Math.max(0, Math.min(100, parseInt(restakku.value))) : null,
        };
        await speichere('fahrten', fahrt);
        await kv.set('letztesRad', rad);
        schliessen();
        toast(neu ? 'Fahrt gespeichert.' : 'Änderung gespeichert.');
        melde('daten');
        if (neu) await backupErinnerung();
      },
    }, 'Speichern'),
    !neu && f.spur ? el('button', { class: 'knopf hell', onclick: () => { schliessen(); spurZeigen(f); } }, 'Spur auf der Karte') : null,
    !neu ? el('button', {
      class: 'knopf hell loeschen', onclick: async () => {
        if (!await frage(`Fahrt vom ${datumLang(f.datum)} löschen?`, 'Löschen')) return;
        await loesche('fahrten', f.id);
        schliessen();
        melde('daten');
      },
    }, 'Löschen') : null,
  );
  if (neu && !vorgabe.rad) kv.get('letztesRad').then(r => { if (r) { rad = r; zeichneRad(); } });
}

async function backupErinnerung() {
  const n = (await alle('fahrten')).length;
  if (n % 5 !== 0) return;
  const { inhalt, schliessen } = dialog('Zeit für ein Backup');
  inhalt.append(
    el('p', {}, `Das ist deine ${n}. Fahrt. Deine Fahrten liegen nur auf diesem Handy – speichere am besten jetzt ein Backup (z. B. in „Dateien“ oder iCloud).`),
    el('button', { class: 'knopf', onclick: async () => { const { backupSpeichern } = await import('./app.js'); await backupSpeichern(); schliessen(); } }, 'Backup speichern'),
    el('button', { class: 'knopf hell', onclick: schliessen }, 'Später'),
  );
}

// ---------------- GPX-Import ----------------
function gpxImport() {
  const input = el('input', { type: 'file', hidden: true });
  document.body.append(input);
  input.addEventListener('cancel', () => input.remove());
  input.onchange = async () => {
    const datei = input.files[0];
    input.remove();
    if (!datei) return;
    try {
      const { punkte } = leseGpx(await datei.text());
      if (punkte.length < 2) { toast('In der Datei ist keine Spur. Ist es eine GPX-Datei?', 5000); return; }
      const w = auswerten(punkte);
      formular(null, {
        quelle: 'gpx', datum: w.datum || heuteIso(), km: w.km, hm: w.hm, minuten: w.minuten,
        spur: packe(vereinfache(punkte, 10)),
      });
      if (!w.minuten) toast('Die Datei enthält keine Zeiten – bitte Fahrzeit selbst eintragen.', 5000);
    } catch {
      toast('Die Datei konnte nicht gelesen werden.', 5000);
    }
  };
  input.click();
}

async function spurZeigen(f) {
  const { inhalt } = dialog(`${RAD_NAME[f.rad]} · ${datumLang(f.datum)}`);
  const k = el('div', { class: 'karte-box' });
  inhalt.append(el('p', {}, `${zahl(f.km, 1)} km · ${zahl(f.hm)} Hm`), k);
  try {
    const L = await ladeLeaflet();
    const map = L.map(k);
    osmLayer(L).addTo(map);
    const linie = L.polyline(entpacke(f.spur).map(p => [p.lat, p.lon]), { color: '#16a34a', weight: 5 }).addTo(map);
    map.fitBounds(linie.getBounds(), { padding: [20, 20] });
    setTimeout(() => map.invalidateSize(), 50);
  } catch (e) { k.textContent = e.message; }
}

// ---------------- Aufzeichnung (Experiment) ----------------
const auf = { aktiv: false, punkte: [], watch: null, lock: null, start: 0, timer: null, map: null, linie: null, pause: false, pauseSumme: 0, pauseAb: 0 };

function aufzeichnungStart() {
  const { inhalt, schliessen } = dialog('Fahrt aufzeichnen');
  const wl = 'wakeLock' in navigator;
  inhalt.append(
    el('div', { class: 'grund warnung' },
      el('b', {}, 'Experiment. '),
      'Das Display muss die ganze Zeit anbleiben. Wenn du das Handy sperrst oder die App wechselst, stoppt die Aufzeichnung. Beim Zurückkommen läuft sie weiter, die Lücke fehlt dann. ',
      'Das braucht viel Akku – eine Powerbank ist eine gute Idee.'),
    wl ? null : el('div', { class: 'grund warnung' }, 'Dein Gerät kann das Display nicht wach halten (iPhone: erst ab iOS 18.4 als Home-Bildschirm-App). Stell die automatische Sperre in den Einstellungen solange auf „Nie“.'),
    el('p', { class: 'klein-text' }, 'Für lange Touren sind Bosch Flow, Komoot oder ein Radcomputer zuverlässiger – die GPX-Datei kannst du danach hier importieren.'),
    el('button', { class: 'knopf', onclick: () => { schliessen(); aufzeichnen([]); } }, 'Aufzeichnung starten'),
  );
}

async function wachHalten() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible') {
      auf.lock = await navigator.wakeLock.request('screen');
    }
  } catch { auf.lock = null; }
}

function sichern() {
  if (!auf.aktiv) return;
  kv.set('aufzeichnung', { start: auf.start, punkte: auf.punkte });
}

function beobachten() {
  auf.watch = navigator.geolocation.watchPosition(p => {
    const c = p.coords;
    if (c.accuracy > 35) return; // zu ungenau
    const neu = { lat: c.latitude, lon: c.longitude, ele: c.altitude ?? null, t: p.timestamp };
    const letzter = auf.punkte[auf.punkte.length - 1];
    if (auf.pauseVorbei) { neu.neu = true; auf.pauseVorbei = false; }
    else if (letzter && abstand(letzter, neu) < 5) return;
    auf.punkte.push(neu);
    auf.linie?.addLatLng([neu.lat, neu.lon]);
    auf.map?.setView([neu.lat, neu.lon], auf.map.getZoom(), { animate: false });
    if (auf.punkte.length % 10 === 0) sichern();
  }, e => {
    if (e.code === 1) toast('Standort nicht erlaubt – Aufzeichnung nicht möglich.', 6000);
  }, { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 });
}

async function aufzeichnen(punkte, start = Date.now()) {
  if (!navigator.geolocation) { toast('Dein Gerät kann keinen Standort bestimmen.'); return; }
  Object.assign(auf, { aktiv: true, punkte, start, pause: false, pauseVorbei: punkte.length > 0, pauseSumme: 0, pauseAb: 0 });
  const { inhalt, dialog: dlg, schliessen } = dialog('Aufzeichnung läuft', { onClose: () => { if (auf.aktiv) stopp(false); } });
  const zeit = el('div', { class: 'auf-gross' }, '0:00:00');
  const dist = el('div', { class: 'auf-gross' }, '0,00 km');
  const k = el('div', { class: 'karte-box auf-karte' });
  const pauseKnopf = el('button', { class: 'knopf hell' }, 'Pause');
  const endeKnopf = el('button', { class: 'knopf' }, 'Beenden');
  inhalt.append(el('div', { class: 'auf-werte' }, el('div', {}, el('small', {}, 'Zeit'), zeit), el('div', {}, el('small', {}, 'Strecke'), dist)), k,
    el('div', { class: 'wahl zwei' }, pauseKnopf, endeKnopf),
    el('p', { class: 'klein-text' }, 'Display anlassen. Die Karte braucht Netz, die Aufzeichnung selbst nicht.'));

  await wachHalten();
  beobachten();
  const sichtbar = () => {
    if (document.visibilityState === 'visible' && auf.aktiv) { wachHalten(); auf.pauseVorbei = true; }
    else sichern();
  };
  document.addEventListener('visibilitychange', sichtbar);
  auf.aufraeumen = () => document.removeEventListener('visibilitychange', sichtbar);

  auf.timer = setInterval(() => {
    if (auf.pause) return; // Uhr steht während der Pause
    const s = Math.floor((Date.now() - auf.start - auf.pauseSumme) / 1000);
    zeit.textContent = `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    let m = 0;
    for (let i = 1; i < auf.punkte.length; i++) if (!auf.punkte[i].neu) m += abstand(auf.punkte[i - 1], auf.punkte[i]);
    dist.textContent = zahl(m / 1000, 2) + ' km';
  }, 1000);

  pauseKnopf.onclick = () => {
    auf.pause = !auf.pause;
    if (auf.pause) { auf.pauseAb = Date.now(); navigator.geolocation.clearWatch(auf.watch); pauseKnopf.textContent = 'Weiter'; sichern(); }
    else { auf.pauseSumme += Date.now() - auf.pauseAb; auf.pauseVorbei = true; beobachten(); pauseKnopf.textContent = 'Pause'; }
  };
  endeKnopf.onclick = async () => {
    if (!await frage('Aufzeichnung beenden und speichern?', 'Beenden') || !auf.aktiv) return;
    await stopp(true); schliessen();
  };

  try {
    const L = await ladeLeaflet();
    const p0 = auf.punkte[auf.punkte.length - 1];
    auf.map = L.map(k, { zoomControl: false }).setView(p0 ? [p0.lat, p0.lon] : [50.35, 10.0], 15);
    osmLayer(L).addTo(auf.map);
    auf.linie = L.polyline(auf.punkte.map(p => [p.lat, p.lon]), { color: '#dc2626', weight: 5 }).addTo(auf.map);
    setTimeout(() => auf.map?.invalidateSize(), 50);
  } catch { k.textContent = 'Karte nicht verfügbar (offline) – die Aufzeichnung läuft trotzdem.'; }
  dlg.scrollTop = 0;
}

async function stopp(speichern) {
  auf.aktiv = false;
  clearInterval(auf.timer);
  if (auf.watch != null) navigator.geolocation.clearWatch(auf.watch);
  auf.aufraeumen?.();
  try { await auf.lock?.release(); } catch { /* egal */ }
  auf.lock = null; auf.map = null; auf.linie = null;
  if (!speichern) {
    await kv.set('aufzeichnung', { start: auf.start, punkte: auf.punkte });
    toast('Aufzeichnung angehalten. Im Fahrtenbuch kannst du sie fortsetzen oder speichern.', 5000);
    return;
  }
  await kv.del('aufzeichnung');
  if (auf.punkte.length < 2) { toast('Zu wenige Punkte – nichts gespeichert.'); return; }
  const w = auswerten(auf.punkte);
  formular(null, { quelle: 'aufzeichnung', datum: w.datum || heuteIso(), km: w.km, hm: w.hm, minuten: w.minuten, spur: packe(vereinfache(auf.punkte, 8)) });
}

async function pruefeUnterbrocheneAufzeichnung() {
  if (auf.aktiv) return;
  const a = await kv.get('aufzeichnung');
  if (!a?.punkte?.length) return;
  const { inhalt, schliessen } = dialog('Unterbrochene Aufzeichnung');
  inhalt.append(
    el('p', {}, `Es gibt eine Aufzeichnung vom ${new Date(a.start).toLocaleString('de-DE')} mit ${a.punkte.length} Punkten.`),
    el('button', { class: 'knopf', onclick: () => { schliessen(); aufzeichnen(a.punkte, a.start); } }, 'Fortsetzen'),
    el('button', { class: 'knopf hell', onclick: async () => { schliessen(); auf.punkte = a.punkte; auf.start = a.start; await stopp(true); } }, 'Beenden und speichern'),
    el('button', { class: 'knopf hell loeschen', onclick: async () => { if (await frage('Aufzeichnung verwerfen?', 'Verwerfen')) { await kv.del('aufzeichnung'); schliessen(); } } }, 'Verwerfen'),
  );
}
