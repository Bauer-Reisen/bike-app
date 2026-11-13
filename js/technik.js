// Technikseite: Rad-Grafik, Teile, Anleitungen Schritt für Schritt, Pannen-Modus
import { TEILE, ANLEITUNGEN, PANNEN } from './technik-daten.js';
import { radSvg } from './rad-grafik.js';
import { kv } from './db.js';
import { el, toast } from './ui.js';

let box = null;
let rad = 'emtb';

export async function zeige(container, modus) {
  box = container;
  rad = (await kv.get('technikRad')) || 'emtb';
  if (modus === 'panne') panne();
  else uebersicht();
}

function oben() { scrollTo(0, 0); }

// ---------------- Übersicht ----------------
function uebersicht(teilId) {
  box.innerHTML = '';
  box.append(
    el('button', { class: 'knopf panne', onclick: panne }, '🛠 Panne? Hilfe – auch ohne Netz'),
    el('h2', {}, 'Dein Rad'),
    el('div', { class: 'wahl zwei' },
      el('button', { class: 'knopf' + (rad === 'emtb' ? ' aktiv' : ''), onclick: () => wechsle('emtb') }, 'E-MTB'),
      el('button', { class: 'knopf' + (rad === 'gravel' ? ' aktiv' : ''), onclick: () => wechsle('gravel') }, 'Gravel')),
    el('p', { class: 'klein-text' }, 'Tippe auf ein Teil in der Grafik oder unten in der Liste.'),
  );
  const grafik = el('div', { class: 'rad-box', html: radSvg(rad) });
  box.append(grafik);
  const info = el('div', { id: 'teilInfo' });
  box.append(info);

  grafik.addEventListener('click', ev => {
    const g = ev.target.closest('[data-teil]');
    if (g) zeigeTeil(g.dataset.teil, grafik, info);
  });

  const liste = el('div', { class: 'teile-liste' });
  for (const [id, t] of Object.entries(TEILE)) {
    if (!t.raeder.includes(rad)) continue;
    liste.append(el('button', { class: 'knopf hell klein-knopf', onclick: () => { zeigeTeil(id, grafik, info); info.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }, t.name));
  }
  box.append(el('h3', {}, 'Alle Teile'), liste);

  box.append(el('h2', {}, 'Anleitungen'));
  for (const [id, a] of Object.entries(ANLEITUNGEN)) {
    box.append(el('button', { class: 'knopf hell links', onclick: () => anleitung(id, 0, uebersicht) },
      a.titel, a.panne ? el('small', {}, ' · auch offline') : null));
  }
  box.append(el('p', { class: 'klein-text' },
    'Alle Texte sind eigene Worte, ohne Herstellerbilder. Bei Bremsen und Akku gilt immer zusätzlich die Anleitung deines Herstellers.'));
  if (teilId) zeigeTeil(teilId, grafik, info);
}

async function wechsle(r) {
  rad = r;
  await kv.set('technikRad', r);
  uebersicht();
}

function zeigeTeil(id, grafik, info) {
  const t = TEILE[id];
  if (!t) return;
  grafik.querySelectorAll('.teil').forEach(g => g.classList.toggle('aktiv', g.dataset.teil === id));
  info.innerHTML = '';
  info.append(el('div', { class: 'karte teil-karte' },
    el('h3', {}, t.name),
    el('p', {}, el('b', {}, 'Wozu: '), t.wozu),
    el('p', {}, el('b', {}, 'Verschleiß erkennen: '), t.verschleiss),
    t.anleitung ? el('button', { class: 'knopf', onclick: () => anleitung(t.anleitung, 0, () => uebersicht(id)) }, 'Anleitung: ' + ANLEITUNGEN[t.anleitung].titel) : null,
  ));
}

// ---------------- Anleitung: ein Schritt pro Bildschirm ----------------
function anleitung(id, nr, zurueck) {
  const a = ANLEITUNGEN[id];
  const n = a.schritte.length;
  box.innerHTML = '';
  box.append(el('button', { class: 'knopf klein hell', onclick: () => { zurueck(); oben(); } }, '‹ Zurück zur Übersicht'));
  box.append(el('h2', {}, a.titel));

  if (nr === 0) {
    box.append(el('div', { class: 'karte' },
      el('p', {}, el('b', {}, 'Dauer: '), a.dauer),
      el('p', {}, el('b', {}, 'Du brauchst: '), a.werkzeug),
      a.hersteller ? el('p', { class: 'hersteller' }, '⚠︎ Lies zusätzlich die Anleitung deines Herstellers. Sie gilt vor diesen allgemeinen Schritten.') : null));
  }

  const s = a.schritte[nr];
  box.append(el('div', { class: 'schritt' },
    el('div', { class: 'schritt-nr' }, `Schritt ${nr + 1} von ${n}`),
    el('div', { class: 'fortschritt' }, el('div', { style: `width:${((nr + 1) / n) * 100}%` })),
    el('h3', {}, s.t),
    el('p', { html: s.x }),
    s.warn ? el('div', { class: 'grund warnung' }, '⚠︎ ' + s.warn) : null,
    s.foto ? el('div', { class: 'foto-platz' }, '📷 Foto folgt: ' + s.foto) : null,
  ));

  const nav = el('div', { class: 'wahl zwei schritt-nav' },
    el('button', { class: 'knopf hell', disabled: nr === 0, onclick: () => { anleitung(id, nr - 1, zurueck); oben(); } }, '‹ Zurück'),
    nr < n - 1
      ? el('button', { class: 'knopf', onclick: () => { anleitung(id, nr + 1, zurueck); oben(); } }, 'Weiter ›')
      : el('button', { class: 'knopf', onclick: () => { zurueck(); oben(); toast('Gut gemacht! 💪'); } }, 'Fertig ✓'),
  );
  box.append(nav);
}

// ---------------- Pannen-Modus ----------------
function panne() {
  box.innerHTML = '';
  box.append(
    el('button', { class: 'knopf klein hell', onclick: () => { uebersicht(); oben(); } }, '‹ Technik-Übersicht'),
    el('h2', {}, 'Panne – was ist los?'),
    el('p', { class: 'klein-text' }, 'Funktioniert auch ohne Netz, wenn du die App einmal mit Netz geöffnet hast.'),
  );
  const raster = el('div', { class: 'panne-raster' });
  for (const p of PANNEN) {
    raster.append(el('button', { class: 'panne-knopf' + (p.notfall ? ' notfall' : ''), onclick: () => pannenFall(p) },
      el('span', { class: 'panne-icon', 'aria-hidden': 'true' }, p.icon), p.titel));
  }
  box.append(raster);
  box.append(hilfeBlock());
  oben();
}

function hilfeBlock() {
  return el('div', { class: 'karte hilfe' },
    el('h3', {}, 'Hilfe holen'),
    el('a', { class: 'knopf notruf', href: 'tel:112' }, '📞 Notruf 112'),
    el('button', { class: 'knopf whatsapp', onclick: standortSenden }, 'Standort per WhatsApp schicken'),
    el('p', { class: 'klein-text' }, 'Schickt deinen aktuellen Standort als Kartenlink. Du wählst in WhatsApp selbst, an wen.'),
  );
}

function standortSenden() {
  if (!navigator.geolocation) { toast('Dein Gerät kann den Standort nicht bestimmen.'); return; }
  toast('Suche deinen Standort …', 10000);
  navigator.geolocation.getCurrentPosition(p => {
    const lat = p.coords.latitude.toFixed(5), lon = p.coords.longitude.toFixed(5);
    const text = `🚲 Ich habe eine Panne und brauche Hilfe.\nMein Standort: https://maps.google.com/?q=${lat},${lon}`;
    toast('Standort gefunden.');
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
  }, () => toast('Standort nicht verfügbar. Ist die Ortung erlaubt?', 5000),
  { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 });
}

function pannenFall(p) {
  box.innerHTML = '';
  box.append(
    el('button', { class: 'knopf klein hell', onclick: panne }, '‹ Andere Panne'),
    el('h2', {}, p.icon + ' ' + p.titel),
  );
  if (p.notfall) box.append(el('a', { class: 'knopf notruf', href: 'tel:112' }, '📞 Notruf 112'));
  if (p.info) box.append(el('div', { class: 'karte', html: p.info }));
  if (p.frage) {
    box.append(el('p', { class: 'empfehlung' }, p.frage));
    for (const w of p.wahl) {
      box.append(el('button', {
        class: 'knopf', onclick: () => {
          if (w.anleitung) anleitung(w.anleitung, 0, () => pannenFall(p));
          else { box.querySelector('.wahl-info')?.remove(); box.append(el('div', { class: 'karte wahl-info' }, w.info)); }
        },
      }, w.text));
    }
  } else if (p.anleitung) {
    box.append(el('button', { class: 'knopf', onclick: () => anleitung(p.anleitung, 0, () => pannenFall(p)) },
      'Schritt für Schritt: ' + ANLEITUNGEN[p.anleitung].titel));
  }
  box.append(hilfeBlock());
  oben();
}

