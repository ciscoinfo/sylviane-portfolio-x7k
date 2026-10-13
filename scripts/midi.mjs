import fs from 'node:fs';
export function parseMidi(path) {
  const b = fs.readFileSync(path);
  let p = 0;
  const u32 = () => ((p += 4), b.readUInt32BE(p - 4));
  const u16 = () => ((p += 2), b.readUInt16BE(p - 2));
  const vlq = () => { let v = 0, c; do { c = b[p++]; v = (v << 7) | (c & 0x7f); } while (c & 0x80); return v; };
  if (b.toString('latin1', 0, 4) !== 'MThd') throw new Error('pas un MIDI');
  p = 8; const fmt = u16(), ntr = u16(), div = u16();
  const tracks = []; const tempos = []; const sigs = [];
  for (let t = 0; t < ntr; t++) {
    p += 4; const len = u32(); const end = p + len;
    let tick = 0, run = 0; const on = {}; const notes = []; let name = '';
    while (p < end) {
      tick += vlq();
      let s = b[p];
      if (s < 0x80) s = run; else { p++; if (s < 0xf0) run = s; }
      if (s === 0xff) {
        const type = b[p++]; const l = vlq(); const d = b.slice(p, p + l); p += l;
        if (type === 0x51) tempos.push([tick, d.readUIntBE(0, 3)]);
        if (type === 0x58) sigs.push([tick, d[0], 2 ** d[1]]);
        if (type === 0x03) name = d.toString('latin1');
      } else if (s === 0xf0 || s === 0xf7) { const l = vlq(); p += l; }
      else {
        const hi = s & 0xf0;
        if (hi === 0x90 || hi === 0x80) {
          const n = b[p++], v = b[p++];
          if (hi === 0x90 && v > 0) on[n] = tick;
          else if (on[n] !== undefined) { notes.push({ n, start: on[n] / div, dur: (tick - on[n]) / div }); delete on[n]; }
        } else if (hi === 0xc0 || hi === 0xd0) p += 1; else p += 2;
      }
    }
    p = end; tracks.push({ name, notes });
  }
  return { fmt, div, tracks, tempos, sigs };
}
