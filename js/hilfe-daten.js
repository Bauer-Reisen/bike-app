// Texte für Rundgang, „Was ist neu?“ und die Einmal-Erklärungen.
// Wächter: node tools/check-hilfe.mjs (läuft vor jedem Hochladen).
// Regel: Größere Neuerungen gehören in den Rundgang. Dann die Karte ergänzen und ihren
// „stand“ auf die neue Version setzen. Kleinigkeiten bekommen rundgang: 'klein'.

export const KARTEN = [
  {
    id: 'heute', icon: '🚦', titel: 'Heute fahren?', stand: '0.3.0',
    text: 'Zwei Ampeln: eine fürs <b>E-MTB</b>, eine fürs <b>Gravel</b>. Darunter steht, warum – zum Beispiel Wind, Glätte oder nasse Trails. Die Farbbänder zeigen die nächsten 4 Tage Stunde für Stunde. Tippe auf eine Stunde, um genau dieses Zeitfenster zu prüfen. Das <b>?</b> oben rechts erklärt dir jede Seite.',
  },
  {
    id: 'orte', icon: '📍', titel: 'Wo fährst du?', stand: '0.3.0',
    text: 'Oben wählst du den Ort: <b>📍 Hier</b> ist dein Standort, dazu kommen deine Lieblingsorte. Mit <b>＋ Ort</b> legst du neue an. Mit <b>Per WhatsApp teilen</b> fragst du deine Leute, wer mitfährt.',
  },
  {
    id: 'routen', icon: '🗺', titel: 'Routen', stand: '0.3.0',
    text: 'Touren in deiner Nähe, mit Ampel für die ganze Strecke. Eigene GPX-Dateien kannst du hinzufügen. In jeder Tour: <b>Per WhatsApp teilen</b> und <b>Diese Route gefahren</b> – dann steht sie gleich im Fahrtenbuch. Nichts dabei? Der Knopf führt zu Komoot.',
  },
  {
    id: 'fahrten', icon: '📒', titel: 'Fahrtenbuch', stand: '0.3.0',
    text: 'Trag Fahrten von Hand ein oder lade eine GPX-Datei, zum Beispiel aus Bosch Flow oder Komoot. Die App zählt Kilometer, Höhenmeter und Zeit je Rad – ohne Tempo und ohne Rangliste.',
  },
  {
    id: 'training', icon: '🎯', titel: 'Training 100 km', stand: '0.3.0',
    text: 'Ein ruhiger Plan bis zu deiner 100-km-Tour: jede Woche eine lange Fahrt, die langsam wächst, jede 3. Woche lockerer. Klappt eine Woche nicht, rutscht der Plan einfach nach hinten.',
  },
  {
    id: 'technik', icon: '🛠', titel: 'Technik & Panne', stand: '0.3.0',
    text: 'Tippe aufs Fahrrad-Bild, um ein Teil erklärt zu bekommen. Bei einer Panne führen dich Anleitungen Schritt für Schritt – <b>auch ohne Netz</b>, wenn du die App vorher einmal geöffnet hast. Mit Notruf 112 und Standort per WhatsApp.',
  },
  {
    id: 'daten', icon: '💾', titel: 'Deine Daten', stand: '0.3.0',
    text: 'Alles bleibt nur auf diesem Handy – ohne Anmeldung. Unter <b>⚙︎</b> speicherst du ab und zu ein <b>Backup</b>, damit nichts verloren geht. Dort findest du auch diesen Rundgang wieder.',
  },
];

// Neueste zuerst. Nur Dinge, die man sieht und kennen sollte – keine Reparaturen.
export const NEUES = [
  {
    v: '0.3.1', titel: 'App weitergeben',
    punkte: ['Unter <b>Orte & Einstellungen</b> gibt es jetzt einen <b>QR-Code</b>: Freunde scannen ihn mit der Kamera und haben die App.'],
    rundgang: 'klein',
  },
  {
    v: '0.3.0', titel: 'Neu in der App',
    punkte: [
      'Bei jeder Route: <b>Per WhatsApp teilen</b> (mit Ampel) und <b>Diese Route gefahren</b> – trägt die Tour mit einem Tipp ins Fahrtenbuch ein.',
      'Oben rechts erklärt das <b>?</b> die Seite, auf der du gerade bist.',
    ],
    rundgang: ['routen', 'heute'],
  },
];

// Kurze Erklärung beim ersten Öffnen einer Seite (über das ? jederzeit wieder)
export const EINMAL = {
  heute: {
    titel: 'Heute fahren?',
    punkte: [
      '<b>Grün</b> = passt, <b>Gelb</b> = mit Vorsicht, <b>Rot</b> = lieber nicht.',
      'Die Farbbänder: jede Stunde ein Kästchen. Tippe auf eine Stunde, dann prüft die App genau dieses Zeitfenster. Tippe auf einen Tag für sein bestes Fenster.',
      'Die Bodenwerte (Nässe, Frost) sind Schätzungen aus dem Wettermodell, keine Messung vor Ort.',
      'Unter <b>⚙︎</b> stellst du ein, wie vorsichtig die Ampel sein soll.',
    ],
  },
  routen: {
    titel: 'Routen',
    punkte: [
      'Die Liste ist nach Entfernung zum gewählten Ort sortiert. Sind die Trails nass, stehen Touren, die bei Nässe gehen, oben.',
      'Tippe auf eine Tour: Steckbrief, Karte und die Ampel für Start, höchsten und entferntesten Punkt.',
      '<b>Eigene GPX-Route</b>: Sie bleibt nur auf deinem Handy.',
      'Die App navigiert nicht. Mit <b>GPX an andere App geben</b> schickst du die Tour an Komoot oder deinen Radcomputer.',
    ],
  },
  fahrten: {
    titel: 'Fahrtenbuch',
    punkte: [
      '<b>Von Hand</b>: Kilometer, Höhenmeter, Zeit. Komma geht auch (42,5).',
      '<b>GPX laden</b>: Datei aus Bosch Flow, Komoot oder Strava – Werte werden ausgelesen.',
      '<b>Aufzeichnen</b> ist ein Versuch: Es klappt nur, solange der Bildschirm an bleibt.',
      'Nach jeder 5. Fahrt erinnert dich die App ans Backup.',
    ],
  },
  training: {
    titel: 'Training 100 km',
    punkte: [
      'Der Balken zeigt deine lange Fahrt dieser Woche. Die Marke bei <b>75 km</b> ist das Ziel des Plans – wer 75 km schafft, schafft am Tag X auch 100.',
      '<b>Woche wiederholen</b>: Die Woche war zu hart – nächste Woche gleich lang.',
      '<b>Eine Stufe zurück</b>: Nach Pause oder Krankheit – der Plan geht eine Stufe kürzer weiter.',
      'Der beste Tag kommt aus der Ampel. Kein Ersatz für ärztlichen Rat.',
    ],
  },
  technik: {
    titel: 'Technik & Panne',
    punkte: [
      'Oben zwischen E-MTB und Gravel wechseln, dann auf ein Teil im Bild tippen.',
      'Die Anleitungen gehen Schritt für Schritt – ein Schritt pro Bildschirm.',
      'Bei Bremsen und Akku gilt immer zuerst die Anleitung deines Herstellers.',
      'Der Pannen-Modus geht auch ohne Netz, wenn du die App einmal mit Netz geöffnet hast.',
    ],
  },
  mehr: {
    titel: 'Orte & Einstellungen',
    punkte: [
      '<b>Wie vorsichtig?</b> Vorsichtig: Die Ampel wird früher gelb (weniger Wind, weniger Nässe, wärmer). Hart: erst später.',
      '<b>Meine Orte</b>: hier löschen.',
      '<b>Backup speichern</b> sichert alles in eine Datei (zum Beispiel in „Dateien“ oder per Mail an dich). Mit <b>Backup laden</b> holst du es zurück, auch auf ein neues Handy.',
    ],
  },
};
