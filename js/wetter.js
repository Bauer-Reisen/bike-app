// Wetterdaten von Open-Meteo (frei, ohne Schlüssel).
// Die Abfrage geht direkt vom Handy an Open-Meteo.

const ZEITZONE = 'Europe/Berlin';
const HOURLY = [
  'temperature_2m', 'apparent_temperature', 'precipitation', 'weather_code',
  'wind_gusts_10m', 'soil_temperature_0cm', 'soil_moisture_0_to_1cm',
].join(',');

export async function holeWetter(lat, lon) {
  const url = 'https://api.open-meteo.com/v1/forecast'
    + `?latitude=${lat.toFixed(3)}&longitude=${lon.toFixed(3)}`
    + `&hourly=${HOURLY}&daily=sunrise,sunset`
    + `&past_days=3&forecast_days=7&timezone=${encodeURIComponent(ZEITZONE)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Wetterdienst antwortet nicht (' + res.status + ')');
  const j = await res.json();
  if (j.error) throw new Error(j.reason || 'Wetterdienst meldet einen Fehler');
  return umformen(j);
}

const minuten = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

function umformen(j) {
  const h = j.hourly;
  const stunden = h.time.map((t, i) => ({
    t,
    datum: t.slice(0, 10),
    stunde: Number(t.slice(11, 13)),
    temp: h.temperature_2m[i],
    gefuehlt: h.apparent_temperature[i],
    regen: h.precipitation[i] ?? 0,
    code: h.weather_code[i],
    boeen: h.wind_gusts_10m[i],
    bodenT: h.soil_temperature_0cm[i],
    bodenF: h.soil_moisture_0_to_1cm[i],
  }));
  const tage = j.daily.time.map((d, i) => ({
    datum: d,
    aufgang: j.daily.sunrise[i].slice(11, 16),
    untergang: j.daily.sunset[i].slice(11, 16),
    aufgangMin: minuten(j.daily.sunrise[i].slice(11, 16)),
    untergangMin: minuten(j.daily.sunset[i].slice(11, 16)),
  }));
  return { stunden, tage, geholt: Date.now() };
}

// Aktuelle Uhrzeit in Deutschland als { datum: 'YYYY-MM-DD', stunde, minute }
export function jetztDE() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: ZEITZONE, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map(x => [x.type, x.value]));
  return { datum: `${p.year}-${p.month}-${p.day}`, stunde: Number(p.hour), minute: Number(p.minute) };
}

// Ortssuche (Open-Meteo Geocoding)
export async function sucheOrt(name) {
  const url = 'https://geocoding-api.open-meteo.com/v1/search'
    + `?name=${encodeURIComponent(name)}&count=8&language=de&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ortssuche antwortet nicht');
  const j = await res.json();
  return (j.results || []).map(r => ({
    name: r.name,
    zusatz: [r.admin3, r.admin2, r.admin1, r.country_code !== 'DE' ? r.country : null]
      .filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).slice(0, 2).join(', '),
    lat: r.latitude,
    lon: r.longitude,
  }));
}
