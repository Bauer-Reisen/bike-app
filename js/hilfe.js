// Rundgang beim ersten Öffnen, „Was ist neu?“ nach Updates, Einmal-Erklärungen je Seite.
// Gemerkt wird alles im Gerät (kv 'hilfe').
import { kv } from './db.js';
import { el, dialog } from './ui.js';
import { VERSION } from './version.js';
import { KARTEN, NEUES, EINMAL } from './hilfe-daten.js';

const zahl = v => String(v || '0').split('.').map(Number);
export function neuer(a, b) {
  const x = zahl(a), y = zahl(b);
  for (let i = 0; i < 3; i++) if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) > (y[i] || 0);
  return false;
}

async function stand() {
  try { return (await kv.get('hilfe')) || {}; } catch { return {}; }
}
async function merke(teil) {
  try { await kv.set('hilfe', { ...await stand(), ...teil }); } catch { /* egal */ }
}

// Beim Start: neu → Rundgang; sonst nach einem Update einmal „Was ist neu?“
export async function beimStart() {
  const s = await stand();
  if (!s.rundgang) {
    await rundgang();
    await merke({ rundgang: true, neuGesehen: VERSION });
    return;
  }
  const offen = NEUES.filter(n => neuer(n.v, s.neuGesehen) && !neuer(n.v, VERSION));
  if (offen.length) await wasIstNeu(offen);
  if (neuer(VERSION, s.neuGesehen)) await merke({ neuGesehen: VERSION });
}

function karte(titel, inhaltFn, knoepfe) {
  return new Promise(resolve => {
    let wert = null;
    const { inhalt, schliessen } = dialog(titel, { onClose: () => resolve(wert) });
    inhaltFn(inhalt);
    for (const k of knoepfe) {
      inhalt.append(el('button', { class: 'knopf' + (k.hell ? ' hell' : ''), onclick: () => { wert = k.wert; schliessen(); } }, k.text));
    }
  });
}

export async function rundgang() {
  for (let i = 0; i < KARTEN.length; i++) {
    const k = KARTEN[i];
    const letzte = i === KARTEN.length - 1;
    const w = await karte(i === 0 ? 'Willkommen!' : k.titel, inhalt => {
      inhalt.append(el('div', { class: 'tour' },
        el('div', { class: 'tour-icon', 'aria-hidden': 'true' }, k.icon),
        i === 0 ? el('h3', {}, k.titel) : null,
        el('p', { html: k.text }),
        el('p', { class: 'tour-punkte', 'aria-label': `Schritt ${i + 1} von ${KARTEN.length}` },
          ...KARTEN.map((_, j) => el('span', { class: j === i ? 'an' : '' })))));
    }, [
      { text: letzte ? 'Los geht’s' : 'Weiter', wert: 'weiter' },
      ...(letzte ? [] : [{ text: 'Überspringen', wert: 'ende', hell: true }]),
    ]);
    if (w !== 'weiter') return;
  }
}

export async function wasIstNeu(liste = NEUES) {
  await karte('Was ist neu?', inhalt => {
    for (const n of liste) {
      inhalt.append(el('h3', {}, n.titel), el('ul', { class: 'neu-liste' }, ...n.punkte.map(p => el('li', { html: p }))));
    }
  }, [{ text: 'Alles klar', wert: true }]);
}

export async function erklaere(seite) {
  const e = EINMAL[seite];
  if (!e) return;
  await karte(e.titel, inhalt => {
    inhalt.append(el('ul', { class: 'neu-liste' }, ...e.punkte.map(p => el('li', { html: p }))));
  }, [{ text: 'Alles klar', wert: true }]);
}

// Beim ersten Öffnen einer Seite einmal erklären (nicht während des Rundgangs)
export async function seiteGeoeffnet(seite) {
  if (!EINMAL[seite] || seite === 'heute' || document.querySelector('dialog[open]')) return;
  const s = await stand();
  if (!s.rundgang || (s.einmal || []).includes(seite)) return;
  await merke({ einmal: [...(s.einmal || []), seite] });
  await erklaere(seite);
}
