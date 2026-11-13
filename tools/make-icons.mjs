// Erzeugt die App-Icons als PNG ohne Zusatzpakete.
// Aufruf: node tools/make-icons.mjs
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x14, 0x53, 0x2d];      // dunkelgrün
const FG = [0xff, 0xff, 0xff];      // weiß
const AMP = [0xfa, 0xcc, 0x15];     // gelb (Ampelpunkt)

// Zeichnung im 512er-Raster. Rückgabe: Farbe oder null (= Hintergrund)
function farbe(x, y) {
  const d = (cx, cy) => Math.hypot(x - cx, y - cy);
  // zwei Räder
  for (const cx of [150, 362]) {
    const r = d(cx, 330);
    if (r >= 70 && r <= 90) return FG;
    if (r <= 14) return FG;
  }
  // Rahmen: Linien
  const linie = (x1, y1, x2, y2, w) => {
    const dx = x2 - x1, dy = y2 - y1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)) <= w;
  };
  const W = 13;
  if (linie(150, 330, 236, 330, W) || linie(236, 330, 330, 220, W) || linie(150, 330, 210, 220, W)
    || linie(210, 220, 330, 220, W) || linie(330, 220, 362, 330, W) || linie(210, 220, 236, 330, W)
    || linie(330, 220, 318, 178, W) || linie(300, 172, 350, 172, W) || linie(196, 200, 236, 200, W)) return FG;
  // Ampelpunkt oben links
  if (d(150, 150) <= 50) return AMP;
  return null;
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, rand = 0) {
  const SS = 3;
  const raw = Buffer.alloc((size * 3 + 1) * size);
  const scale = (512 + 2 * rand) / size;
  for (let py = 0; py < size; py++) {
    raw[py * (size * 3 + 1)] = 0;
    for (let px = 0; px < size; px++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
        const x = (px + (sx + 0.5) / SS) * scale - rand;
        const y = (py + (sy + 0.5) / SS) * scale - rand;
        const f = farbe(x, y) || BG;
        r += f[0]; g += f[1]; b += f[2];
      }
      const o = py * (size * 3 + 1) + 1 + px * 3;
      raw[o] = r / (SS * SS); raw[o + 1] = g / (SS * SS); raw[o + 2] = b / (SS * SS);
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}

writeFileSync('icons/apple-touch-icon.png', png(180, 30));
writeFileSync('icons/icon-192.png', png(192, 20));
writeFileSync('icons/icon-512.png', png(512, 40));
writeFileSync('icons/icon-maskable-512.png', png(512, 110));
console.log('Icons erstellt.');
