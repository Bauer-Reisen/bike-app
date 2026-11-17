import { kv, alle, speichere, loesche, neueId, backupErstellen, backupLaden } from './db.js';
import { holeWetter, jetztDE, sucheOrt } from './wetter.js';
import { schwellenFuer, VOREINSTELLUNGEN } from './schwellen.js';
import {
  bewerteStunden, bestesFenster, fasseZusammen, daemmerungsHinweis,
  empfehlung, istHell,
} from './ampel.js';

import { state, melde, ortName } from './zustand.js';
import { $, esc, toast, frage, ladeLeaflet, osmLayer, dateiTeilen, heuteIso } from './ui.js';
import { VERSION } from './version.js';
import { beimStart, seiteGeoeffnet, erklaere, rundgang, wasIstNeu } from './hilfe.js';

const CACHE_MINUTEN = 30;

// ---------------- Hilfen ----------------
const WOCHENTAG = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export function tagName(datum, heute) {
  const d = new Date(datum + 'T12:00:00');
  const h = new Date(heute + 'T12:00:00');
  const diff = Math.round((d - h) / 86400000);
  const kurz = `${WOCHENTAG[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
  if (diff === 0) return { lang: `Heute, ${kurz}`, kurz: 'Heute' };
  if (diff === 1) return { lang: `Morgen, ${kurz}`, kurz: 'Morgen' };
  return { lang: kurz, kurz };
}
const STUFE_WORT = ['Passt', 'Mit Vorsicht', 'Lieber nicht'];
const STUFE_FARBE = ['grün', 'gelb', 'rot'];
const STUFE_EMOJI = ['🟢', '🟡', '🔴'];

function status(html) { $('status').innerHTML = html; }

// ---------------- Start ----------------
async function start() {
  $('version').textContent = 'Version ' + VERSION;
  // Knöpfe zuerst – die Pannen-Hilfe muss auch gehen, wenn der Speicher klemmt
  verbindeKnoepfe();
  serviceWorker();
  pruefeUpdate();
  try { navigator.storage?.persist?.(); } catch { /* egal */ }

  try {
    state.orte = (await alle('orte')).sort(nachName);
    state.auswahl = (await kv.get('auswahl')) || 'hier';
    if (state.auswahl !== 'hier' && !state.orte.some(o => o.id === state.auswahl)) state.auswahl = 'hier';
    state.voreinstellung = (await kv.get('voreinstellung')) || 'normal';
    state.standort = (await kv.get('letzterStandort')) || null;
  } catch {
    toast('Der Speicher im Handy antwortet nicht. Starte die App bitte neu.', 6000);
  }

  installHinweis().catch(() => {});
  zeichneOrte();
  zeichneMehr();
  const start = new URLSearchParams(location.search).get('seite');
  if (start && SEITEN[start]) zeigeSeite(start);
  laden();
  beimStart().catch(() => {});
}

const nachName = (a, b) => a.name.localeCompare(b.name, 'de');

// Neue Version im Netz? Dann einmal neu laden (Handys heben die Seite lange auf)
async function pruefeUpdate() {
  if (location.hostname === 'localhost' || location.protocol === 'file:') return;
  try {
    const res = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    const { version } = await res.json();
    if (!version || version === VERSION) return;
    const sperre = 'bikeapp.neuGeladenFuer';
    try { if (sessionStorage.getItem(sperre) === version) return; sessionStorage.setItem(sperre, version); } catch { return; }
    location.replace(location.pathname + '?v=' + version);
  } catch { /* offline – egal */ }
}

// Offline-Speicher für die App-Dateien (Pannen-Hilfe ohne Netz).
// Neue Versionen werden beim nächsten Öffnen mit Netz automatisch geholt.
function serviceWorker() {
  if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
  navigator.serviceWorker.register('sw.js').catch(() => { /* ohne Offline-Speicher geht die App trotzdem */ });
}

async function installHinweis() {
  const standalone = window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  if (standalone || await kv.get('installHinweisGesehen')) return;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!ios) {
    $('installHinweis').querySelector('p').textContent =
      'Öffne das Browser-Menü und wähle „Zum Startbildschirm hinzufügen“. So bleiben deine gespeicherten Orte und Fahrten sicher erhalten.';
  }
  $('installHinweis').hidden = false;
}

// ---------------- Orte (Chips oben) ----------------
function zeichneOrte() {
  const box = $('orte');
  box.innerHTML = '';
  const chip = (id, text) => {
    const b = document.createElement('button');
    b.className = 'ort-chip';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(state.auswahl === id));
    b.textContent = text;
    b.onclick = () => {
      if (state.auswahl === id && id === 'hier') { laden(true); return; }
      state.auswahl = id;
      kv.set('auswahl', id);
      state.gewaehlt = null;
      zeichneOrte();
      laden();
    };
    box.appendChild(b);
  };
  chip('hier', '📍 Hier');
  for (const o of state.orte) chip(o.id, o.name);
  const plus = document.createElement('button');
  plus.className = 'ort-chip';
  plus.textContent = '＋ Ort';
  plus.setAttribute('aria-label', 'Ort hinzufügen');
  plus.onclick = oeffneOrtDialog;
  box.appendChild(plus);
  box.querySelector('[aria-selected="true"]')?.scrollIntoView({ inline: 'nearest', block: 'nearest' });
}

export function holeStandort() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('kein GPS'));
    navigator.geolocation.getCurrentPosition(
      p => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      e => reject(e),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

// ---------------- Wetter laden ----------------
let ladeNr = 0;
async function laden(neu = false) {
  const nr = ++ladeNr;
  $('ergebnis').hidden = !state.daten;
  let pos;
  if (state.auswahl === 'hier') {
    status('Suche deinen Standort …');
    try {
      pos = await holeStandort();
      state.standort = pos;
      kv.set('letzterStandort', pos);
    } catch (e) {
      if (state.standort && e.code !== 1) {
        pos = state.standort; // letzter bekannter Standort
      } else {
        if (nr !== ladeNr) return;
        $('ergebnis').hidden = true;
        status(`<div class="karte"><strong>Standort nicht verfügbar.</strong>
          <p>${e.code === 1
            ? 'Du hast den Standort nicht erlaubt. Am iPhone: Einstellungen → Datenschutz &amp; Sicherheit → Ortungsdienste → Safari-Websites → „Beim Verwenden“.'
            : 'Das GPS hat nicht rechtzeitig geantwortet.'}
          Oder speichere einen Lieblingsort.</p>
          <button class="knopf" id="nochmal">Nochmal versuchen</button>
          <button class="knopf hell" id="ortStatt">＋ Ort hinzufügen</button></div>`);
        $('nochmal').onclick = () => laden(true);
        $('ortStatt').onclick = oeffneOrtDialog;
        return;
      }
    }
  } else {
    const o = state.orte.find(x => x.id === state.auswahl);
    pos = { lat: o.lat, lon: o.lon };
  }
  if (nr !== ladeNr) return;
  state.pos = pos;

  const key = `cache:wetter7:${pos.lat.toFixed(2)},${pos.lon.toFixed(2)}`;
  let daten = await kv.get(key);
  const frisch = daten && Date.now() - daten.geholt < CACHE_MINUTEN * 60000;
  if (!frisch || neu) {
    status('Hole Wetterdaten …');
    try {
      daten = await holeWetter(pos.lat, pos.lon);
      kv.set(key, daten);
    } catch (e) {
      if (!daten) {
        if (nr !== ladeNr) return;
        $('ergebnis').hidden = true;
        status(`<div class="karte"><strong>Keine Wetterdaten.</strong><p>${esc(e.message)}. Bist du online?</p>
          <button class="knopf" id="nochmal">Nochmal versuchen</button></div>`);
        $('nochmal').onclick = () => laden(true);
        return;
      }
      toast('Keine Verbindung – zeige ältere Daten.');
    }
  }
  if (nr !== ladeNr) return;
  state.daten = daten;
  const uhr = new Date(daten.geholt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  status(`Stand ${uhr} Uhr · <a href="#" id="aktualisieren">aktualisieren</a>`);
  $('aktualisieren').onclick = ev => { ev.preventDefault(); laden(true); };
  berechne();
}

// ---------------- Berechnen und Zeichnen ----------------
function tageAb(heute) {
  return state.daten.tage.map(t => t.datum).filter(d => d >= heute).slice(0, 4);
}

export function abStunde(datum, jetzt) {
  if (datum !== jetzt.datum) return 0;
  return jetzt.minute < 30 ? jetzt.stunde : jetzt.stunde + 1;
}

function berechne() {
  state.s = schwellenFuer(state.voreinstellung);
  state.bewertung = bewerteStunden(state.daten.stunden, state.s);
  zeichne();
  melde('wetter');
}

function zeichne() {
  const { daten, bewertung, s } = state;
  const jetzt = jetztDE();
  const tage = tageAb(jetzt.datum);

  // Beste Fenster je Tag
  const beste = tage.map(d => ({
    datum: d,
    beide: bestesFenster(daten, bewertung, 'beide', d, abStunde(d, jetzt), s),
    emtb: bestesFenster(daten, bewertung, 'emtb', d, abStunde(d, jetzt), s),
    gravel: bestesFenster(daten, bewertung, 'gravel', d, abStunde(d, jetzt), s),
  }));

  // Ausgewähltes Fenster: gewählt, sonst bestes von heute, sonst morgen
  let fenster = null;
  if (state.gewaehlt) {
    const von = daten.stunden.findIndex(x => x.t === state.gewaehlt.t);
    if (von >= 0 && daten.stunden[von].datum >= jetzt.datum) fenster = { von, bis: Math.min(von + state.gewaehlt.laenge, daten.stunden.length) };
  }
  if (!fenster) fenster = beste.find(b => b.beide)?.beide || null;
  if (!fenster) {
    $('ergebnis').hidden = true;
    status('Für die nächsten Tage gibt es keine Stunden bei Tageslicht in den Daten.');
    return;
  }
  const datum = daten.stunden[fenster.von].datum;
  const tag = daten.tage.find(t => t.datum === datum);
  const extra = daemmerungsHinweis(daten, fenster.von, fenster.bis);
  const emtb = fasseZusammen(bewertung, 'emtb', fenster.von, fenster.bis, tag, extra);
  const gravel = fasseZusammen(bewertung, 'gravel', fenster.von, fenster.bis, tag, extra);

  // Bessere Alternative an einem anderen Tag?
  let alternative = '';
  const jetztStufe = Math.min(emtb.stufe, gravel.stufe);
  const besser = beste.find(b => b.beide && b.beide.stufe < jetztStufe && b.datum !== datum);
  if (besser) alternative = `Besser: ${fensterText(besser.beide, jetzt.datum)}.`;

  const titel = fensterText(fenster, jetzt.datum);
  $('fensterTitel').textContent = `${titel} · ${ortName()}`;
  setzeAmpel('ampel-emtb', emtb.stufe);
  setzeAmpel('ampel-gravel', gravel.stufe);
  const kurz = tagName(datum, jetzt.datum).kurz;
  const tagWort = kurz === 'Heute' || kurz === 'Morgen' ? kurz : 'Am ' + kurz.split(' ')[0];
  $('empfehlung').textContent = empfehlung(emtb, gravel, alternative, tagWort);
  zeichneGruende(emtb, gravel);
  $('eckdaten').textContent = eckdaten(fenster, tag);
  state.aktuell = { titel, emtb, gravel, tag, text: $('empfehlung').textContent, fenster: { von: fenster.von, bis: fenster.bis } };

  zeichneBaender(tage, beste, fenster, jetzt);
  $('ergebnis').hidden = false;
}

function fensterText(f, heute) {
  const st = state.daten.stunden;
  const von = st[f.von].stunde;
  const bis = st[f.bis - 1].stunde + 1;
  return `${tagName(st[f.von].datum, heute).lang} ${von}–${bis} Uhr`;
}

function setzeAmpel(id, stufe) {
  const el = $(id);
  el.dataset.stufe = stufe;
  el.querySelector('.wort').textContent = STUFE_WORT[stufe];
  el.setAttribute('aria-label', `${el.querySelector('.rad').textContent}: ${STUFE_FARBE[stufe]}, ${STUFE_WORT[stufe]}`);
}

function zeichneGruende(emtb, gravel) {
  const map = new Map();
  for (const [rad, z] of [['E-MTB', emtb], ['Gravel', gravel]]) {
    for (const g of z.gruende) {
      const alt = map.get(g.id);
      if (alt) { alt.wer.push(rad); if (g.stufe > alt.stufe) Object.assign(alt, { stufe: g.stufe, text: g.text }); }
      else map.set(g.id, { ...g, wer: [rad] });
    }
  }
  const box = $('gruende');
  box.innerHTML = '';
  if (!map.size) {
    box.innerHTML = '<div class="grund">Keine Bedenken im gewählten Zeitfenster.</div>';
    return;
  }
  const rang = { ampel: 0, warnung: 1, hinweis: 2 };
  const liste = [...map.values()].sort((a, b) => rang[a.art] - rang[b.art] || b.stufe - a.stufe);
  for (const g of liste) {
    const d = document.createElement('div');
    d.className = 'grund ' + g.art;
    const wer = g.wer.length === 2 ? 'Beide Räder' : g.wer[0];
    const symbol = g.art === 'ampel'
      ? `<span class="punkt" style="background:var(--${g.stufe === 2 ? 'rot' : 'gelb'})"></span>`
      : g.art === 'warnung' ? '⚠︎ ' : 'ℹ︎ ';
    d.innerHTML = `<span class="wer">${wer}</span>${symbol}${esc(g.text)}`;
    box.appendChild(d);
  }
}

function eckdaten(f, tag) {
  const st = state.daten.stunden.slice(f.von, f.bis);
  const tMin = Math.min(...st.map(x => x.temp)), tMax = Math.max(...st.map(x => x.temp));
  const gef = Math.min(...st.map(x => x.gefuehlt));
  const boe = Math.max(...st.map(x => x.boeen));
  const regen = st.reduce((a, x) => a + x.regen, 0);
  const r = Math.round;
  const temp = r(tMin) === r(tMax) ? `${r(tMin)} °C` : `${r(tMin)} bis ${r(tMax)} °C`;
  return `${temp}, gefühlt tiefstens ${r(gef)} °C · Böen bis ${r(boe)} km/h · Regen ${regen.toLocaleString('de-DE', { maximumFractionDigits: 1 })} mm · Sonnenuntergang ${tag.untergang} Uhr`;
}

function zeichneBaender(tage, beste, fenster, jetzt) {
  const { daten, bewertung, s } = state;
  const box = $('baender');
  box.innerHTML = '';
  for (const b of beste) {
    const tag = daten.tage.find(t => t.datum === b.datum);
    const hStart = Math.floor(tag.aufgangMin / 60);
    const hEnde = Math.ceil((tag.untergangMin + s.daemmerungMinuten) / 60);
    const idx = [];
    daten.stunden.forEach((st, i) => { if (st.datum === b.datum && st.stunde >= hStart && st.stunde < hEnde) idx.push(i); });

    const el = document.createElement('div');
    el.className = 'tag' + (daten.stunden[fenster.von].datum === b.datum ? ' gewaehlt' : '');
    const name = tagName(b.datum, jetzt.datum);
    el.innerHTML = `<div class="tag-kopf"><span>${name.lang}</span><span class="klein-text">☀︎ ${tag.aufgang}–${tag.untergang}</span></div>`;

    for (const [rad, label] of [['emtb', 'E-MTB'], ['gravel', 'Gravel']]) {
      const zeile = document.createElement('div');
      zeile.className = 'band-zeile';
      zeile.innerHTML = `<span class="name">${label}</span>`;
      const band = document.createElement('div');
      band.className = 'band';
      const best = b[rad];
      for (const i of idx) {
        const st = daten.stunden[i];
        const c = document.createElement('button');
        c.className = 'std';
        const hell = istHell(st, tag, s);
        const vorbei = st.datum === jetzt.datum && st.stunde < abStunde(st.datum, jetzt);
        const stufe = bewertung[i][rad + 'Stufe'];
        if (!hell) c.classList.add('dunkel');
        else c.dataset.stufe = stufe;
        if (vorbei) c.classList.add('vorbei');
        if (best && i >= best.von && i < best.bis) c.classList.add('best');
        if (i >= fenster.von && i < fenster.bis) c.classList.add('wahl');
        c.setAttribute('aria-label', `${label} ${st.stunde} Uhr: ${hell ? STUFE_FARBE[stufe] : 'dunkel'}`);
        if (hell && !vorbei) {
          c.onclick = ev => {
            ev.stopPropagation();
            let bis = i + 1;
            while (bis < i + s.fenster.lang && daten.stunden[bis]?.datum === st.datum && istHell(daten.stunden[bis], tag, s)) bis++;
            waehle({ von: i, bis });
          };
        } else {
          c.disabled = true;
        }
        band.appendChild(c);
      }
      zeile.appendChild(band);
      el.appendChild(zeile);
    }

    // Uhrzeiten-Skala
    const uhr = document.createElement('div');
    uhr.className = 'uhr';
    uhr.innerHTML = '<span></span>';
    const skala = document.createElement('div');
    skala.className = 'uhr-skala';
    idx.forEach((i, k) => {
      const sp = document.createElement('span');
      const h = daten.stunden[i].stunde;
      sp.textContent = (h % 3 === 0 && k < idx.length - 1) ? h : '';
      skala.appendChild(sp);
    });
    uhr.appendChild(skala);
    el.appendChild(uhr);

    const bt = document.createElement('div');
    bt.className = 'best-text';
    if (b.beide) {
      const r = b.beide;
      bt.textContent = `Bestes Fenster: ${daten.stunden[r.von].stunde}–${daten.stunden[r.bis - 1].stunde + 1} Uhr (${bewertungMit(r, STUFE_FARBE[r.stufe])})`;
    } else {
      bt.textContent = 'Heute kein Fenster mehr bei Tageslicht.';
    }
    el.appendChild(bt);

    if (b.beide) el.onclick = () => waehle(b.beide);
    box.appendChild(el);
  }
}

// Mit welchem Rad ist das Fenster so gut?
function bewertungMit(f, farbe) {
  let e = 0, g = 0;
  for (let i = f.von; i < f.bis; i++) {
    e = Math.max(e, state.bewertung[i].emtbStufe);
    g = Math.max(g, state.bewertung[i].gravelStufe);
  }
  if (e === g) return `${farbe} für beide Räder`;
  return `${farbe} fürs ${e < g ? 'E-MTB' : 'Gravel'}`;
}

function waehle(f) {
  state.gewaehlt = { t: state.daten.stunden[f.von].t, laenge: f.bis - f.von };
  zeichne();
  $('fensterTitel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------------- WhatsApp ----------------
function teilen() {
  const a = state.aktuell;
  if (!a) return;
  const zeilen = [
    `🚲 Wer fährt mit? ${a.titel}`,
    `Ort: ${ortName()}`,
    `E-MTB: ${STUFE_EMOJI[a.emtb.stufe]} ${STUFE_FARBE[a.emtb.stufe]} · Gravel: ${STUFE_EMOJI[a.gravel.stufe]} ${STUFE_FARBE[a.gravel.stufe]}`,
    a.text,
  ];
  const gruende = new Map();
  for (const g of [...a.emtb.gruende, ...a.gravel.gruende]) {
    if (g.art !== 'hinweis' && !gruende.has(g.id)) gruende.set(g.id, g.text);
  }
  for (const t of [...gruende.values()].slice(0, 4)) zeilen.push('• ' + t);
  zeilen.push(`Sonnenuntergang ${a.tag.untergang} Uhr`);
  zeilen.push(location.origin + location.pathname);
  const url = 'https://wa.me/?text=' + encodeURIComponent(zeilen.join('\n'));
  window.open(url, '_blank');
}

// ---------------- Seite "Orte & mehr" ----------------
function zeichneMehr() {
  for (const b of $('voreinstellung').querySelectorAll('button')) {
    b.classList.toggle('aktiv', b.dataset.wert === state.voreinstellung);
  }
  const ul = $('ortliste');
  ul.innerHTML = '';
  if (!state.orte.length) ul.innerHTML = '<li>Noch keine Orte gespeichert.</li>';
  for (const o of state.orte) {
    const li = document.createElement('li');
    li.innerHTML = `<span>${esc(o.name)}</span>`;
    const del = document.createElement('button');
    del.className = 'knopf klein hell';
    del.textContent = 'Löschen';
    del.onclick = async () => {
      if (!await frage(`„${o.name}“ löschen?`, 'Löschen')) return;
      await loesche('orte', o.id);
      state.orte = state.orte.filter(x => x.id !== o.id);
      if (state.auswahl === o.id) { state.auswahl = 'hier'; kv.set('auswahl', 'hier'); laden(); }
      zeichneOrte(); zeichneMehr();
    };
    li.appendChild(del);
    ul.appendChild(li);
  }
}

// Seiten: Titel, ob die Orte oben gezeigt werden, Modul (wird erst bei Bedarf geladen)
const SEITEN = {
  heute:    { titel: 'Heute fahren?', orte: true },
  routen:   { titel: 'Routen', orte: true, modul: './routen.js' },
  fahrten:  { titel: 'Fahrtenbuch', modul: './fahrten.js' },
  training: { titel: 'Training 100 km', modul: './training.js' },
  technik:  { titel: 'Technik & Panne', modul: './technik.js' },
  mehr:     { titel: 'Orte & Einstellungen' },
};
let aktuelleSeite = 'heute';

export async function zeigeSeite(name, ...args) {
  const s = SEITEN[name];
  aktuelleSeite = name;
  for (const t of document.querySelectorAll('.tab')) t.classList.toggle('aktiv', t.dataset.seite === name);
  for (const k of Object.keys(SEITEN)) $('seite-' + k).hidden = k !== name;
  $('orte').hidden = !s.orte;
  $('titel').textContent = s.titel;
  $('zuMehr').hidden = name === 'mehr';
  $('scroller').scrollTo(0, 0);
  if (!s.modul && name !== 'heute') seiteGeoeffnet(name);
  if (s.modul) {
    try {
      const m = await import(s.modul);
      if (aktuelleSeite === name) await m.zeige($('seite-' + name), ...args);
      if (aktuelleSeite === name) seiteGeoeffnet(name);
    } catch (e) {
      $('seite-' + name).innerHTML = `<div class="karte">Dieser Bereich konnte nicht geladen werden. Bist du offline?<br><small>${esc(e.message)}</small></div>`;
    }
  }
}

// ---------------- Ort-Dialog ----------------
let neuerOrt = null;
let karte = null, marker = null;

function oeffneOrtDialog() {
  neuerOrt = null;
  $('ortSuchfeld').value = '';
  $('ortTreffer').innerHTML = '';
  $('ortName').value = '';
  $('ortSpeichern').hidden = true;
  setzeModus('suche');
  $('ortDialog').showModal();
}

function setzeModus(m) {
  for (const b of $('ortModus').querySelectorAll('button')) {
    b.classList.toggle('aktiv', b.dataset.modus === m);
  }
  $('ortSuche').hidden = m !== 'suche';
  $('ortKarte').hidden = m !== 'karte';
  if (m === 'karte') zeigeKarte();
}

async function zeigeKarte() {
  let L;
  try { L = await ladeLeaflet(); } catch (e) { toast(e.message); return; }
  const mitte = state.auswahl === 'hier' && state.standort
    ? [state.standort.lat, state.standort.lon]
    : (() => { const o = state.orte.find(x => x.id === state.auswahl); return o ? [o.lat, o.lon] : [50.35, 10.0]; })();
  if (!karte) {
    karte = L.map('karte', { zoomControl: true }).setView(mitte, 11);
    osmLayer(L).addTo(karte);
    karte.on('click', ev => {
      if (marker) marker.setLatLng(ev.latlng);
      else marker = L.marker(ev.latlng).addTo(karte);
      neuerOrt = { lat: ev.latlng.lat, lon: ev.latlng.lng };
      $('ortSpeichern').hidden = false;
      $('ortName').focus();
    });
  } else {
    karte.setView(mitte, 11);
  }
  setTimeout(() => karte.invalidateSize(), 50);
}

let suchTimer = null;
function suche() {
  clearTimeout(suchTimer);
  const q = $('ortSuchfeld').value.trim();
  if (q.length < 2) { $('ortTreffer').innerHTML = ''; return; }
  suchTimer = setTimeout(async () => {
    try {
      const liste = await sucheOrt(q);
      const ul = $('ortTreffer');
      ul.innerHTML = liste.length ? '' : '<li class="klein-text">Nichts gefunden.</li>';
      for (const t of liste) {
        const li = document.createElement('li');
        const b = document.createElement('button');
        b.innerHTML = `${esc(t.name)}<small>${esc(t.zusatz)}</small>`;
        b.onclick = () => {
          neuerOrt = { lat: t.lat, lon: t.lon };
          $('ortName').value = t.name;
          $('ortSpeichern').hidden = false;
          ul.innerHTML = '';
          $('ortSuchfeld').value = t.name + (t.zusatz ? ', ' + t.zusatz : '');
        };
        li.appendChild(b);
        ul.appendChild(li);
      }
    } catch (e) { toast(e.message); }
  }, 400);
}

async function ortSpeichern() {
  const name = $('ortName').value.trim();
  if (!neuerOrt) { toast('Bitte erst einen Ort suchen oder auf die Karte tippen.'); return; }
  if (!name) { toast('Bitte gib dem Ort einen Namen.'); $('ortName').focus(); return; }
  const o = { id: neueId(), name, lat: neuerOrt.lat, lon: neuerOrt.lon };
  await speichere('orte', o);
  state.orte.push(o);
  state.orte.sort(nachName);
  state.auswahl = o.id;
  kv.set('auswahl', o.id);
  state.gewaehlt = null;
  $('ortDialog').close();
  zeichneOrte(); zeichneMehr();
  if (aktuelleSeite === 'mehr') zeigeSeite('heute');
  laden();
  toast(`„${name}“ gespeichert.`);
}

// ---------------- Backup ----------------
export async function backupSpeichern() {
  const json = await backupErstellen();
  const name = `bike-app-backup-${heuteIso()}.json`;
  const ok = await dateiTeilen(JSON.stringify(json), name, 'application/json');
  if (ok) {
    await kv.set('letztesBackup', Date.now());
    zeigeBackupStand();
  }
}

async function zeigeBackupStand() {
  const t = await kv.get('letztesBackup');
  $('backupStand').textContent = t
    ? 'Letztes Backup: ' + new Date(t).toLocaleDateString('de-DE')
    : 'Noch kein Backup gespeichert.';
}

async function backupDatei(ev) {
  const f = ev.target.files[0];
  ev.target.value = '';
  if (!f) return;
  try {
    const json = JSON.parse(await f.text());
    const n = await backupLaden(json);
    state.orte = (await alle('orte')).sort(nachName);
    state.voreinstellung = (await kv.get('voreinstellung')) || 'normal';
    zeichneOrte(); zeichneMehr();
    if (state.daten) berechne();
    melde('daten');
    toast(`Backup geladen (${n} Einträge).`);
  } catch (e) {
    toast(e instanceof SyntaxError ? 'Die Datei ist beschädigt oder kein Backup.' : e.message, 5000);
  }
}

// ---------------- Knöpfe ----------------
function verbindeKnoepfe() {
  for (const t of document.querySelectorAll('.tab')) t.onclick = () => zeigeSeite(t.dataset.seite);
  $('zuMehr').onclick = () => { zeigeSeite('mehr'); zeigeBackupStand(); };
  $('panneHeute').onclick = () => zeigeSeite('technik', 'panne');
  $('hilfeKnopf').onclick = () => erklaere(aktuelleSeite);
  $('rundgangNochmal').onclick = () => rundgang();
  $('wasIstNeu').onclick = () => wasIstNeu();
  $('appTeilen').onclick = async () => {
    const url = 'https://bauer-reisen.github.io/bike-app/';
    try {
      if (navigator.share) { await navigator.share({ title: 'Bike-App', text: 'Bike-App: Heute fahren? Routen, Fahrtenbuch, Training', url }); return; }
      await navigator.clipboard.writeText(url);
      toast('Link kopiert.');
    } catch (err) {
      if (err?.name !== 'AbortError') toast('Link: ' + url, 6000);
    }
  };
  $('installOk').onclick = () => { $('installHinweis').hidden = true; kv.set('installHinweisGesehen', true); };
  $('teilen').onclick = teilen;
  for (const b of $('voreinstellung').querySelectorAll('button')) {
    b.onclick = () => {
      state.voreinstellung = b.dataset.wert;
      kv.set('voreinstellung', b.dataset.wert);
      zeichneMehr();
      if (state.daten) berechne();
      toast(`Voreinstellung: ${VOREINSTELLUNGEN[b.dataset.wert].name}`);
    };
  }
  $('ortNeu').onclick = oeffneOrtDialog;
  $('ortDialogZu').onclick = () => $('ortDialog').close();
  for (const b of $('ortModus').querySelectorAll('button')) b.onclick = () => setzeModus(b.dataset.modus);
  $('ortSuchfeld').oninput = suche;
  $('ortOk').onclick = ortSpeichern;
  $('ortName').onkeydown = e => { if (e.key === 'Enter') ortSpeichern(); };
  $('backupSpeichern').onclick = () => backupSpeichern().catch(e => toast(e.message));
  $('backupLaden').onclick = () => $('backupDatei').click();
  $('backupDatei').onchange = backupDatei;
  // Beim Zurückkommen in die App: Daten auffrischen, wenn alt
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    pruefeUpdate();
    if (state.daten && Date.now() - state.daten.geholt > CACHE_MINUTEN * 60000) laden();
  });
}

start();
