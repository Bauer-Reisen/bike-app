// Gemeinsamer Zustand aller Seiten
export const state = {
  orte: [],
  auswahl: 'hier',     // 'hier' oder id eines Ortes
  voreinstellung: 'normal',
  daten: null,         // Wetterdaten des gewählten Ortes
  bewertung: null,     // Ampel je Stunde
  s: null,             // Schwellen (mit Voreinstellung)
  gewaehlt: null,      // { t, laenge } gewähltes Zeitfenster (Startzeit in ms, Stunden)
  standort: null,      // { lat, lon } aktueller Standort
  pos: null,           // { lat, lon } des gewählten Ortes
  aktuell: null,       // Ampel des angezeigten Zeitfensters
};

// Andere Seiten hören auf 'wetter', um sich neu zu zeichnen
export const melde = name => window.dispatchEvent(new Event(name));

export function ortName() {
  if (state.auswahl === 'hier') return 'bei mir in der Nähe';
  return state.orte.find(o => o.id === state.auswahl)?.name || '';
}
