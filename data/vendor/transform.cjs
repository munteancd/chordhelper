// Transform @tombatossals/chords-db lib JSON into ChordHelper's CHORD_LIBRARY format.
const fs = require('fs');
const guitar = require('./chords-db-guitar.json');
const ukulele = require('./chords-db-ukulele.json');

// Map vendor suffix -> our quality string appended to the root.
// null = skip. '' = plain major.
const SUFFIX_MAP = {
  major: '',
  minor: 'm',
  m: 'm',
  '7': '7',
  maj7: 'maj7',
  m7: 'm7',
  '6': '6',
  '9': '9',
  sus2: 'sus2',
  sus4: 'sus4',
  dim: 'dim',
  aug: 'aug',
  add9: 'add9',
  m6: 'm6',
  m9: 'm9',
};

// Pick first position whose open/muted strings carry no finger (matches our data-integrity rule).
function pickPosition(positions, nStrings) {
  for (const p of positions) {
    if (!p.frets || p.frets.length !== nStrings) continue;
    if (!p.fingers || p.fingers.length !== nStrings) continue;
    let ok = true;
    for (let i = 0; i < nStrings; i++) {
      if (p.frets[i] <= 0 && p.fingers[i] !== 0) { ok = false; break; }
    }
    if (ok) return p;
  }
  return null;
}

function build(db, nStrings) {
  const out = {};
  for (const key of Object.keys(db.chords)) {
    for (const entry of db.chords[key]) {
      if (!(entry.suffix in SUFFIX_MAP)) continue;
      const q = SUFFIX_MAP[entry.suffix];
      const name = entry.key + q; // entry.key is the proper spelling (C#, F#, Bb, ...)
      if (out[name]) continue; // keep first key occurrence
      const pos = pickPosition(entry.positions, nStrings);
      if (!pos) continue;
      out[name] = {
        name,
        frets: pos.frets.slice(),
        fingers: pos.fingers.slice(),
        baseFret: pos.baseFret || 1,
      };
    }
  }
  return out;
}

const guitarLib = build(guitar, 6);
const ukuleleLib = build(ukulele, 4);

console.error('guitar chords:', Object.keys(guitarLib).length);
console.error('ukulele chords:', Object.keys(ukuleleLib).length);

function fmt(lib) {
  const lines = [];
  for (const name of Object.keys(lib)) {
    const c = lib[name];
    const key = /^[A-G]$/.test(name) || /^[A-Za-z0-9]+$/.test(name) ? name : `'${name}'`;
    lines.push(
      `    ${key}: { name: ${JSON.stringify(c.name)}, frets: [${c.frets.join(',')}], fingers: [${c.fingers.join(',')}], baseFret: ${c.baseFret} },`
    );
  }
  return lines.join('\n');
}

const header = `// data/chordLibrary.js
// Comprehensive chord dictionary. frets: -1 muted, 0 open, >=1 fret pressed (low string first).
// guitar string order: E A D G B e; ukulele: G C E A. fingers: 0 none, 1-4.
// Source: @tombatossals/chords-db v0.5.1 (MIT). Transformed; preferred low-fret voicing per chord.
// See data/vendor/ORIGIN.md.
export const CHORD_LIBRARY = {
  guitar: {
${fmt(guitarLib)}
  },
  ukulele: {
${fmt(ukuleleLib)}
  },
};
`;

fs.writeFileSync(__dirname + '/chordLibrary.out.js', header);
console.error('wrote chordLibrary.out.js');
