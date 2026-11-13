// ============================================================
//  SCHWELLEN FÜR DIE AMPEL
//  Alle Erfahrungswerte stehen nur in dieser Datei.
//  Werte ändern = Datei ändern, sonst nichts.
// ============================================================

export const SCHWELLEN = {
  // Böen in km/h
  boeen: {
    emtb:   { gelb: 50, rot: 60 },   // Astbruch im Wald
    gravel: { gelb: 40, rot: 55 },
  },

  // Trailnässe (nur E-MTB): Regen in mm
  trailnaesse: {
    regen24h: 10,   // mehr als 10 mm in 24 h -> gelb
    regen72h: 25,   // mehr als 25 mm in 72 h -> gelb
    // Bodenfeuchte (Modellwert, Anteil Wasser im Boden 0-1 cm, 0 bis ~0,5)
    bodenfeuchteNass: 0.40,     // ab hier Hinweis "Boden sehr feucht"
    bodenfeuchteVerstaerkt: 0.5 // Bei sehr feuchtem Boden gilt schon die Hälfte der Regenmengen als gelb (0.5 = Hälfte)
  },

  // Regen während der Fahrt in mm pro Stunde
  regenFahrt: { gelb: 1 },

  // Bodentemperatur (Oberfläche) in °C
  boden: {
    gefroren: 0,        // bis 0 °C: "Boden gefroren"
    glaette: 2,         // bis 2 °C nach Nässe: Glätte-Warnung
    glaetteNachRegen24h: 0.5, // "Nässe" = mindestens so viel Regen (mm) in den letzten 24 h
  },

  // Laub: Monate (1 = Januar) und Regen in den letzten 48 h (mm)
  laub: { monate: [10, 11], regen48h: 1 },

  // Gefühlte Temperatur in °C: darunter gelb
  gefuehlt: { emtb: 0, gravel: 3 },

  // E-MTB-Akku-Hinweis unter dieser Lufttemperatur (°C)
  akkuKalt: 5,

  // Tageslicht: so viele Minuten nach Sonnenuntergang zählen noch als Dämmerung
  daemmerungMinuten: 30,

  // Zeitfenster für "Bestes Zeitfenster" in Stunden
  fenster: { lang: 3, kurz: 2 },
};

// ------------------------------------------------------------
//  DREI VOREINSTELLUNGEN
//  Sie verschieben die Schwellen oben.
//  boeen: km/h dazu, regen: Faktor auf Regenmengen,
//  temp: °C dazu (minus = man verträgt mehr Kälte)
// ------------------------------------------------------------
export const VOREINSTELLUNGEN = {
  vorsichtig: { name: 'Vorsichtig',      boeen: -10, regen: 0.7, regenFahrt: 0.5, temp: +2 },
  normal:     { name: 'Normal',          boeen: 0,   regen: 1.0, regenFahrt: 1.0, temp: 0 },
  hart:       { name: 'Hart im Nehmen',  boeen: +10, regen: 1.5, regenFahrt: 2.0, temp: -3 },
};

// Liefert die Schwellen mit eingerechneter Voreinstellung
export function schwellenFuer(voreinstellung = 'normal') {
  const v = VOREINSTELLUNGEN[voreinstellung] || VOREINSTELLUNGEN.normal;
  const s = structuredClone(SCHWELLEN);
  for (const rad of ['emtb', 'gravel']) {
    s.boeen[rad].gelb += v.boeen;
    s.boeen[rad].rot += v.boeen;
    s.gefuehlt[rad] += v.temp; // temp > 0 = schon bei wärmerem Wetter gelb
  }
  s.trailnaesse.regen24h *= v.regen;
  s.trailnaesse.regen72h *= v.regen;
  s.regenFahrt.gelb *= v.regenFahrt;
  return s;
}
