// Schematische Rad-Grafik (selbst gezeichnet). Jedes Teil ist eine Gruppe mit data-teil.
// rad: 'emtb' oder 'gravel'

const R = [200, 340];  // Hinterachse
const F = [610, 340];  // Vorderachse
const BB = [380, 350]; // Tretlager

function laufrad(c, emtb, seite) {
  const [x, y] = c;
  const reifenBreite = emtb ? 22 : 12;
  const speichen = [];
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6;
    speichen.push(`<line x1="${x}" y1="${y}" x2="${(x + 104 * Math.cos(a)).toFixed(1)}" y2="${(y + 104 * Math.sin(a)).toFixed(1)}"/>`);
  }
  return `
  <g class="teil" data-teil="reifen"><circle cx="${x}" cy="${y}" r="${125 - reifenBreite / 2}" class="reifen" stroke-width="${reifenBreite}"/></g>
  <g class="teil" data-teil="felge"><circle cx="${x}" cy="${y}" r="108" class="duenn" stroke-width="5"/><g class="speiche">${speichen.join('')}</g></g>
  <g class="teil" data-teil="bremsscheibe"><circle cx="${x}" cy="${y}" r="42" class="scheibe" stroke-width="6"/></g>
  <g class="teil" data-teil="steckachse"><circle cx="${x}" cy="${y}" r="10" class="voll"/></g>
  <g class="teil" data-teil="bremse"><rect x="${seite === 'h' ? x - 52 : x - 58}" y="${y - 50}" width="26" height="18" rx="4" class="voll"/></g>`;
}

export function radSvg(rad) {
  const emtb = rad === 'emtb';
  const [bx, by] = BB;
  const HT = [560, 172], HB = [578, 232], ST = [345, 172];
  const oberrohr = emtb ? [[352, 215], [560, 182]] : [[350, 190], [560, 178]];

  return `<svg viewBox="0 0 800 500" class="rad-svg" role="img" aria-label="Schematisches ${emtb ? 'E-MTB' : 'Gravelbike'}. Tippe auf ein Teil.">
  ${laufrad(R, emtb, 'h')}
  ${laufrad(F, emtb, 'v')}

  <!-- Rahmen -->
  <g class="rahmen">
    <line x1="${bx}" y1="${by}" x2="${ST[0]}" y2="${ST[1]}"/>
    <line x1="${oberrohr[0][0]}" y1="${oberrohr[0][1]}" x2="${oberrohr[1][0]}" y2="${oberrohr[1][1]}"/>
    <line x1="${bx}" y1="${by}" x2="${HB[0]}" y2="${HB[1]}" stroke-width="${emtb ? 26 : 14}"/>
    <line x1="${bx}" y1="${by}" x2="${R[0]}" y2="${R[1]}"/>
    <line x1="352" y1="200" x2="${R[0]}" y2="${R[1]}"/>
  </g>

  <g class="teil" data-teil="steuersatz"><line x1="${HT[0]}" y1="${HT[1]}" x2="${HB[0]}" y2="${HB[1]}" class="dick" stroke-width="20"/></g>

  ${emtb ? `
  <g class="teil" data-teil="akku"><line x1="412" y1="318" x2="548" y2="238" class="akku" stroke-width="20"/></g>
  <g class="teil" data-teil="daempfer"><line x1="372" y1="262" x2="446" y2="212" class="daempfer" stroke-width="14"/></g>
  <g class="teil" data-teil="federgabel">
    <line x1="${HB[0]}" y1="${HB[1]}" x2="592" y2="282" class="standrohr" stroke-width="13"/>
    <line x1="592" y1="282" x2="${F[0]}" y2="${F[1]}" class="dick" stroke-width="18"/>
  </g>` : `
  <g class="teil" data-teil="gabel"><line x1="${HB[0]}" y1="${HB[1]}" x2="${F[0]}" y2="${F[1]}" class="dick" stroke-width="12"/></g>`}

  <!-- Sattel -->
  <g class="teil" data-teil="sattelstuetze">
    <line x1="${ST[0]}" y1="${ST[1]}" x2="334" y2="128" class="dick" stroke-width="10"/>
    <path d="M290 122 Q330 112 372 120 L370 130 Q330 126 292 132 Z" class="voll"/>
  </g>

  <!-- Lenker -->
  <g class="teil" data-teil="lenker">
    <line x1="${HT[0]}" y1="${HT[1]}" x2="566" y2="142" class="dick" stroke-width="10"/>
    <line x1="566" y1="142" x2="598" y2="136" class="dick" stroke-width="10"/>
    ${emtb
      ? '<line x1="598" y1="136" x2="606" y2="130" class="dick" stroke-width="12"/>'
      : '<path d="M598 136 L622 138 Q640 142 638 168 Q636 196 612 196" class="dick" stroke-width="9" fill="none"/>'}
  </g>
  ${emtb ? `
  <g class="teil" data-teil="bremshebel"><line x1="604" y1="134" x2="636" y2="146" class="dick" stroke-width="7"/></g>
  <g class="teil" data-teil="display"><rect x="560" y="112" width="30" height="20" rx="4" class="voll"/></g>` : `
  <g class="teil" data-teil="schaltbremsgriff"><path d="M620 134 L640 128 L648 150 L630 176" class="dick" stroke-width="8" fill="none"/></g>`}

  <!-- Antrieb -->
  ${emtb ? `<g class="teil" data-teil="motor"><rect x="${bx - 42}" y="${by - 38}" width="84" height="70" rx="18" class="motor"/></g>` : ''}
  <g class="teil" data-teil="kette">
    <path d="M${bx} ${by - (emtb ? 30 : 40)} L${R[0]} ${R[1] - 28} M${bx} ${by + (emtb ? 30 : 40)} L222 412" class="kette" stroke-width="5" fill="none"/>
  </g>
  <g class="teil" data-teil="kettenschloss"><rect x="283" y="${emtb ? 322 : 316}" width="16" height="9" rx="3" class="schloss"/></g>
  <g class="teil" data-teil="kassette"><circle cx="${R[0]}" cy="${R[1]}" r="28" class="dick" stroke-width="6"/><circle cx="${R[0]}" cy="${R[1]}" r="18" class="duenn" stroke-width="4"/></g>
  <g class="teil" data-teil="kettenblatt"><circle cx="${bx}" cy="${by}" r="${emtb ? 30 : 40}" class="dick" stroke-width="6" fill="none"/></g>
  <g class="teil" data-teil="schaltauge"><circle cx="212" cy="358" r="9" class="schaltauge"/></g>
  <g class="teil" data-teil="schaltwerk">
    <line x1="212" y1="362" x2="222" y2="412" class="dick" stroke-width="10"/>
    <circle cx="214" cy="380" r="7" class="voll"/><circle cx="222" cy="410" r="7" class="voll"/>
  </g>
  <g class="teil" data-teil="kurbel">
    <line x1="${bx}" y1="${by}" x2="${bx + 32}" y2="${by + 68}" class="dick" stroke-width="12"/>
    <rect x="${bx + 14}" y="${by + 64}" width="38" height="10" rx="3" class="voll"/>
  </g>
  ${emtb ? `<g class="teil" data-teil="sensor"><rect x="248" y="330" width="22" height="12" rx="3" class="voll"/></g>` : ''}
</svg>`;
}
