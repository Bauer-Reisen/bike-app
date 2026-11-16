// GPX lesen, auswerten, vereinfachen und schreiben.
// Funktioniert im Browser und in Node (keine Browser-Funktionen nötig).

// Liefert { name, punkte: [{lat, lon, ele, t}] } – t = Millisekunden oder null
export function leseGpx(text) {
  const punkte = [];
  // Track-Punkte; falls keine da sind, Routen-Punkte
  const mitTrack = /<trkpt\b/.test(text);
  // Jedes Teilstück (trkseg) einzeln: die Lücke dazwischen ist keine gefahrene Strecke
  const teile = mitTrack ? text.split(/<trkseg\b/) : [text];
  teile.forEach((teil, n) => {
  const re = mitTrack ? /<trkpt\b([^>]*?)(\/>|>([\s\S]*?)<\/trkpt>)/g : /<rtept\b([^>]*?)(\/>|>([\s\S]*?)<\/rtept>)/g;
  let m, erster = true;
  while ((m = re.exec(teil))) {
    const attr = m[1];
    const lat = parseFloat(/lat\s*=\s*["']([^"']+)/.exec(attr)?.[1]);
    const lon = parseFloat(/lon\s*=\s*["']([^"']+)/.exec(attr)?.[1]);
    if (!isFinite(lat) || !isFinite(lon)) continue;
    const innen = m[3] || '';
    const ele = parseFloat(/<ele>\s*([^<]+)<\/ele>/.exec(innen)?.[1]);
    const zeit = /<time>\s*([^<]+)<\/time>/.exec(innen)?.[1];
    const t = zeit ? Date.parse(zeit.trim()) : NaN;
    const p = { lat, lon, ele: isFinite(ele) ? ele : null, t: isFinite(t) ? t : null };
    if (erster && n > 0 && punkte.length) p.neu = true;
    erster = false;
    punkte.push(p);
  }
  });
  const name = /<trk>[\s\S]*?<name>([^<]*)<\/name>/.exec(text)?.[1]
    || /<metadata>[\s\S]*?<name>([^<]*)<\/name>/.exec(text)?.[1] || '';
  return { name: entities(name.trim()), punkte };
}

function entities(s) {
  return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&amp;/g, '&');
}

// Entfernung in Metern
export function abstand(a, b) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// km, Höhenmeter, Fahrzeit (Minuten, nur Bewegung), Datum
export function auswerten(punkte) {
  let m = 0;
  for (let i = 1; i < punkte.length; i++) if (!punkte[i].neu) m += abstand(punkte[i - 1], punkte[i]); // neu = nach Pause

  // Höhenmeter: geglättet (gleitender Mittelwert über 5 Punkte), dann nur Anstiege über 3 m zählen
  let hm = 0;
  const eles = punkte.map(p => p.ele).filter(e => e != null);
  if (eles.length > 2) {
    const glatt = eles.map((_, i) => {
      const s = eles.slice(Math.max(0, i - 2), i + 3);
      return s.reduce((a, b) => a + b, 0) / s.length;
    });
    let basis = glatt[0];
    for (const e of glatt) {
      if (e - basis > 3) { hm += e - basis; basis = e; }
      else if (e < basis) basis = e;
    }
  }

  // Fahrzeit: Abschnitte mit mehr als 2 km/h und Lücke unter 5 Minuten
  let sek = 0;
  for (let i = 1; i < punkte.length; i++) {
    const a = punkte[i - 1], b = punkte[i];
    if (a.t == null || b.t == null || b.neu) continue;
    const dt = (b.t - a.t) / 1000;
    if (dt <= 0 || dt > 300) continue;
    const kmh = abstand(a, b) / dt * 3.6;
    if (kmh > 2) sek += dt;
  }
  const erste = punkte.find(p => p.t != null);
  return {
    km: m / 1000,
    hm: Math.round(hm),
    minuten: sek ? Math.round(sek / 60) : null,
    datum: erste ? isoLokal(new Date(erste.t)) : null,
  };
}

function isoLokal(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Vereinfachen (Douglas-Peucker) auf ungefähr "toleranz" Meter Genauigkeit
export function vereinfache(punkte, toleranz = 8) {
  if (punkte.length < 3) return punkte.slice();
  const behalten = new Uint8Array(punkte.length);
  behalten[0] = behalten[punkte.length - 1] = 1;
  const stapel = [[0, punkte.length - 1]];
  const kx = 111320 * Math.cos(punkte[0].lat * Math.PI / 180), ky = 110540;
  while (stapel.length) {
    const [a, b] = stapel.pop();
    let max = 0, idx = -1;
    const ax = punkte[a].lon * kx, ay = punkte[a].lat * ky;
    const bx = punkte[b].lon * kx, by = punkte[b].lat * ky;
    const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const px = punkte[i].lon * kx, py = punkte[i].lat * ky;
      let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
      t = Math.max(0, Math.min(1, t));
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > max) { max = d; idx = i; }
    }
    if (max > toleranz && idx > 0) {
      behalten[idx] = 1;
      stapel.push([a, idx], [idx, b]);
    }
  }
  return punkte.filter((_, i) => behalten[i]);
}

// Anfang und Ende um "meter" kürzen (Datenschutz: Wohnort)
export function kuerzen(punkte, meter = 300) {
  const bis = (liste) => {
    let s = 0;
    for (let i = 1; i < liste.length; i++) {
      s += abstand(liste[i - 1], liste[i]);
      if (s >= meter) return i;
    }
    return liste.length;
  };
  const vorn = bis(punkte);
  const hinten = punkte.length - bis(punkte.slice().reverse());
  return vorn < hinten ? punkte.slice(vorn, hinten) : [];
}

// Höchster Punkt (für die Ampel entlang der Strecke)
export function hoechsterPunkt(punkte) {
  let best = null;
  for (const p of punkte) if (p.ele != null && (!best || p.ele > best.ele)) best = p;
  return best || punkte[Math.floor(punkte.length / 2)];
}

// Sauberes GPX schreiben: nur Name, Koordinaten und Höhe – keine Zeiten, keine Geräte
export function schreibeGpx(name, punkte) {
  const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pts = punkte.map(p =>
    `      <trkpt lat="${p.lat.toFixed(6)}" lon="${p.lon.toFixed(6)}">${p.ele != null ? `<ele>${p.ele.toFixed(1)}</ele>` : ''}</trkpt>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="bike-app" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${x(name)}</name>
    <trkseg>
${pts}
    </trkseg>
  </trk>
</gpx>
`;
}

// Kompakte Speicherform: [[lat, lon, ele], ...] mit 5 Nachkommastellen
export const packe = punkte => punkte.map(p => [+p.lat.toFixed(5), +p.lon.toFixed(5), p.ele != null ? Math.round(p.ele) : null]);
export const entpacke = liste => liste.map(([lat, lon, ele]) => ({ lat, lon, ele }));
