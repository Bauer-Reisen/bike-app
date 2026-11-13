// Gemeinsame Kleinigkeiten für alle Seiten
export const $ = id => document.getElementById(id);

export const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function toast(text, ms = 3500) {
  const t = $('toast');
  t.textContent = text;
  t.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.hidden = true; }, ms);
}

// Element bauen: el('div', {class: 'x', onclick: fn}, 'Text', kind, ...)
export function el(tag, attrs = {}, ...kinder) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k.startsWith('on')) e[k] = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kinder.flat()) {
    if (k == null || k === false) continue;
    e.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return e;
}

// Vollbild-Dialog mit Titel und Inhalt; liefert { dialog, inhalt, schliessen }
export function dialog(titel, { onClose } = {}) {
  const d = el('dialog', { class: 'dialog' });
  const zu = el('button', { class: 'knopf klein hell', 'aria-label': 'Schließen' }, '✕');
  const inhalt = el('div', { class: 'dialog-inhalt' });
  // leere Einträge (null/false) einfach überspringen
  inhalt.append = (...k) => Element.prototype.append.apply(inhalt, k.flat().filter(x => x != null && x !== false));
  d.append(el('div', { class: 'dialog-kopf' }, el('h2', {}, titel), zu), inhalt);
  document.body.append(d);
  const schliessen = () => { d.close(); };
  zu.onclick = schliessen;
  d.addEventListener('close', () => { d.remove(); onClose?.(); });
  d.showModal();
  d.scrollTop = 0;
  return { dialog: d, inhalt, schliessen };
}

// Ja/Nein-Frage als großer Dialog
export function frage(text, ja = 'Ja', nein = 'Abbrechen') {
  return new Promise(resolve => {
    let antwort = false;
    const { inhalt, schliessen } = dialog('Bitte bestätigen', { onClose: () => resolve(antwort) });
    inhalt.append(
      el('p', {}, text),
      el('button', { class: 'knopf', onclick: () => { antwort = true; schliessen(); } }, ja),
      el('button', { class: 'knopf hell', onclick: schliessen }, nein),
    );
  });
}

// Zahl schön auf Deutsch
export const zahl = (x, stellen = 0) =>
  Number(x).toLocaleString('de-DE', { maximumFractionDigits: stellen, minimumFractionDigits: 0 });

export function dauer(minuten) {
  const m = Math.round(minuten);
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')} h`;
}

export const RAD_NAME = { emtb: 'E-MTB', gravel: 'Gravel' };

const WT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export function datumKurz(iso) {
  const d = new Date(iso + 'T12:00:00');
  return `${WT[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.`;
}
export function datumLang(iso) {
  const d = new Date(iso + 'T12:00:00');
  return `${WT[d.getDay()]} ${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
}

// Heute als 'YYYY-MM-DD' (Ortszeit des Geräts)
export function heuteIso(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function plusTage(iso, n) {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return heuteIso(d);
}
// Montag der Woche
export function wochenStart(iso) {
  const d = new Date(iso + 'T12:00:00');
  const wt = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - wt);
  return heuteIso(d);
}

// Leaflet bei Bedarf nachladen
export function ladeLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  if (ladeLeaflet.p) return ladeLeaflet.p;
  ladeLeaflet.p = new Promise((resolve, reject) => {
    const css = el('link', { rel: 'stylesheet', href: 'vendor/leaflet/leaflet.css' });
    document.head.append(css);
    const js = el('script', { src: 'vendor/leaflet/leaflet.js' });
    js.onload = () => resolve(window.L);
    js.onerror = () => { ladeLeaflet.p = null; reject(new Error('Karte konnte nicht geladen werden (offline?)')); };
    document.head.append(js);
  });
  return ladeLeaflet.p;
}

export function osmLayer(L) {
  return L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende',
  });
}

// Datei teilen (iPhone: Teilen-Menü), sonst herunterladen
export async function dateiTeilen(text, name, typ) {
  const file = new File([text], name, { type: typ });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); return true; }
    catch (e) { if (e.name === 'AbortError') return false; }
  }
  const a = el('a', { href: URL.createObjectURL(file), download: name });
  document.body.append(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  return true;
}
