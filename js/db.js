// Speicher im Gerät (IndexedDB). Nichts davon verlässt das Handy,
// außer der Nutzer speichert selbst ein Backup.

const DB_NAME = 'bike-app';
const DB_VERSION = 1;
// kv = Einstellungen und Kleinkram, orte = Lieblingsorte,
// fahrten = Fahrtenbuch, routen = eigene GPX-Routen, plan = Trainingsplan
export const STORES = ['kv', 'orte', 'fahrten', 'routen', 'plan'];

let dbPromise = null;

function open() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const name of STORES) {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, name === 'kv' ? undefined : { keyPath: 'id' });
        }
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function run(store, mode, fn) {
  return open().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const os = tx.objectStore(store);
    let result;
    const req = fn(os);
    if (req) req.onsuccess = () => { result = req.result; };
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  }));
}

export const kv = {
  get: key => run('kv', 'readonly', os => os.get(key)),
  set: (key, value) => run('kv', 'readwrite', os => os.put(value, key)),
  del: key => run('kv', 'readwrite', os => os.delete(key)),
};

export const alle = store => run(store, 'readonly', os => os.getAll());
export const speichere = (store, obj) => run(store, 'readwrite', os => os.put(obj));
export const loesche = (store, id) => run(store, 'readwrite', os => os.delete(id));

export function neueId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ---------- Backup ----------
// Wetter-Zwischenspeicher gehört nicht ins Backup.
const istCache = key => typeof key === 'string' && key.startsWith('cache:');

export async function backupErstellen() {
  const db = await open();
  const daten = {};
  for (const name of STORES) {
    if (name === 'kv') {
      const eintraege = await new Promise((resolve, reject) => {
        const out = [];
        const req = db.transaction('kv').objectStore('kv').openCursor();
        req.onsuccess = () => {
          const c = req.result;
          if (!c) return resolve(out);
          if (!istCache(c.key)) out.push([c.key, c.value]);
          c.continue();
        };
        req.onerror = () => reject(req.error);
      });
      daten.kv = eintraege;
    } else {
      daten[name] = await alle(name);
    }
  }
  return { app: 'bike-app', format: 1, erstellt: new Date().toISOString(), daten };
}

// Führt ein Backup mit den vorhandenen Daten zusammen.
// Gleiche Einträge (gleiche id) werden durch das Backup ersetzt.
export async function backupLaden(json) {
  if (!json || json.app !== 'bike-app' || !json.daten) {
    throw new Error('Das ist keine Backup-Datei dieser App.');
  }
  let anzahl = 0;
  for (const name of STORES) {
    const liste = json.daten[name];
    if (!Array.isArray(liste)) continue;
    for (const eintrag of liste) {
      if (name === 'kv') {
        if (Array.isArray(eintrag) && !istCache(eintrag[0])) { await kv.set(eintrag[0], eintrag[1]); anzahl++; }
      } else if (eintrag && eintrag.id) {
        await speichere(name, eintrag); anzahl++;
      }
    }
  }
  return anzahl;
}
