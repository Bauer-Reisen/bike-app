// Offline-Speicher der App-Dateien.
// Strategie: immer zuerst das Netz fragen (damit Updates sofort ankommen),
// nur wenn kein Netz da ist oder es zu lange dauert, die gespeicherte Kopie nehmen.
// Wetter, Ortssuche und Kartenkacheln werden NICHT gespeichert.

const VERSION = '0.3.1';
const CACHE = 'bike-app-' + VERSION;
const DATEIEN = [
  './', 'index.html', 'manifest.webmanifest', 'css/app.css',
  'js/app.js', 'js/ui.js', 'js/hilfe.js', 'js/hilfe-daten.js', 'js/zustand.js', 'js/version.js', 'js/db.js', 'js/wetter.js',
  'js/schwellen.js', 'js/ampel.js', 'js/gpx.js',
  'js/technik.js', 'js/technik-daten.js', 'js/rad-grafik.js',
  'js/fahrten.js', 'js/routen.js', 'js/training.js',
  'routen/routen.json',
  'icons/icon-192.png', 'icons/apple-touch-icon.png', 'icons/qr.svg',
  'vendor/leaflet/leaflet.js', 'vendor/leaflet/leaflet.css',
  'vendor/leaflet/images/marker-icon.png', 'vendor/leaflet/images/marker-icon-2x.png',
  'vendor/leaflet/images/marker-shadow.png',
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('bike-app-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // fremde Dienste nicht anfassen
  if (url.pathname.endsWith('/version.json')) return; // Update-Prüfung immer frisch

  ev.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const netz = fetch(req).then(async res => {
      if (res.ok && res.type === 'basic') await cache.put(req, res.clone());
      return res;
    });
    ev.waitUntil(netz.catch(() => {})); // Speichern auch fertig machen, wenn die Kopie schon gezeigt wird
    // Kurz aufs Netz warten (schwaches Netz im Wald): Seite 3 s, alle anderen Dateien 1,5 s
    const zeit = new Promise(resolve => setTimeout(resolve, req.mode === 'navigate' ? 3000 : 1500, null));
    try {
      const res = await Promise.race([netz, zeit]);
      if (res) return res;
    } catch { /* offline */ }
    const kopie = await cache.match(req, { ignoreSearch: req.mode === 'navigate' });
    if (kopie) return kopie;
    return netz; // nichts gespeichert: weiter aufs Netz warten
  })());
});
