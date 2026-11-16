// Routen: kuratierte Touren (routen/routen.json) + eigene GPX-Routen (nur im Gerät)
import { kv, alle, speichere, loesche, neueId } from './db.js';
import { leseGpx, auswerten, vereinfache, packe, entpacke, abstand, hoechsterPunkt, schreibeGpx, kuerzen } from './gpx.js';
import { el, toast, dialog, frage, zahl, RAD_NAME, ladeLeaflet, osmLayer, dateiTeilen } from './ui.js';
import { state, ortName } from './zustand.js';
import { holeWetter } from './wetter.js';
import { bewerteStunden, fasseZusammen } from './ampel.js';

const UNTERGRUND = ['Asphalt', 'Schotter', 'Waldweg', 'Trail'];
const STUFE_FARBE = ['grün', 'gelb', 'rot'];
const STUFE_EMOJI = ['🟢', '🟡', '🔴'];
let box = null;
let filter = 'alle';
let kuratiert = null;

async function ladeKuratiert() {
  if (kuratiert) return kuratiert;
  try {
    const res = await fetch('routen/routen.json', { cache: 'no-cache' });
    kuratiert = (await res.json()).map(r => ({ ...r, kuratiert: true }));
  } catch { kuratiert = []; }
  return kuratiert;
}

export async function ladeAlleRouten() {
  const eigene = (await alle('routen')).map(r => ({ ...r, eigen: true }));
  return [...await ladeKuratiert(), ...eigene];
}

export async function zeige(container) {
  box = container;
  filter = (await kv.get('routenFilter')) || 'alle';
  if (!zeige.verbunden) {
    const neu = () => { if (box?.isConnected && !box.hidden) zeichne(); };
    window.addEventListener('wetter', neu);
    window.addEventListener('daten', neu);
    zeige.verbunden = true;
  }
  await zeichne();
}

// Bei gelber Trail-Ampel wegen Nässe zuerst nässetaugliche Routen
function trailsNass() {
  return !!state.aktuell?.emtb.gruende.some(g => g.id === 'trailnass' && g.art === 'ampel');
}

async function zeichne() {
  const routen = await ladeAlleRouten();
  const pos = state.pos;
  const nass = trailsNass();
  const passend = routen.filter(r => filter === 'alle' || r.rad.includes(filter));
  for (const r of passend) r.entfernung = pos ? abstand(pos, r.start) / 1000 : null;
  passend.sort((a, b) => (nass ? (b.nass ? 1 : 0) - (a.nass ? 1 : 0) : 0) || (a.entfernung ?? 0) - (b.entfernung ?? 0));

  box.innerHTML = '';
  if (!routen.length) {
    karte?.remove(); karte = null;
    box.append(
      el('div', { class: 'karte oben-abstand' },
        el('b', {}, 'Noch keine Touren'),
        el('p', { class: 'klein-text' }, 'Die ausgesuchten Touren aus der Region kommen bald dazu. Bis dahin kannst du eine eigene GPX-Datei hinzufügen oder bei Komoot stöbern.')),
      el('button', { class: 'knopf', onclick: eigeneHinzufuegen }, '＋ Eigene GPX-Route hinzufügen'),
      komootKnopf(),
      el('p', { class: 'klein-text' }, 'Eigene Routen bleiben nur auf diesem Handy (und in deinem Backup).'),
    );
    return;
  }
  const filterBox = el('div', { class: 'chips oben-abstand' });
  for (const [w, t] of [['alle', 'Alle'], ['emtb', 'E-MTB'], ['gravel', 'Gravel']]) {
    filterBox.append(el('button', { class: 'chip' + (filter === w ? ' aktiv' : ''), onclick: async () => { filter = w; await kv.set('routenFilter', w); zeichne(); } }, t));
  }
  box.append(filterBox);

  if (nass) box.append(el('div', { class: 'grund warnung' }, '⚠︎ Trails sind gerade nass. Oben stehen die Touren, die bei Nässe gut gehen.'));

  const kartenBox = el('div', { class: 'karte-box routen-karte' });
  box.append(kartenBox);
  karteZeichnen(kartenBox, passend);

  box.append(el('h2', {}, pos ? `Routen in der Nähe von „${ortName()}“` : 'Routen'));
  if (!passend.length) {
    box.append(el('p', { class: 'klein-text' }, routen.length
      ? 'Keine Routen für diesen Filter.'
      : 'Noch keine Routen. Die ausgesuchten Touren kommen bald dazu. Du kannst schon eigene GPX-Routen hinzufügen.'));
  }
  for (const r of passend) box.append(routenKarte(r));

  box.append(
    el('button', { class: 'knopf', onclick: eigeneHinzufuegen }, '＋ Eigene GPX-Route hinzufügen'),
    el('p', { class: 'klein-text' }, 'Eigene Routen bleiben nur auf diesem Handy (und in deinem Backup).'),
    el('h2', {}, 'Keine passende Route?'),
    komootKnopf(),
  );
}

function routenKarte(r) {
  return el('button', { class: 'route', onclick: () => detail(r) },
    el('span', { class: 'fahrt-kopf' }, el('b', {}, r.name),
      el('span', {}, ...r.rad.map(x => el('span', { class: 'rad-tag ' + x }, RAD_NAME[x])))),
    el('span', {}, `${zahl(r.km, 1)} km · ${zahl(r.hm)} Hm · ${r.untergrund.join(', ')}`),
    el('span', { class: 'klein-text' },
      (r.nass ? '💧 bei Nässe geeignet' : '🚫 nicht bei Nässe'),
      r.entfernung != null ? ` · Start ${zahl(r.entfernung, r.entfernung < 10 ? 1 : 0)} km entfernt` : '',
      r.start?.name ? ` (${r.start.name})` : '',
      r.eigen ? ' · eigene' : ''),
  );
}

function komootKnopf() {
  const pos = state.pos;
  const name = state.auswahl === 'hier' ? 'Umgebung' : ortName();
  const sport = filter === 'gravel' ? 'mtb_easy' : 'mtb';
  const url = pos
    ? `https://www.komoot.com/de-de/discover/${encodeURIComponent(name)}/@${pos.lat.toFixed(2)},${pos.lon.toFixed(2)}/tours?sport=${sport}&map=true`
    : 'https://www.komoot.com/de-de/discover';
  return el('a', { class: 'knopf hell links-knopf', href: url, target: '_blank', rel: 'noopener' },
    `Touren bei Komoot suchen${pos ? ' rund um ' + (state.auswahl === 'hier' ? 'deinen Standort' : name) : ''} ↗`);
}

let karte = null;
async function karteZeichnen(k, routen) {
  try {
    const L = await ladeLeaflet();
    karte?.remove(); // alte Karte wegräumen (stoppt auch die Standortsuche)
    karte = L.map(k, { zoomControl: true });
    osmLayer(L).addTo(karte);
    const grenzen = [];
    if (state.pos) {
      L.circleMarker([state.pos.lat, state.pos.lon], { radius: 8, color: '#14532d', fillColor: '#22c55e', fillOpacity: 1 })
        .addTo(karte).bindTooltip(ortName());
      grenzen.push([state.pos.lat, state.pos.lon]);
    }
    for (const r of routen) {
      if (!r.spur) continue;
      const pts = entpacke(r.spur).map(p => [p.lat, p.lon]);
      const linie = L.polyline(pts, { color: r.rad.includes('emtb') ? '#b45309' : '#2563eb', weight: 4, opacity: 0.85 }).addTo(karte);
      linie.on('click', () => detail(r));
      linie.bindTooltip(r.name);
      grenzen.push(...pts.filter((_, i) => i % 10 === 0));
    }
    if (grenzen.length > 1) karte.fitBounds(grenzen, { padding: [20, 20], maxZoom: 13 });
    else karte.setView(grenzen[0] || [50.35, 10.0], grenzen.length ? 11 : 9);
    standortKnopf(L, karte);
    setTimeout(() => karte.invalidateSize(), 50);
  } catch (e) { k.textContent = e.message; }
}

// Blauer Punkt: "Wo bin ich?"
function standortKnopf(L, map) {
  const Knopf = L.Control.extend({
    onAdd() {
      const b = L.DomUtil.create('button', 'karte-knopf');
      b.textContent = '◎';
      b.title = 'Wo bin ich?';
      b.setAttribute('aria-label', 'Meinen Standort zeigen');
      L.DomEvent.disableClickPropagation(b);
      let punkt = null, watch = null;
      b.onclick = () => {
        if (watch != null) {
          navigator.geolocation.clearWatch(watch); watch = null; punkt?.remove(); punkt = null; b.classList.remove('an'); return;
        }
        b.classList.add('an');
        const stopp = () => { if (watch != null) navigator.geolocation.clearWatch(watch); watch = null; b.classList.remove('an'); };
        watch = navigator.geolocation.watchPosition(p => {
          // Karte nicht mehr sichtbar (andere Seite, Fenster zu)? Dann GPS aus – spart Akku
          if (!map.getContainer().isConnected || map.getContainer().offsetParent === null) { stopp(); return; }
          const ll = [p.coords.latitude, p.coords.longitude];
          if (!punkt) { punkt = L.circleMarker(ll, { radius: 9, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(map); map.setView(ll, Math.max(map.getZoom(), 14)); }
          else punkt.setLatLng(ll);
        }, () => { toast('Standort nicht verfügbar.'); b.classList.remove('an'); watch = null; },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });
        map.on('unload', stopp);
      };
      return b;
    },
  });
  new Knopf({ position: 'topright' }).addTo(map);
}

// ---------------- Detail ----------------
async function detail(r) {
  let map = null, ampel = null;
  const { inhalt, schliessen } = dialog(r.name, { onClose: () => map?.remove() });
  const k = el('div', { class: 'karte-box' });
  const ampelBox = el('div', { class: 'karte' }, el('b', {}, 'Ampel für diese Tour'), el('p', { class: 'klein-text' }, 'Lade Wetter entlang der Strecke …'));
  inhalt.append(
    el('div', { class: 'steckbrief' },
      el('div', {}, el('small', {}, 'Rad'), el('b', {}, r.rad.map(x => RAD_NAME[x]).join(' / '))),
      el('div', {}, el('small', {}, 'Länge'), el('b', {}, zahl(r.km, 1) + ' km')),
      el('div', {}, el('small', {}, 'Höhenmeter'), el('b', {}, zahl(r.hm))),
      el('div', {}, el('small', {}, 'Untergrund'), el('b', {}, r.untergrund.join(', '))),
      el('div', {}, el('small', {}, 'Bei Nässe'), el('b', {}, r.nass ? 'geeignet' : 'nicht geeignet')),
      el('div', {}, el('small', {}, 'Start'), el('b', {}, r.start?.name || '–')),
    ),
    k,
    ampelBox,
    ...(r.hinweise || []).map(h => el('div', { class: 'grund hinweis' }, 'ℹ︎ ' + h)),
    el('button', { class: 'knopf', onclick: () => gefahren(r, schliessen) }, '✓ Diese Route gefahren'),
    el('button', { class: 'knopf whatsapp', onclick: () => routeTeilen(r, ampel) }, 'Per WhatsApp teilen – wer fährt mit?'),
    el('button', { class: 'knopf hell', onclick: () => gpxWeitergeben(r) }, 'GPX an andere App geben (Komoot, Radcomputer …)'),
    el('a', { class: 'knopf hell links-knopf', target: '_blank', rel: 'noopener', href: `https://www.google.com/maps/dir/?api=1&destination=${r.start.lat},${r.start.lon}` }, 'Anfahrt zum Start ↗'),
    r.eigen ? el('button', {
      class: 'knopf hell loeschen', onclick: async () => {
        if (!await frage(`Route „${r.name}“ löschen?`, 'Löschen')) return;
        await loesche('routen', r.id); schliessen(); zeichne();
      },
    }, 'Eigene Route löschen') : null,
  );
  try {
    const L = await ladeLeaflet();
    if (!k.isConnected) return; // Fenster schon wieder zu
    map = L.map(k);
    osmLayer(L).addTo(map);
    const pts = entpacke(r.spur).map(p => [p.lat, p.lon]);
    const linie = L.polyline(pts, { color: '#b45309', weight: 5 }).addTo(map);
    L.circleMarker(pts[0], { radius: 8, color: '#14532d', fillColor: '#22c55e', fillOpacity: 1 }).addTo(map).bindTooltip('Start');
    map.fitBounds(linie.getBounds(), { padding: [20, 20] });
    standortKnopf(L, map);
    setTimeout(() => map.invalidateSize(), 50);
  } catch (e) { k.textContent = e.message; }
  ampel = await routenAmpel(r, ampelBox);
}

// Fahrt ins Fahrtenbuch übernehmen
async function gefahren(r, schliessen) {
  schliessen();
  try {
    const { formular } = await import('./fahrten.js');
    formular(null, { quelle: 'route', km: r.km, hm: r.hm, notiz: r.name, spur: r.spur, ...(r.rad.length === 1 ? { rad: r.rad[0] } : {}) });
  } catch { toast('Das Fahrtenbuch konnte nicht geladen werden (offline?).'); }
}

// Tour per WhatsApp: Eckdaten, Ampel, Startpunkt
function routeTeilen(r, ampel) {
  // Bei eigenen Routen nicht den allerersten Punkt verraten (oft die Haustür)
  const start = r.kuratiert ? r.start : kuerzen(entpacke(r.spur), 300)[0];
  const zeilen = [
    `🚲 Wer fährt mit? ${r.name}`,
    `${zahl(r.km, 1)} km · ${zahl(r.hm)} Hm · ${r.untergrund.join(', ')} · ${r.rad.map(x => RAD_NAME[x]).join(' / ')}`,
  ];
  if (ampel && state.aktuell) {
    zeilen.push(`Ampel ${state.aktuell.titel}: ` + r.rad.map(x => `${RAD_NAME[x]} ${STUFE_EMOJI[ampel[x].stufe]} ${STUFE_FARBE[ampel[x].stufe]}`).join(' · '));
  }
  zeilen.push(r.nass ? '💧 geht auch bei Nässe' : '🚫 nicht bei Nässe');
  if (start) zeilen.push(`Start${r.start?.name ? ' ' + r.start.name : ''}: https://maps.google.com/?q=${start.lat.toFixed(4)},${start.lon.toFixed(4)}`);
  zeilen.push(location.origin + location.pathname);
  window.open('https://wa.me/?text=' + encodeURIComponent(zeilen.join('\n')), '_blank');
}

// Wetter an Start, höchstem und entferntestem Punkt; schlechteste Ampel zählt
async function routenAmpel(r, ziel) {
  const f = state.aktuell?.fenster;
  if (!f || !state.daten || !state.s) {
    ziel.lastChild.textContent = 'Noch kein Wetter geladen (offline?). Tippe unten auf „Heute“ und dann auf „Nochmal versuchen“.';
    return;
  }
  const pts = entpacke(r.spur);
  const start = pts[0];
  const hoch = hoechsterPunkt(pts);
  const weit = pts.reduce((b, p) => abstand(start, p) > abstand(start, b) ? p : b, start);
  const orte = [['am Start', start], [`am höchsten Punkt${hoch.ele != null ? ' (' + zahl(hoch.ele) + ' m)' : ''}`, hoch], ['am entferntesten Punkt', weit]]
    .filter(([, p], i, a) => i === 0 || a.slice(0, i).every(([, q]) => abstand(p, q) > 1500));
  try {
    const daten = await Promise.all(orte.map(([, p]) => holeWetter(p.lat, p.lon)));
    const zeitpunkt = state.daten.stunden[f.von].t;
    const ergebnisse = { emtb: { stufe: 0, gruende: new Map() }, gravel: { stufe: 0, gruende: new Map() } };
    daten.forEach((d, n) => {
      const von = d.stunden.findIndex(s => s.t === zeitpunkt);
      if (von < 0) return;
      const bew = bewerteStunden(d.stunden, state.s);
      for (const rad of ['emtb', 'gravel']) {
        const z = fasseZusammen(bew, rad, von, von + (f.bis - f.von), null);
        ergebnisse[rad].stufe = Math.max(ergebnisse[rad].stufe, z.stufe);
        for (const g of z.gruende) {
          if (g.art === 'hinweis') continue;
          const alt = ergebnisse[rad].gruende.get(g.id);
          if (!alt || g.stufe > alt.stufe) ergebnisse[rad].gruende.set(g.id, { ...g, wo: orte[n][0] });
        }
      }
    });
    ziel.innerHTML = '';
    ziel.append(el('b', {}, 'Ampel für diese Tour'), el('p', { class: 'klein-text' }, `${state.aktuell.titel} – geprüft ${orte.map(o => o[0]).join(', ')}.`));
    for (const rad of r.rad) {
      const e = ergebnisse[rad];
      ziel.append(el('div', { class: 'routen-ampel' },
        el('span', { class: 'punkt gross', style: `background:var(--${['gruen', 'gelb', 'rot'][e.stufe]})` }),
        el('b', {}, `${RAD_NAME[rad]}: ${STUFE_FARBE[e.stufe]}`)));
      for (const g of e.gruende.values()) ziel.append(el('div', { class: 'klein-text' }, `• ${g.text} (${g.wo})`));
    }
    if (!r.nass && trailsNass()) ziel.append(el('div', { class: 'grund warnung' }, '⚠︎ Diese Tour ist bei Nässe nicht geeignet, und die Trails sind gerade nass.'));
    return ergebnisse;
  } catch {
    ziel.lastChild.textContent = 'Wetter für die Strecke nicht verfügbar (offline?).';
  }
}

async function gpxWeitergeben(r) {
  let text;
  if (r.datei) {
    try { text = await (await fetch(r.datei)).text(); } catch { /* unten */ }
  }
  if (!text) text = schreibeGpx(r.name, entpacke(r.spur));
  const name = r.name.replace(/[^\wäöüÄÖÜß-]+/g, '-').replace(/-+/g, '-') + '.gpx';
  await dateiTeilen(text, name, 'application/gpx+xml');
}

// ---------------- Eigene Route ----------------
function eigeneHinzufuegen() {
  const input = el('input', { type: 'file', hidden: true });
  document.body.append(input);
  input.addEventListener('cancel', () => input.remove());
  input.onchange = async () => {
    const datei = input.files[0];
    input.remove();
    if (!datei) return;
    let punkte, name;
    try { ({ punkte, name } = leseGpx(await datei.text())); } catch { punkte = []; }
    if (!punkte || punkte.length < 2) { toast('In der Datei ist keine Spur.', 5000); return; }
    routenFormular(punkte, name || datei.name.replace(/\.gpx$/i, ''));
  };
  input.click();
}

function routenFormular(punkte, vorschlag) {
  const w = auswerten(punkte);
  const { inhalt, schliessen } = dialog('Eigene Route');
  let raeder = ['emtb'];
  let untergrund = [];
  let nass = null;
  const name = el('input', { type: 'text', class: 'feld', maxlength: '40', value: vorschlag });
  const startName = el('input', { type: 'text', class: 'feld', maxlength: '30', placeholder: 'z. B. Parkplatz Kreuzberg' });

  const radBox = el('div', { class: 'wahl zwei' });
  const zeichneRad = () => {
    radBox.innerHTML = '';
    for (const r of ['emtb', 'gravel']) radBox.append(el('button', {
      type: 'button', class: 'knopf' + (raeder.includes(r) ? ' aktiv' : ''),
      onclick: () => { raeder = raeder.includes(r) ? raeder.filter(x => x !== r) : [...raeder, r]; zeichneRad(); },
    }, RAD_NAME[r]));
  };
  zeichneRad();
  const ugBox = el('div', { class: 'chips' });
  const zeichneUg = () => {
    ugBox.innerHTML = '';
    for (const u of UNTERGRUND) ugBox.append(el('button', {
      type: 'button', class: 'chip' + (untergrund.includes(u) ? ' aktiv' : ''),
      onclick: () => { untergrund = untergrund.includes(u) ? untergrund.filter(x => x !== u) : [...untergrund, u]; zeichneUg(); },
    }, u));
  };
  zeichneUg();
  const nassBox = el('div', { class: 'wahl zwei' });
  const zeichneNass = () => {
    nassBox.innerHTML = '';
    for (const [w2, t] of [[true, 'Ja'], [false, 'Nein']]) nassBox.append(el('button', {
      type: 'button', class: 'knopf' + (nass === w2 ? ' aktiv' : ''), onclick: () => { nass = w2; zeichneNass(); },
    }, t));
  };
  zeichneNass();

  inhalt.append(
    el('p', {}, `${zahl(w.km, 1)} km · ${zahl(w.hm)} Hm (aus der Datei)`),
    el('label', { class: 'feld-label' }, 'Name', name),
    el('p', { class: 'feld-label' }, 'Für welches Rad? (beide möglich)'), radBox,
    el('p', { class: 'feld-label' }, 'Untergrund (mehrere möglich)'), ugBox,
    el('p', { class: 'feld-label' }, 'Bei Nässe geeignet?'), nassBox,
    el('label', { class: 'feld-label' }, 'Startort (Name, freiwillig)', startName),
    el('button', {
      class: 'knopf', onclick: async () => {
        if (!name.value.trim()) { toast('Bitte einen Namen eingeben.'); return; }
        if (!raeder.length) { toast('Bitte mindestens ein Rad wählen.'); return; }
        if (!untergrund.length) { toast('Bitte den Untergrund wählen.'); return; }
        if (nass === null) { toast('Bitte angeben, ob die Route bei Nässe geht.'); return; }
        const p0 = punkte[0];
        await speichere('routen', {
          id: neueId(), name: name.value.trim(), rad: raeder, km: Math.round(w.km * 10) / 10, hm: w.hm,
          untergrund, nass, start: { name: startName.value.trim(), lat: +p0.lat.toFixed(5), lon: +p0.lon.toFixed(5) },
          spur: packe(vereinfache(punkte, 8)), erstellt: Date.now(),
        });
        schliessen();
        toast('Route gespeichert.');
        zeichne();
      },
    }, 'Speichern'),
  );
}
