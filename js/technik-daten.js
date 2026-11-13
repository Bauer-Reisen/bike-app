// Inhalte der Technikseite – in eigenen Worten geschrieben.
// Teile: name, wozu, verschleiss (woran man ihn erkennt), raeder (für welche Rad-Grafik)

export const TEILE = {
  reifen: {
    name: 'Reifen', raeder: ['emtb', 'gravel'],
    wozu: 'Gibt Grip, federt kleine Schläge ab und schützt Schlauch oder Dichtmilch. Der Luftdruck entscheidet viel über Grip und Pannenschutz.',
    verschleiss: 'Abgefahrene, runde Stollen (besonders an der Seite), Risse in der Flanke, Schnitte, durchscheinendes Gewebe. Hinten nutzt er sich schneller ab, beim E-MTB besonders.',
    anleitung: 'schlauch',
  },
  felge: {
    name: 'Felge und Speichen', raeder: ['emtb', 'gravel'],
    wozu: 'Die Felge trägt den Reifen, die Speichen halten sie rund und gerade.',
    verschleiss: 'Seitenschlag (das Rad „eiert“), Dellen am Felgenrand nach Durchschlägen, lockere oder gerissene Speichen (klappern, lassen sich leicht zusammendrücken).',
  },
  steckachse: {
    name: 'Steckachse', raeder: ['emtb', 'gravel'],
    wozu: 'Hält das Laufrad fest im Rahmen oder in der Gabel. Lässt sich mit Hebel oder Inbus öffnen.',
    verschleiss: 'Knacken beim Treten oder Bremsen kann eine lockere Achse sein. Gewinde sauber halten, mit dem vorgeschriebenen Drehmoment anziehen.',
  },
  bremsscheibe: {
    name: 'Bremsscheibe', raeder: ['emtb', 'gravel'],
    wozu: 'Auf ihr greifen die Bremsbeläge. Darf nie mit Öl oder Kettenspray in Berührung kommen.',
    verschleiss: 'Zu dünn (Mindestdicke ist meist auf der Scheibe eingeprägt), Riefen, bläulich verfärbt nach Überhitzung, verbogen (schleift rhythmisch).',
  },
  bremse: {
    name: 'Bremssattel und Beläge', raeder: ['emtb', 'gravel'],
    wozu: 'Im Bremssattel sitzen die Beläge. Hydraulik drückt sie beim Ziehen am Hebel gegen die Scheibe.',
    verschleiss: 'Belag dünner als etwa 1 mm, Quietschen oder Kratzen (Metall auf Metall), Hebel lässt sich weiter ziehen als sonst, Bremsleistung lässt nach.',
    anleitung: 'bremse',
  },
  bremshebel: {
    name: 'Bremshebel', raeder: ['emtb'],
    wozu: 'Hier ziehst du – der Hebel drückt Bremsflüssigkeit zum Bremssattel.',
    verschleiss: 'Hebel wird „weich“ oder lässt sich bis zum Lenker ziehen: Luft im System oder Leck. Dann nicht mehr fahren, Werkstatt.',
  },
  schaltbremsgriff: {
    name: 'Schalt-Brems-Griff', raeder: ['gravel'],
    wozu: 'Beim Rennlenker sitzen Bremse und Schaltung in einem Griff. Bremsen: Hebel ziehen. Schalten: Hebel seitlich drücken (je nach Marke unterschiedlich).',
    verschleiss: 'Weicher Bremshebel (Luft, Leck), Schaltung rastet nicht sauber, abgegriffenes Lenkerband.',
  },
  kette: {
    name: 'Kette', raeder: ['emtb', 'gravel'],
    wozu: 'Überträgt deine Kraft (und beim E-MTB die des Motors) aufs Hinterrad. Beim E-MTB ist sie viel stärker belastet.',
    verschleiss: 'Kette „längt“ sich. Mit einer Kettenlehre messen. Zeichen: Kette springt unter Last, Schaltung wird ungenau, Kette rostig oder steif.',
    anleitung: 'kette',
  },
  kettenschloss: {
    name: 'Kettenschloss', raeder: ['emtb', 'gravel'],
    wozu: 'Ein Glied, das sich ohne Nietwerkzeug öffnen und schließen lässt. Retter bei Kettenriss.',
    verschleiss: 'Muss zur Kette passen (Anzahl Gänge, z. B. 12-fach). Bei 11- und 12-fach meist nur einmal verwenden.',
    anleitung: 'kettenriss',
  },
  kassette: {
    name: 'Kassette (Ritzelpaket)', raeder: ['emtb', 'gravel'],
    wozu: 'Die Zahnräder am Hinterrad – jedes ist ein Gang.',
    verschleiss: 'Zähne werden spitz wie Haifischflossen, Kette springt auf den meistgefahrenen Ritzeln (oft auch nach neuer Kette).',
  },
  kettenblatt: {
    name: 'Kettenblatt', raeder: ['emtb', 'gravel'],
    wozu: 'Das große Zahnrad vorne an der Kurbel.',
    verschleiss: 'Spitze, hakenförmige Zähne, Kette fällt runter oder „klebt“ unten am Blatt.',
  },
  schaltwerk: {
    name: 'Schaltwerk', raeder: ['emtb', 'gravel'],
    wozu: 'Führt die Kette von Ritzel zu Ritzel und hält sie gespannt.',
    verschleiss: 'Ausgeschlagene Schaltröllchen (wackeln, Zähne abgerundet), Käfig verbogen, Schaltung wird ungenau.',
    anleitung: 'schaltung',
  },
  schaltauge: {
    name: 'Schaltauge', raeder: ['emtb', 'gravel'],
    wozu: 'Kleines Metallteil zwischen Rahmen und Schaltwerk. Es ist absichtlich die Sollbruchstelle: Bei einem Sturz biegt oder bricht es statt des Rahmens.',
    verschleiss: 'Von hinten gesehen steht das Schaltwerk schräg statt senkrecht. Schaltung springt, obwohl sie eingestellt war. Ersatz-Schaltauge passend zu deinem Rahmen mitnehmen!',
    anleitung: 'schaltauge',
  },
  kurbel: {
    name: 'Kurbel und Pedale', raeder: ['emtb', 'gravel'],
    wozu: 'Hier trittst du. Die Kurbel sitzt am Tretlager (beim E-MTB am Motor).',
    verschleiss: 'Knacken bei jeder Umdrehung (Pedal oder Kurbel locker), Spiel im Pedal, abgenutzte Pins oder Klickplatten.',
  },
  federgabel: {
    name: 'Federgabel', raeder: ['emtb'],
    wozu: 'Schluckt Schläge am Vorderrad, damit das Rad am Boden bleibt und du Kontrolle hast.',
    verschleiss: 'Ölfilm oder Dreck-Ring an den Standrohren, Kratzer darauf, Spiel (Gabel klackt beim Bremsen), sackt ab. Standrohre nach jeder Fahrt sauber wischen.',
  },
  daempfer: {
    name: 'Dämpfer (beim Fully)', raeder: ['emtb'],
    wozu: 'Federt den Hinterbau – nur bei vollgefederten Rädern.',
    verschleiss: 'Luftverlust (sackt ab), Öl am Kolben, Klacken. Druck regelmäßig mit Dämpferpumpe prüfen.',
  },
  gabel: {
    name: 'Gabel (starr)', raeder: ['gravel'],
    wozu: 'Hält das Vorderrad. Beim Gravel meist aus Carbon oder Stahl, ohne Federung.',
    verschleiss: 'Nach Sturz auf Risse oder Kerben prüfen, besonders bei Carbon. Im Zweifel nicht weiterfahren.',
  },
  steuersatz: {
    name: 'Steuersatz', raeder: ['emtb', 'gravel'],
    wozu: 'Lager, mit denen sich Gabel und Lenker drehen.',
    verschleiss: 'Klacken beim Bremsen (Vorderbremse ziehen, Rad vor und zurück schieben), Lenker rastet in Geradeausstellung ein.',
  },
  lenker: {
    name: 'Lenker und Vorbau', raeder: ['emtb', 'gravel'],
    wozu: 'Steuern, abstützen, Platz für Griffe, Bremse, Schaltung (und beim E-MTB Bedienteil).',
    verschleiss: 'Nach Sturz verbogen oder verdreht, Schrauben locker. Carbonlenker nach hartem Aufprall tauschen lassen.',
  },
  sattelstuetze: {
    name: 'Sattel und Sattelstütze', raeder: ['emtb', 'gravel'],
    wozu: 'Beim E-MTB oft eine absenkbare Stütze: per Hebel runter für steile Abfahrten, wieder hoch zum Treten.',
    verschleiss: 'Absenkbare Stütze sackt ein, wackelt oder kommt nicht mehr hoch. Sattelklemme knackt: reinigen und mit richtigem Drehmoment anziehen.',
  },
  akku: {
    name: 'Akku', raeder: ['emtb'],
    wozu: 'Speichert die Energie für den Motor. Teuerstes Einzelteil am E-MTB.',
    verschleiss: 'Reichweite wird über die Jahre kürzer (normal). Gehäuse mit Rissen oder Beulen: nicht mehr laden, nicht mehr nutzen, zum Händler.',
    anleitung: 'akku',
  },
  motor: {
    name: 'Motor', raeder: ['emtb'],
    wozu: 'Unterstützt dich beim Treten. Sitzt am Tretlager (Mittelmotor).',
    verschleiss: 'Ungewohnte Geräusche (Klackern, Mahlen), Fehlermeldungen im Display. Nicht selbst öffnen – Händler.',
  },
  display: {
    name: 'Display und Bedienteil', raeder: ['emtb'],
    wozu: 'Zeigt Akkustand und Unterstützungsstufe. Hier schaltest du ein und wählst die Stufe.',
    verschleiss: 'Fehlercodes notieren (Foto machen) und dem Händler nennen.',
  },
  sensor: {
    name: 'Geschwindigkeitssensor', raeder: ['emtb'],
    wozu: 'Misst die Geschwindigkeit über einen Magneten am Hinterrad (Speiche oder Bremsscheibe). Ohne ihn kein Motor.',
    verschleiss: 'Motor schaltet ab oder Display zeigt Fehler: Magnet verrutscht oder Sensor verdreht – nach dem Radausbau prüfen.',
  },
};

// ---------------- Anleitungen ----------------
// Jeder Schritt: t = Überschrift, x = Text, foto = welches Foto am eigenen Rad hilft,
// warn = Warnhinweis, offline = gehört zum Pannen-Modus
export const ANLEITUNGEN = {
  schlauch: {
    titel: 'Schlauch wechseln', panne: true,
    dauer: 'ca. 15–25 Minuten',
    werkzeug: 'Ersatzschlauch (passende Größe und Ventil), 2 Reifenheber, Pumpe oder CO₂, ggf. Inbus für die Steckachse',
    schritte: [
      { t: 'Sicher hinstellen', x: 'Weg vom Trail, Rad umdrehen oder an einen Baum lehnen. Beim E-MTB zuerst das System ausschalten.' },
      { t: 'Gang wählen (nur hinten)', x: 'Schalte vor dem Ausbau aufs <b>kleinste Ritzel</b> (schnellster Gang). Dann kommt das Rad leichter raus und wieder rein. Ohne Motor kurz die Kurbel mit der Hand drehen.' },
      { t: 'E-MTB-Hinterrad: Schaltwerk lösen', x: 'Viele Schaltwerke haben einen Kupplungshebel oder Knopf, der die Kette strafft. Schalte ihn <b>aus</b>, dann lässt sich das Schaltwerk leichter nach hinten ziehen.', foto: 'Foto vom Kupplungsschalter an deinem Schaltwerk (Nahaufnahme von hinten rechts)' },
      { t: 'Steckachse öffnen', x: 'Hebel aufklappen und Achse herausdrehen (oder mit Inbus lösen). Achse nicht in den Dreck legen.' },
      { t: 'Rad herausnehmen', x: 'Hinten: Schaltwerk mit einer Hand nach hinten ziehen, Rad nach unten und vorne herausrollen. Vorne: einfach nach unten herausnehmen.', warn: 'Bremshebel jetzt nicht ziehen! Sonst drücken sich die Beläge zusammen und die Scheibe passt nicht mehr dazwischen. Am besten etwas Dünnes (Pappe, Reifenheber) zwischen die Beläge klemmen.' },
      { t: 'Ursache suchen', x: 'Reifen außen ansehen und mit den Fingern <b>vorsichtig</b> innen entlangfahren: Dorn, Glas, Draht? Unbedingt entfernen, sonst ist der neue Schlauch gleich wieder platt.' },
      { t: 'Reifen abhebeln', x: 'Restluft ablassen. Gegenüber vom Ventil den Reifen in die Felgenmitte drücken (da ist mehr Platz). Reifenheber unter den Wulst, nach außen hebeln, einhängen. Zweiten Heber 10 cm daneben – dann rundherum lösen. Nur <b>eine</b> Seite muss runter.' },
      { t: 'Schlauch tauschen', x: 'Alten Schlauch raus. Neuen Schlauch leicht aufpumpen, damit er rund wird. Ventil zuerst ins Loch, dann den Schlauch rundherum einlegen.' },
      { t: 'Reifen aufziehen', x: 'Mit den Händen beim Ventil anfangen, nach beiden Seiten arbeiten. Das letzte Stück ist streng: Reifen rundherum in die Felgenmitte drücken. Heber nur zur Not – dabei den Schlauch nicht einklemmen.' },
      { t: 'Aufpumpen und prüfen', x: 'Erst wenig Luft, prüfen ob der Reifen rundherum gleichmäßig sitzt (Linie an der Flanke), dann auf Fahrdruck.' },
      { t: 'Rad einbauen', x: 'Bremsscheibe zwischen die Beläge, hinten Kette aufs kleinste Ritzel legen. Steckachse einschrauben und fest schließen. Kupplung am Schaltwerk wieder einschalten.' },
      { t: 'Prüfen vor dem Losfahren', x: 'Bremse 2–3 Mal ziehen, bis sie wieder greift. Rad drehen: schleift nichts? Beim E-MTB: System einschalten – kommt keine Fehlermeldung? Der Magnet für den Geschwindigkeitssensor muss am Sensor vorbeilaufen.', warn: 'Bei E-Bikes mit Motor in der Hinterradnabe ist der Ausbau anders (Kabel, Drehmomentstütze). Dafür die Herstelleranleitung nehmen.' },
    ],
  },

  tubeless: {
    titel: 'Tubeless-Panne', panne: true,
    dauer: 'ca. 5–30 Minuten',
    werkzeug: 'Reparatur-Set mit Plugs („Salami“) und Einführwerkzeug, Pumpe oder CO₂, Notschlauch, Ventilschlüssel, Reifenheber',
    schritte: [
      { t: 'Erst mal: Loch nach unten', x: 'Kleine Löcher dichtet die Milch oft selbst. Rad so drehen, dass das Loch <b>unten</b> ist, kurz warten, dann vorsichtig aufpumpen. Ein paar Meter fahren verteilt die Milch.' },
      { t: 'Hält nicht? Loch finden', x: 'Wo zischt es oder schäumt Milch heraus? Fremdkörper vorsichtig herausziehen.' },
      { t: 'Plug setzen', x: 'Einen Plug ins Einführwerkzeug fädeln, so dass er halb übersteht. Mit Druck ins Loch schieben, bis etwa 1 cm draußen bleibt. Werkzeug <b>gerade</b> herausziehen – der Plug bleibt stecken.', foto: 'Foto von deinem Plug-Werkzeug mit eingefädeltem Plug' },
      { t: 'Aufpumpen', x: 'Auf Fahrdruck pumpen, Rad drehen, damit Milch um den Plug läuft. Überstehendes Ende nicht abschneiden – es fährt sich ab.' },
      { t: 'Großer Schnitt? Notschlauch', x: 'Hält auch der Plug nicht (Schnitt in der Flanke, Riss), kommt ein Schlauch hinein. Rad ausbauen (siehe „Schlauch wechseln“).' },
      { t: 'Ventil heraus', x: 'Reifen auf einer Seite abhebeln. Ring am Tubeless-Ventil abschrauben, Ventil nach innen herausdrücken. Achtung: Milch läuft heraus – Rad dabei schräg halten.' },
      { t: 'Schlauch einlegen', x: 'Reifen innen auf Dorne prüfen. Bei großem Schnitt etwas Festes von innen dagegenlegen (Gel-Verpackung, Geldschein, Reifenflicken). Schlauch einlegen wie beim normalen Schlauchwechsel.' },
      { t: 'Langsam heimfahren', x: 'Mit Notschlauch etwas weniger Gas in Kurven, zu Hause sauber reparieren und Milch nachfüllen.', warn: 'Milch alle paar Monate kontrollieren – sie trocknet aus. Ohne Milch dichtet nichts.' },
    ],
  },

  kettenriss: {
    titel: 'Kette gerissen', panne: true,
    dauer: 'ca. 10–20 Minuten',
    werkzeug: 'Kettennieter (oft im Multitool), passendes Kettenschloss (gleiche Gangzahl!), evtl. Kettenschloss-Zange',
    schritte: [
      { t: 'Sofort aufhören zu treten', x: 'Beim E-MTB System ausschalten. Kette aufsammeln, sie hängt oft noch am Rad.' },
      { t: 'Kaputtes Stück finden', x: 'Meist ist ein Glied aufgebogen oder ein Bolzen halb heraus. Das kaputte <b>Außen- und Innenglied</b> müssen raus.' },
      { t: 'Mit Nieter kürzen', x: 'Kette in den Nieter legen, Bolzen des Nachbarglieds herausdrücken. Ziel: an einem Ende ein <b>Innenglied</b> (schmal), am anderen auch ein Innenglied – dazwischen kommt das Kettenschloss.', foto: 'Foto von deinem Multitool mit ausgeklapptem Kettennieter' },
      { t: 'Kette richtig einfädeln', x: 'Kette so einfädeln wie vorher: hinten über das kleinste Ritzel, dann durchs Schaltwerk – zwischen den beiden Blechen hindurch, über die obere Rolle und unter der unteren Rolle durch. Vorne aufs Kettenblatt. Tipp: Ein Foto deines Schaltwerks von der Seite hilft hier.' },
      { t: 'Kettenschloss einsetzen', x: 'Beide Hälften von außen und innen einsetzen, verbinden. Pedal festhalten oder Hinterrad bremsen und kräftig treten – es rastet hörbar ein.' },
      { t: 'Vorsichtig weiter', x: 'Die Kette ist jetzt kürzer. <b>Nicht</b> mehr auf das größte Ritzel hinten schalten – das kann das Schaltwerk abreißen. Ruhig treten, besonders beim E-MTB mit niedriger Unterstützung.', warn: 'Kein Kettenschloss dabei? Dann kann man den Bolzen mit dem Nieter wieder einpressen – das hält nur notdürftig. Lieber eins dabeihaben: es wiegt fast nichts.' },
    ],
  },

  schaltauge: {
    titel: 'Schaltauge verbogen oder gebrochen', panne: true,
    dauer: 'ca. 10–30 Minuten',
    werkzeug: 'Ersatz-Schaltauge (passt nur zu deinem Rahmen!), Inbus, ggf. Kettennieter + Kettenschloss',
    schritte: [
      { t: 'Erkennen', x: 'Nach Sturz oder Ast: Von hinten gesehen steht das Schaltwerk schräg zum Rad. Die Schaltung springt, oder das Schaltwerk kommt in den großen Gängen den Speichen gefährlich nahe.', foto: 'Foto von hinten auf dein Schaltwerk, wenn alles in Ordnung ist (zum Vergleich)' },
      { t: 'Nicht in die großen Gänge', x: 'Ein schräges Schaltwerk kann in die Speichen geraten und alles zerstören. Bis zur Reparatur nur in den mittleren und kleinen Gängen fahren.' },
      { t: 'Leicht verbogen: vorsichtig richten', x: 'Notlösung: Hinterrad drin lassen, Schaltwerk mit der Hand <b>langsam</b> zurückbiegen, bis es senkrecht steht. Nicht ruckartig – das Schaltauge kann brechen. Zu Hause tauschen oder mit Richtwerkzeug richten lassen.' },
      { t: 'Ersatz dabei? Tauschen', x: 'Hinterrad raus, Schaltwerk abschrauben, altes Schaltauge abschrauben, neues anschrauben, Schaltwerk wieder dran. Danach meist kurz nachstellen (siehe „Schaltung nachstellen“).' },
      { t: 'Gebrochen, kein Ersatz: Singlespeed', x: 'Kette mit dem Nieter öffnen, Schaltwerk mit Kabelbinder sicher am Rahmen festmachen (nicht in die Speichen!). Kette direkt über ein mittleres Ritzel und das Kettenblatt legen, so kürzen, dass sie straff ist, mit Kettenschloss schließen. Jetzt hast du einen Gang.', warn: 'Das ist nur zum Heimkommen. Wenn die Kette ständig abspringt: schieben oder abholen lassen.' },
    ],
  },

  kette: {
    titel: 'Kette pflegen und Kettenschloss',
    dauer: 'ca. 10 Minuten',
    werkzeug: 'Lappen, Kettenöl oder -wachs, Kettenlehre, Kettenschloss-Zange',
    schritte: [
      { t: 'Abwischen', x: 'Lappen um die Kette, Kurbel rückwärts drehen. Grober Dreck muss weg, bevor neues Öl kommt. Bei viel Matsch vorher mit wenig Wasser abspülen und gut trocknen lassen.' },
      { t: 'Ölen', x: 'Je Glied ein kleiner Tropfen auf die Innenseite (auf die Röllchen), dabei Kurbel rückwärts drehen. Einige Minuten einziehen lassen.', warn: 'Kein Öl auf Bremsscheiben oder Beläge! Beim Sprühen Bremse abdecken.' },
      { t: 'Überschuss weg', x: 'Kette außen gründlich abwischen. Öl gehört <b>in</b> die Kette, nicht außen drauf – dort sammelt es nur Dreck.' },
      { t: 'Verschleiß messen', x: 'Kettenlehre einsetzen. Fällt sie bei 0,5 % ganz hinein, ist die Kette bei 11/12-fach fällig. Rechtzeitig tauschen schont Kassette und Kettenblatt. Beim E-MTB öfter messen, z. B. alle 500 km.', foto: 'Foto von deiner Kettenlehre an der Kette' },
      { t: 'Kettenschloss öffnen', x: 'Kettenschloss nach oben zwischen Kettenblatt und Kassette drehen. Mit der Kettenschloss-Zange die beiden Nachbar-Glieder zusammendrücken – das Schloss springt auf.' },
      { t: 'Kettenschloss schließen', x: 'Beide Hälften einsetzen, Kette oben spannen, Hinterbremse ziehen und kräftig aufs Pedal treten – es rastet ein. Prüfen, ob es sich frei bewegt.', warn: 'Bei 11- und 12-fach-Ketten sind Kettenschlösser meist nur für einmaliges Schließen gedacht. Ein frisches bereithalten.' },
    ],
  },

  bremse: {
    titel: 'Bremsbeläge prüfen und wechseln', hersteller: true,
    dauer: 'ca. 20 Minuten pro Bremse',
    werkzeug: 'Neue Beläge (passend zum Bremsenmodell!), Inbus oder Torx, Plastik-Reifenheber, sauberer Lappen, Taschenlampe',
    schritte: [
      { t: 'Prüfen ohne Ausbau', x: 'Mit Taschenlampe von oben in den Bremssattel schauen. Der Belag (das Bremsmaterial auf dem Metallträger) sollte noch mindestens etwa 1 mm dick sein. Quietscht oder kratzt es metallisch, sofort prüfen.', foto: 'Foto von oben in deinen Bremssattel mit Taschenlampe' },
      { t: 'Rad ausbauen', x: 'Wie beim Schlauchwechsel. Danach den Bremshebel <b>nicht</b> ziehen.' },
      { t: 'Beläge herausnehmen', x: 'Sicherungsstift oder -schraube oben am Sattel lösen. Beläge mit Feder nach oben (manche nach unten) herausziehen. Anordnung merken oder Foto machen.' },
      { t: 'Kolben zurückdrücken', x: 'Mit einem <b>Plastik</b>-Reifenheber die Kolben vorsichtig ganz zurückdrücken, damit die dickeren neuen Beläge Platz haben. Kein Schraubenzieher – er beschädigt die Kolben.' },
      { t: 'Neue Beläge einsetzen', x: 'Neue Beläge mit Feder dazwischen genauso einsetzen wie die alten. Beläge nur am Metallträger anfassen. Stift oder Schraube wieder sichern.' },
      { t: 'Rad rein, Hebel pumpen', x: 'Rad einbauen. Bremshebel mehrmals ziehen, bis der Druckpunkt wieder da ist.' },
      { t: 'Einbremsen', x: 'Neue Beläge greifen erst richtig nach dem Einbremsen: auf ebenem Stück etwa 20 Mal aus ca. 20 km/h kräftig, aber nicht bis zum Stillstand bremsen.', warn: 'Bremsen sind sicherheitsrelevant. Halte dich an die Anleitung deines Bremsenherstellers (Modell steht am Bremshebel). Bremsflüssigkeit ist je nach Marke Mineralöl oder DOT – nie verwechseln. Wenn du unsicher bist: Werkstatt.' },
    ],
  },

  schaltung: {
    titel: 'Schaltung nachstellen',
    dauer: 'ca. 10 Minuten',
    werkzeug: 'Keins – nur die Hand. Rad aufhängen oder jemand hält das Hinterrad hoch.',
    schritte: [
      { t: 'Ist es wirklich die Einstellung?', x: 'Schaltauge gerade (von hinten senkrecht)? Kette nicht verschlissen? Wenn das Schaltauge krumm ist, hilft Einstellen nicht.' },
      { t: 'Einstellschraube finden', x: 'Am Schaltwerk oder am Schalthebel sitzt eine kleine Rändelschraube, durch die der Schaltzug läuft.', foto: 'Foto von der Einstellschraube an deinem Schaltwerk oder Schalthebel' },
      { t: 'Kette klettert schlecht nach oben?', x: 'Wenn die Kette nur zögerlich auf das nächstgrößere Ritzel geht: Einstellschraube eine <b>Vierteldrehung</b> gegen den Uhrzeigersinn (Zug wird straffer). Kurbel drehen, durchschalten, wiederholen.' },
      { t: 'Kette fällt schlecht nach unten?', x: 'Wenn sie zögerlich aufs kleinere Ritzel geht: Vierteldrehung im Uhrzeigersinn.' },
      { t: 'Feinschliff', x: 'Ziel: Alle Gänge schalten sauber und es rattert in keinem Gang. Immer nur kleine Schritte drehen.', warn: 'Die beiden Anschlagschrauben (meist mit H und L beschriftet) nicht verstellen – sie verhindern, dass die Kette in die Speichen fällt. Elektronische Schaltungen werden über Knöpfe oder App eingestellt: Herstelleranleitung.' },
    ],
  },

  akku: {
    titel: 'Akku-Pflege im Winter', hersteller: true,
    dauer: 'ein paar Minuten',
    werkzeug: 'Ladegerät, evtl. Neopren-Schutzhülle',
    schritte: [
      { t: 'Kälte senkt die Reichweite', x: 'Unter etwa 5 °C liefert der Akku spürbar weniger. Plane kürzere Touren oder mehr Reserve ein.' },
      { t: 'Warm lagern, spät einsetzen', x: 'Den Akku in der Wohnung lagern und erst kurz vor der Fahrt einsetzen. Eine Neopren-Hülle hält ihn unterwegs länger warm.' },
      { t: 'Nur warm laden', x: 'Nach der Fahrt den Akku erst auf Zimmertemperatur kommen lassen, dann laden. Nicht im kalten Keller oder in der Garage laden.' },
      { t: 'Winterpause', x: 'Fährst du länger nicht: Akku halb voll lagern (ungefähr 30–60 %), trocken, bei Zimmertemperatur. Alle paar Monate den Stand prüfen und nachladen. Nicht dauerhaft am Ladegerät lassen.' },
      { t: 'Transport', x: 'Auf dem Fahrradträger im Winter den Akku abnehmen und im warmen Auto mitnehmen. Kontakte trocken halten.', warn: 'Halte dich an die Akku-Anleitung deines Herstellers (bei Bosch z. B. in der Bedienungsanleitung des Akkus) – Temperaturen und Ladestand können je nach Modell abweichen. Beschädigten Akku nie laden.' },
    ],
  },
};

// ---------------- Pannen-Modus: Was ist los? ----------------
export const PANNEN = [
  { id: 'platt', icon: '💨', titel: 'Reifen platt', frage: 'Fährst du mit Schlauch oder tubeless?',
    wahl: [{ text: 'Mit Schlauch', anleitung: 'schlauch' }, { text: 'Tubeless (mit Milch)', anleitung: 'tubeless' }, { text: 'Weiß ich nicht', info: 'Schau aufs Ventil: Sitzt außen am Ventilschaft eine Ring-Mutter direkt an der Felge und spritzt beim Loch weiße Milch heraus? Dann tubeless. Sonst Schlauch.' }] },
  { id: 'kette', icon: '⛓', titel: 'Kette gerissen', anleitung: 'kettenriss' },
  { id: 'schaltung', icon: '⚙️', titel: 'Schaltwerk schief / Schaltung spinnt', anleitung: 'schaltauge' },
  { id: 'kette-ab', icon: '↩️', titel: 'Kette abgesprungen', info: 'Schalte vorne und hinten in einen mittleren Gang (wenn möglich). Kette mit der Hand oben aufs Kettenblatt legen und die Kurbel langsam rückwärts drehen – sie läuft meist von selbst wieder drauf. Springt sie ständig ab: Schaltauge prüfen.', anleitung: 'schaltauge' },
  { id: 'bremse', icon: '🛑', titel: 'Bremse greift nicht / schleift', info: '<b>Greift nicht oder Hebel geht bis zum Lenker:</b> Nicht weiterfahren. Schieben oder abholen lassen. Zu Hause oder in der Werkstatt prüfen (Luft im System, verölte Beläge).<br><br><b>Schleift nur:</b> Steckachse lösen, Rad gerade sitzen lassen, Achse wieder festziehen. Hilft das nicht, Hebel ein paar Mal ziehen. Leichtes Schleifen kann man notfalls fahren.', anleitung: 'bremse' },
  { id: 'akku', icon: '🔋', titel: 'Akku leer / Motor aus', info: '<b>Erst prüfen:</b> Akku richtig eingerastet? Kontakte trocken? System aus- und wieder einschalten. Fehlercode im Display? Foto davon machen.<br><br><b>Akku wirklich leer:</b> Ein E-MTB fährt sich ohne Motor schwer (über 20 kg). Kleinen Gang wählen, ruhig treten, steile Anstiege schieben. Plane den kürzesten Rückweg – lieber über Forstwege als über Trails. Bei Kälte den Akku kurz in die Jacke stecken, dann kommen oft noch ein paar Prozent zurück.' },
  { id: 'speiche', icon: '🎡', titel: 'Speiche gebrochen', info: 'Gebrochene Speiche herausnehmen oder um eine Nachbarspeiche wickeln, damit sie nicht in Bremse oder Schaltung gerät. Rad drehen: Schleift es an der Bremse oder am Rahmen? Dann langsam heimfahren oder schieben. Mehrere gebrochene Speichen: nicht weiterfahren.' },
  { id: 'sturz', icon: '🚑', titel: 'Sturz / verletzt', notfall: true, info: '<b>Bei Verletzten: Notruf 112.</b> Ruhe bewahren, Unfallstelle sichern, Erste Hilfe. Beim Anruf sagen: Wo? Was ist passiert? Wie viele Verletzte?<br><br><b>Nach einem Sturz ohne Verletzung:</b> Lenker gerade? Bremsen greifen? Schaltauge gerade? Carbon-Teile auf Risse prüfen. Im Zweifel langsam und vorsichtig heim.' },
];
