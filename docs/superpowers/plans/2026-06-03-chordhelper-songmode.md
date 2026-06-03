# ChordHelper v2 — Song Mode + Full Chord Dictionary — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the user paste any song's chord sheet (chords-above-lyrics) and see it rendered with chord diagrams above the lyrics, hear each chord, get a suggested strumming pattern + metronome, and save the song locally — backed by a comprehensive chord dictionary.

**Architecture:** Extends v1's data-driven, pure-modules-plus-thin-UI structure. New PURE modules (`chordLib` resolver, `chordSheet` parser, `songStore`) are unit-tested with `node --test`; new UI (`songMode`) is thin and reuses v1's `chordRenderer`, `audioEngine`, `strummingView`. New comprehensive dictionary in `data/chordLibrary.js`.

**Tech Stack:** Vanilla JS (ES modules, no build), Web Audio (reused), localStorage, `node --test`. Same conventions as v1: chord arrays ordered low-string-first; `-1` muted, `0` open, `>=1` fret pressed; `fingers` 0=none, 1-4.

> Read the design doc first: `docs/superpowers/specs/2026-06-03-chordhelper-songmode-design.md`.

---

## File Structure

```
data/
  chordLibrary.js        # NEW: comprehensive dictionary {guitar:{...}, ukulele:{...}}
  vendor/                # NEW: raw source dataset + LICENSE/origin note (if vendored)
js/
  chordLib.js            # NEW (pure): getChordShape, isChordToken, name normalization
  chordSheet.js          # NEW (pure): parseChordSheet
  songStore.js           # NEW: local persistence over injected storage
  songMode.js            # NEW: songs list / new / view screens
  router.js              # MODIFY: add songs / song / song-new routes
  screens.js             # MODIFY: add "Piese" button to Home
  app.js                 # MODIFY: wire new routes
service-worker.js        # MODIFY: cache new files, bump version
css/styles.css           # MODIFY: song-mode styles
test/
  chordLib.test.js       # NEW
  chordSheet.test.js     # NEW
  songStore.test.js      # NEW
  chordLibrary.test.js   # NEW (data-integrity)
```

---

## Task 1: Comprehensive chord dictionary

**Files:**
- Create: `data/chordLibrary.js`
- Create: `test/chordLibrary.test.js`
- (Optional) Create: `data/vendor/` with raw source + origin/license note

**Approach:** PREFER vendoring a verified, permissively-licensed open dataset
(e.g. MIT `@tombatossals/chords-db`, which ships guitar and ukulele position data).
If you have network/npm access:
1. Obtain the dataset (e.g. `npm pack @tombatossals/chords-db` or fetch its JSON from
   the package/GitHub), save the raw JSON under `data/vendor/` together with a short
   `data/vendor/ORIGIN.md` naming the source, version, and license (confirm it is
   permissive — MIT/CC — before use).
2. Transform it into our format and write `data/chordLibrary.js`.

If you do NOT have network access, use the hand-authored fallback set below verbatim —
it covers the common chords for both instruments. Either way, the data-integrity test
must pass, and a human/reviewer must confirm the shapes are musically correct.

- [ ] **Step 1: Write the data-integrity test**

```js
// test/chordLibrary.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHORD_LIBRARY } from '../data/chordLibrary.js';
import { INSTRUMENTS } from '../data/instruments.js';

for (const instId of ['guitar', 'ukulele']) {
  const lib = CHORD_LIBRARY[instId];
  const n = INSTRUMENTS[instId].strings;

  test(`${instId}: library is non-empty`, () => {
    assert.ok(Object.keys(lib).length >= 15, `${instId} should have >=15 chords`);
  });

  test(`${instId}: every shape has correct array lengths and finger consistency`, () => {
    for (const [name, ch] of Object.entries(lib)) {
      assert.equal(ch.frets.length, n, `${name} frets length`);
      assert.equal(ch.fingers.length, n, `${name} fingers length`);
      assert.equal(ch.name, name, `${name} self-consistent name`);
      for (let i = 0; i < n; i++) {
        if (ch.frets[i] <= 0) assert.equal(ch.fingers[i], 0, `${name} string ${i}: no finger on open/muted`);
      }
    }
  });

  test(`${instId}: includes the common roots as major chords`, () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A']) {
      assert.ok(lib[root], `${instId} missing major chord ${root}`);
    }
  });
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/chordLibrary.test.js`
Expected: FAIL — `data/chordLibrary.js` missing.

- [ ] **Step 3: Create `data/chordLibrary.js`**

Use the vendored+transformed dataset if available. Otherwise use this hand-authored
fallback (low-string-first; guitar = E A D G B e, ukulele = G C E A):

```js
// data/chordLibrary.js
// Comprehensive-enough chord dictionary. frets: -1 muted, 0 open, >=1 fret (low string first).
// IMPORTANT: shapes must be verified against a trusted reference before shipping.
export const CHORD_LIBRARY = {
  guitar: {
    C:      { name: 'C',      frets: [-1,3,2,0,1,0], fingers: [0,3,2,0,1,0], baseFret: 1 },
    Cmaj7:  { name: 'Cmaj7',  frets: [-1,3,2,0,0,0], fingers: [0,3,2,0,0,0], baseFret: 1 },
    C7:     { name: 'C7',     frets: [-1,3,2,3,1,0], fingers: [0,3,2,4,1,0], baseFret: 1 },
    Cm:     { name: 'Cm',     frets: [-1,3,5,5,4,3], fingers: [0,1,3,4,2,1], baseFret: 1 },
    D:      { name: 'D',      frets: [-1,-1,0,2,3,2], fingers: [0,0,0,1,3,2], baseFret: 1 },
    Dm:     { name: 'Dm',     frets: [-1,-1,0,2,3,1], fingers: [0,0,0,2,3,1], baseFret: 1 },
    D7:     { name: 'D7',     frets: [-1,-1,0,2,1,2], fingers: [0,0,0,3,1,2], baseFret: 1 },
    Dm7:    { name: 'Dm7',    frets: [-1,-1,0,2,1,1], fingers: [0,0,0,2,1,1], baseFret: 1 },
    Dsus4:  { name: 'Dsus4',  frets: [-1,-1,0,2,3,3], fingers: [0,0,0,1,2,3], baseFret: 1 },
    E:      { name: 'E',      frets: [0,2,2,1,0,0], fingers: [0,2,3,1,0,0], baseFret: 1 },
    Em:     { name: 'Em',     frets: [0,2,2,0,0,0], fingers: [0,2,3,0,0,0], baseFret: 1 },
    E7:     { name: 'E7',     frets: [0,2,0,1,0,0], fingers: [0,2,0,1,0,0], baseFret: 1 },
    Em7:    { name: 'Em7',    frets: [0,2,0,0,0,0], fingers: [0,2,0,0,0,0], baseFret: 1 },
    F:      { name: 'F',      frets: [1,3,3,2,1,1], fingers: [1,3,4,2,1,1], baseFret: 1 },
    Fmaj7:  { name: 'Fmaj7',  frets: [-1,-1,3,2,1,0], fingers: [0,0,3,2,1,0], baseFret: 1 },
    Fm:     { name: 'Fm',     frets: [1,3,3,1,1,1], fingers: [1,3,4,1,1,1], baseFret: 1 },
    G:      { name: 'G',      frets: [3,2,0,0,0,3], fingers: [2,1,0,0,0,3], baseFret: 1 },
    G7:     { name: 'G7',     frets: [3,2,0,0,0,1], fingers: [3,2,0,0,0,1], baseFret: 1 },
    Gm:     { name: 'Gm',     frets: [3,5,5,3,3,3], fingers: [1,3,4,1,1,1], baseFret: 1 },
    A:      { name: 'A',      frets: [-1,0,2,2,2,0], fingers: [0,0,1,2,3,0], baseFret: 1 },
    Am:     { name: 'Am',     frets: [-1,0,2,2,1,0], fingers: [0,0,2,3,1,0], baseFret: 1 },
    A7:     { name: 'A7',     frets: [-1,0,2,0,2,0], fingers: [0,0,2,0,3,0], baseFret: 1 },
    Am7:    { name: 'Am7',    frets: [-1,0,2,0,1,0], fingers: [0,0,2,0,1,0], baseFret: 1 },
    Asus4:  { name: 'Asus4',  frets: [-1,0,2,2,3,0], fingers: [0,0,1,2,3,0], baseFret: 1 },
    B:      { name: 'B',      frets: [-1,2,4,4,4,2], fingers: [0,1,2,3,4,1], baseFret: 1 },
    Bm:     { name: 'Bm',     frets: [-1,2,4,4,3,2], fingers: [0,1,3,4,2,1], baseFret: 1 },
    B7:     { name: 'B7',     frets: [-1,2,1,2,0,2], fingers: [0,2,1,3,0,4], baseFret: 1 },
    Bb:     { name: 'Bb',     frets: [-1,1,3,3,3,1], fingers: [0,1,2,3,4,1], baseFret: 1 },
    'F#m':  { name: 'F#m',    frets: [2,4,4,2,2,2], fingers: [1,3,4,1,1,1], baseFret: 1 },
    Eb:     { name: 'Eb',     frets: [-1,-1,1,3,4,3], fingers: [0,0,1,2,4,3], baseFret: 1 },
  },
  ukulele: {
    C:      { name: 'C',      frets: [0,0,0,3], fingers: [0,0,0,3], baseFret: 1 },
    Cmaj7:  { name: 'Cmaj7',  frets: [0,0,0,2], fingers: [0,0,0,2], baseFret: 1 },
    C7:     { name: 'C7',     frets: [0,0,0,1], fingers: [0,0,0,1], baseFret: 1 },
    Cm:     { name: 'Cm',     frets: [0,3,3,3], fingers: [0,1,2,3], baseFret: 1 },
    D:      { name: 'D',      frets: [2,2,2,0], fingers: [1,2,3,0], baseFret: 1 },
    Dm:     { name: 'Dm',     frets: [2,2,1,0], fingers: [2,3,1,0], baseFret: 1 },
    D7:     { name: 'D7',     frets: [2,2,2,3], fingers: [1,1,1,3], baseFret: 1 },
    E:      { name: 'E',      frets: [4,4,4,2], fingers: [2,3,4,1], baseFret: 1 },
    Em:     { name: 'Em',     frets: [0,4,3,2], fingers: [0,4,3,1], baseFret: 1 },
    E7:     { name: 'E7',     frets: [1,2,0,2], fingers: [1,3,0,4], baseFret: 1 },
    F:      { name: 'F',      frets: [2,0,1,0], fingers: [2,0,1,0], baseFret: 1 },
    Fm:     { name: 'Fm',     frets: [1,0,1,3], fingers: [1,0,2,4], baseFret: 1 },
    G:      { name: 'G',      frets: [0,2,3,2], fingers: [0,1,3,2], baseFret: 1 },
    G7:     { name: 'G7',     frets: [0,2,1,2], fingers: [0,2,1,3], baseFret: 1 },
    Gm:     { name: 'Gm',     frets: [0,2,3,1], fingers: [0,2,3,1], baseFret: 1 },
    A:      { name: 'A',      frets: [2,1,0,0], fingers: [2,1,0,0], baseFret: 1 },
    Am:     { name: 'Am',     frets: [2,0,0,0], fingers: [2,0,0,0], baseFret: 1 },
    A7:     { name: 'A7',     frets: [0,1,0,0], fingers: [0,1,0,0], baseFret: 1 },
    Am7:    { name: 'Am7',    frets: [0,0,0,0], fingers: [0,0,0,0], baseFret: 1 },
    B:      { name: 'B',      frets: [4,3,2,2], fingers: [4,3,1,2], baseFret: 1 },
    Bm:     { name: 'Bm',     frets: [4,2,2,2], fingers: [4,1,2,3], baseFret: 1 },
    B7:     { name: 'B7',     frets: [2,3,2,2], fingers: [1,3,2,2], baseFret: 1 },
    Bb:     { name: 'Bb',     frets: [3,2,1,1], fingers: [4,3,1,2], baseFret: 1 },
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/chordLibrary.test.js`
Expected: PASS.

- [ ] **Step 5: Verify musical correctness**

Spot-check each shape against a trusted chord reference (the data-integrity test does NOT
check musical correctness). Fix any wrong fret/finger. If you vendored a dataset, this is
already trustworthy; if hand-authored, verify before committing.

- [ ] **Step 6: Commit**

```bash
git add data/chordLibrary.js test/chordLibrary.test.js data/vendor 2>/dev/null; git add data/chordLibrary.js test/chordLibrary.test.js
git commit -m "feat: comprehensive chord dictionary with data-integrity tests"
```

---

## Task 2: Chord name resolver (PURE, TDD)

**Files:**
- Create: `js/chordLib.js`
- Test: `test/chordLib.test.js`

`getChordShape(name, instrument)` normalizes the name and returns a shape from
`CHORD_LIBRARY` or `null`. `isChordToken(token)` recognizes chord-like strings.
`normalizeChordName(name)` returns `{ root, quality, bass }` with enharmonic flats mapped
to sharps for root lookup, then the library key is rebuilt.

- [ ] **Step 1: Write the failing test**

```js
// test/chordLib.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getChordShape, isChordToken } from '../js/chordLib.js';
import { INSTRUMENTS } from '../data/instruments.js';

test('looks up a plain major chord', () => {
  const s = getChordShape('C', INSTRUMENTS.guitar);
  assert.ok(s && s.name === 'C');
});

test('Bb resolves (enharmonic, present as Bb in lib)', () => {
  assert.ok(getChordShape('Bb', INSTRUMENTS.guitar));
});

test('A# maps to Bb shape via enharmonic normalization', () => {
  const a = getChordShape('A#', INSTRUMENTS.guitar);
  const bb = getChordShape('Bb', INSTRUMENTS.guitar);
  assert.deepEqual(a && a.frets, bb && bb.frets);
});

test('slash chord C/G looks up C', () => {
  const s = getChordShape('C/G', INSTRUMENTS.guitar);
  assert.ok(s && s.name === 'C');
});

test('min alias: Amin == Am', () => {
  const a = getChordShape('Amin', INSTRUMENTS.guitar);
  assert.ok(a && a.name === 'Am');
});

test('unknown chord returns null', () => {
  assert.equal(getChordShape('Gx7b13', INSTRUMENTS.guitar), null);
});

test('isChordToken accepts chords, rejects words', () => {
  for (const t of ['C', 'Am', 'F#m', 'G7', 'Bb', 'Csus4', 'D/F#']) assert.ok(isChordToken(t), t);
  for (const t of ['the', 'Verse:', 'Chorus', 'and', 'la-la', '']) assert.equal(isChordToken(t), false, t);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/chordLib.test.js`
Expected: FAIL — `js/chordLib.js` missing.

- [ ] **Step 3: Write minimal implementation**

```js
// js/chordLib.js
import { CHORD_LIBRARY } from '../data/chordLibrary.js';

const FLAT_TO_SHARP = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
const SHARP_TO_FLAT = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };
// Chord token: root (A-G + optional #/b), optional quality, optional /bass.
const TOKEN_RE = /^([A-G])(#|b)?(maj7|maj|min|m|dim|aug|sus2|sus4|sus|add9|add|7|6|9|11|13|0)*\d*(\/[A-G](#|b)?)?$/;

export function isChordToken(token) {
  if (!token) return false;
  if (!/^[A-G]/.test(token)) return false;
  return TOKEN_RE.test(token);
}

function splitName(name) {
  const m = name.match(/^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/);
  if (!m) return null;
  return { root: m[1], quality: m[2] || '', bass: m[3] || '' };
}

function normalizeQuality(q) {
  return q.replace(/^min/, 'm').replace(/^mi(?=$)/, 'm');
}

// Try a root spelling and its enharmonic equivalent against the library.
function rootCandidates(root) {
  const out = [root];
  if (FLAT_TO_SHARP[root]) out.push(FLAT_TO_SHARP[root]);
  if (SHARP_TO_FLAT[root]) out.push(SHARP_TO_FLAT[root]);
  return out;
}

export function getChordShape(name, instrument) {
  const lib = CHORD_LIBRARY[instrument.id];
  if (!lib) return null;
  const parts = splitName(name);
  if (!parts) return null;
  const quality = normalizeQuality(parts.quality);
  for (const root of rootCandidates(parts.root)) {
    const key = root + quality;
    if (lib[key]) return lib[key];
  }
  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/chordLib.test.js`
Expected: PASS (7 tests). If `A#`→`Bb` fails because the library only has `Bb`, confirm
`rootCandidates('A#')` includes `Bb` (it does via `SHARP_TO_FLAT`).

- [ ] **Step 5: Commit**

```bash
git add js/chordLib.js test/chordLib.test.js
git commit -m "feat: chord name resolver with enharmonic + alias handling"
```

---

## Task 3: Chord sheet parser (PURE, TDD)

**Files:**
- Create: `js/chordSheet.js`
- Test: `test/chordSheet.test.js`

`parseChordSheet(text)` → `{ rows, chordsUsed }`. A line is a **chord line** if it has
at least one token and ALL non-empty tokens are chord tokens (`isChordToken`). A chord
line is paired with the immediately following non-chord line as its lyrics (or empty).
Chord column positions are captured from the chord line.

- [ ] **Step 1: Write the failing test**

```js
// test/chordSheet.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseChordSheet } from '../js/chordSheet.js';

test('pairs a chord line with the following lyric line', () => {
  const text = 'C       G\nHello darkness my old friend';
  const { rows, chordsUsed } = parseChordSheet(text);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].lyrics, 'Hello darkness my old friend');
  assert.deepEqual(rows[0].chords.map((c) => c.name), ['C', 'G']);
  assert.equal(rows[0].chords[0].col, 0);
  assert.equal(rows[0].chords[1].col, 8);
  assert.deepEqual(chordsUsed, ['C', 'G']);
});

test('chord-only line (no lyric under it) yields a row with empty lyrics', () => {
  const { rows } = parseChordSheet('Am  F  C  G');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].lyrics, '');
  assert.equal(rows[0].chords.length, 4);
});

test('lyric-only line yields a row with no chords', () => {
  const { rows } = parseChordSheet('just some lyrics here');
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].chords, []);
  assert.equal(rows[0].lyrics, 'just some lyrics here');
});

test('chordsUsed is unique and in first-seen order', () => {
  const text = 'C   G\nla\nAm   G\nlo';
  const { chordsUsed } = parseChordSheet(text);
  assert.deepEqual(chordsUsed, ['C', 'G', 'Am']);
});

test('section labels like "Verse:" are treated as lyric lines, not chords', () => {
  const { rows } = parseChordSheet('Verse:');
  assert.deepEqual(rows[0].chords, []);
  assert.equal(rows[0].lyrics, 'Verse:');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/chordSheet.test.js`
Expected: FAIL — `js/chordSheet.js` missing.

- [ ] **Step 3: Write minimal implementation**

```js
// js/chordSheet.js
import { isChordToken } from './chordLib.js';

function isChordLine(line) {
  const tokens = line.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return false;
  return tokens.every(isChordToken);
}

function extractChords(line) {
  const chords = [];
  const re = /\S+/g;
  let m;
  while ((m = re.exec(line)) !== null) chords.push({ name: m[0], col: m.index });
  return chords;
}

export function parseChordSheet(text) {
  const lines = String(text).replace(/\r\n?/g, '\n').split('\n');
  const rows = [];
  const seen = new Set();
  const chordsUsed = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isChordLine(line)) {
      const chords = extractChords(line);
      chords.forEach((c) => { if (!seen.has(c.name)) { seen.add(c.name); chordsUsed.push(c.name); } });
      let lyrics = '';
      if (i + 1 < lines.length && !isChordLine(lines[i + 1])) {
        lyrics = lines[i + 1];
        i++; // consume the lyric line
      }
      rows.push({ chords, lyrics });
    } else {
      if (line.trim() === '') { rows.push({ chords: [], lyrics: '' }); continue; }
      rows.push({ chords: [], lyrics: line });
    }
  }
  return { rows, chordsUsed };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/chordSheet.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add js/chordSheet.js test/chordSheet.test.js
git commit -m "feat: chord-sheet parser (chords above lyrics) with tests"
```

---

## Task 4: Song store (local persistence, TDD)

**Files:**
- Create: `js/songStore.js`
- Test: `test/songStore.test.js`

`createSongStore(storage)` → `{ list, get, save, remove }`. Songs:
`{ id, title, text, instrument, strummingId }`. `save` without `id` creates one
(generated id) and returns the saved song; with `id` updates in place.

- [ ] **Step 1: Write the failing test**

```js
// test/songStore.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSongStore } from '../js/songStore.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

test('save creates a song with an id and lists it', () => {
  const s = createSongStore(fakeStorage());
  const song = s.save({ title: 'Test', text: 'C\nla', instrument: 'guitar', strummingId: 'island' });
  assert.ok(song.id);
  assert.equal(s.list().length, 1);
  assert.equal(s.get(song.id).title, 'Test');
});

test('save with existing id updates in place', () => {
  const s = createSongStore(fakeStorage());
  const song = s.save({ title: 'A', text: 'x', instrument: 'guitar', strummingId: 'island' });
  s.save({ ...song, title: 'B' });
  assert.equal(s.list().length, 1);
  assert.equal(s.get(song.id).title, 'B');
});

test('remove deletes a song', () => {
  const s = createSongStore(fakeStorage());
  const song = s.save({ title: 'A', text: 'x', instrument: 'ukulele', strummingId: 'allDown' });
  s.remove(song.id);
  assert.equal(s.list().length, 0);
});

test('persists across store instances over same storage', () => {
  const st = fakeStorage();
  createSongStore(st).save({ title: 'Keep', text: 'x', instrument: 'guitar', strummingId: 'island' });
  assert.equal(createSongStore(st).list().length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/songStore.test.js`
Expected: FAIL — `js/songStore.js` missing.

- [ ] **Step 3: Write minimal implementation**

```js
// js/songStore.js
const KEY = 'chordhelper.songs.v1';

function load(storage) {
  try {
    const raw = storage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function createSongStore(storage) {
  let songs = load(storage);
  const persist = () => { try { storage.setItem(KEY, JSON.stringify(songs)); } catch {} };

  return {
    list: () => songs.map((s) => ({ ...s })),
    get: (id) => { const s = songs.find((x) => x.id === id); return s ? { ...s } : null; },
    save(song) {
      if (song.id) {
        const i = songs.findIndex((x) => x.id === song.id);
        if (i >= 0) songs[i] = { ...song };
        else songs.push({ ...song });
        persist();
        return { ...song };
      }
      const created = { ...song, id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      songs.push(created);
      persist();
      return { ...created };
    },
    remove(id) { songs = songs.filter((x) => x.id !== id); persist(); },
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/songStore.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all v1 (18) + new (chordLibrary, chordLib 7, chordSheet 5, songStore 4) pass.

- [ ] **Step 6: Commit**

```bash
git add js/songStore.js test/songStore.test.js
git commit -m "feat: local song store with tests"
```

---

## Task 5: Song Mode screens (DOM)

**Files:**
- Create: `js/songMode.js`
- Modify: `css/styles.css` (append song-mode styles)

Reuses `renderChordSVG`, `getChordShape`, `parseChordSheet`, `getPattern`,
`renderStrumming`, and `audioEngine`. Context `ctx` is `{ course, audio, router, songs }`
(the `songs` store is added to ctx in Task 6).

- [ ] **Step 1: Create `js/songMode.js`**

```js
// js/songMode.js
import { INSTRUMENTS } from '../data/instruments.js';
import { renderChordSVG } from './chordRenderer.js';
import { getChordShape } from './chordLib.js';
import { parseChordSheet } from './chordSheet.js';
import { getPattern } from './strumming.js';
import { renderStrumming } from './strummingView.js';
import { STRUMMING_PATTERNS } from '../data/strummingPatterns.js';

const DEFAULT_PATTERN = 'island';

export function screenSongs(ctx) {
  const el = document.createElement('div');
  const songs = ctx.songs.list();
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Piesele mele</h2>
    <button class="primary" id="new">+ Piesă nouă</button>
    <div class="song-list"></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  el.querySelector('#new').onclick = () => ctx.router.go('/song-new');
  const list = el.querySelector('.song-list');
  if (songs.length === 0) {
    const p = document.createElement('p');
    p.className = 'subtitle';
    p.textContent = 'Nicio piesă încă. Lipește o foaie de acorduri ca să începi.';
    list.appendChild(p);
  }
  songs.forEach((s) => {
    const card = document.createElement('button');
    card.className = 'song-card';
    card.innerHTML = `<span class="meta"><b>${escapeHtml(s.title)}</b><small>${INSTRUMENTS[s.instrument].name}</small></span><span>›</span>`;
    card.onclick = () => ctx.router.go('/song/' + s.id);
    list.appendChild(card);
  });
  return el;
}

export function screenSongNew(ctx) {
  const el = document.createElement('div');
  const inst = ctx.course.getInstrument();
  el.innerHTML = `<button class="back" id="back">‹ Piese</button>
    <h2>Piesă nouă</h2>
    <input id="title" class="song-input" placeholder="Titlu (ex. Wonderwall)">
    <p class="subtitle">Lipește foaia de acorduri (acorduri deasupra versurilor):</p>
    <textarea id="sheet" class="song-textarea" rows="12" placeholder="C        G        Am       F
Versul tău aici..."></textarea>
    <div class="song-meta">Instrument: <b>${INSTRUMENTS[inst].name}</b> (se schimbă de pe Acasă)</div>
    <button class="primary" id="save" disabled>Salvează</button>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/songs');
  const title = el.querySelector('#title');
  const sheet = el.querySelector('#sheet');
  const save = el.querySelector('#save');
  const refresh = () => { save.disabled = !(title.value.trim() && sheet.value.trim()); };
  title.oninput = refresh; sheet.oninput = refresh;
  save.onclick = () => {
    const song = ctx.songs.save({
      title: title.value.trim(), text: sheet.value, instrument: inst, strummingId: DEFAULT_PATTERN,
    });
    ctx.router.go('/song/' + song.id);
  };
  return el;
}

export function screenSong(ctx, id) {
  const el = document.createElement('div');
  const song = ctx.songs.get(id);
  if (!song) { el.innerHTML = '<button class="back" id="back">‹ Piese</button><p>Piesă inexistentă.</p>'; el.querySelector('#back').onclick = () => ctx.router.go('/songs'); return el; }
  const instrument = INSTRUMENTS[song.instrument];
  const { rows, chordsUsed } = parseChordSheet(song.text);

  el.innerHTML = `<button class="back" id="back">‹ Piese</button>
    <div class="stepbar"><b>${escapeHtml(song.title)}</b><span>${instrument.name}</span></div>
    <div class="chord-strip"></div>
    <div class="song-strum">
      <div class="panel-label">Strumming sugerat</div>
      <select id="pattern" class="song-input"></select>
      <div class="strum-holder"></div>
      <div class="bpm"><button id="bpm-down">−</button><span id="bpm-val">70</span><span> BPM</span><button id="bpm-up">+</button></div>
      <button class="primary" id="toggle">▶ Start</button>
    </div>
    <div class="song-body"></div>
    <div class="chord-detail"></div>
    <button class="danger" id="del">Șterge piesa</button>`;

  el.querySelector('#back').onclick = () => { ctx.audio.stop(); ctx.router.go('/songs'); };
  el.querySelector('#del').onclick = () => { ctx.audio.stop(); ctx.songs.remove(id); ctx.router.go('/songs'); };

  // chord strip (unique chords)
  const strip = el.querySelector('.chord-strip');
  const detail = el.querySelector('.chord-detail');
  function showDetail(name) {
    const shape = getChordShape(name, instrument);
    if (!shape) { detail.innerHTML = `<div class="chord-name">${escapeHtml(name)}</div><p class="subtitle">diagramă indisponibilă</p>`; return; }
    detail.innerHTML = `<div class="chord-name">${escapeHtml(name)}</div>` + renderChordSVG(shape, instrument);
    ctx.audio.playChord(shape, instrument);
  }
  chordsUsed.forEach((name) => {
    const shape = getChordShape(name, instrument);
    const b = document.createElement('button');
    b.className = 'chord-mini' + (shape ? '' : ' unknown');
    b.innerHTML = `<span class="cm-name">${escapeHtml(name)}</span>` + (shape ? renderChordSVG(shape, instrument) : '<span class="cm-na">?</span>');
    b.onclick = () => showDetail(name);
    strip.appendChild(b);
  });

  // song body (chords above lyrics)
  const body = el.querySelector('.song-body');
  rows.forEach((row) => {
    const rEl = document.createElement('div');
    rEl.className = 'song-row';
    const cLine = document.createElement('pre');
    cLine.className = 'chord-line';
    cLine.textContent = chordLineText(row.chords);
    const lLine = document.createElement('pre');
    lLine.className = 'lyric-line';
    lLine.textContent = row.lyrics;
    rEl.append(cLine, lLine);
    body.appendChild(rEl);
  });

  // strumming + metronome
  const sel = el.querySelector('#pattern');
  Object.values(STRUMMING_PATTERNS).forEach((p) => {
    const o = document.createElement('option'); o.value = p.id; o.textContent = p.label; sel.appendChild(o);
  });
  sel.value = song.strummingId || DEFAULT_PATTERN;
  let strum = renderStrumming(el.querySelector('.strum-holder'), getPattern(sel.value));
  sel.onchange = () => {
    strum = renderStrumming(el.querySelector('.strum-holder'), getPattern(sel.value));
    ctx.songs.save({ ...song, strummingId: sel.value });
  };

  let bpm = 70;
  const bpmVal = el.querySelector('#bpm-val');
  el.querySelector('#bpm-down').onclick = () => { bpm = Math.max(40, bpm - 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };
  el.querySelector('#bpm-up').onclick = () => { bpm = Math.min(160, bpm + 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };

  let playing = false;
  const toggle = el.querySelector('#toggle');
  toggle.onclick = () => {
    playing = !playing;
    if (playing) { toggle.textContent = '■ Stop'; ctx.audio.start(bpm, (slot) => strum.highlight(slot)); }
    else { toggle.textContent = '▶ Start'; ctx.audio.stop(); strum.clear(); }
  };

  if (chordsUsed.length) showDetail(chordsUsed[0]);
  return el;
}

function chordLineText(chords) {
  let line = '';
  chords.forEach((c) => { if (c.col > line.length) line += ' '.repeat(c.col - line.length); line += c.name; });
  return line;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
```

- [ ] **Step 2: Append song-mode styles to `css/styles.css`**

```css
.song-list,.chord-strip{display:flex;flex-direction:column;gap:8px;margin-top:10px;}
.chord-strip{flex-direction:row;flex-wrap:wrap;gap:8px;}
.song-card{display:flex;justify-content:space-between;align-items:center;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;color:var(--text);text-align:left;}
.song-card .meta{display:flex;flex-direction:column;}
.song-card small{color:var(--muted);}
.song-input,.song-textarea{width:100%;background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:10px;padding:10px;margin:6px 0;font:inherit;}
.song-textarea{font-family:ui-monospace,Consolas,monospace;white-space:pre;overflow-x:auto;}
.song-meta{color:var(--muted);font-size:13px;margin:6px 0;}
.chord-mini{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:6px;width:78px;color:var(--text);display:flex;flex-direction:column;align-items:center;gap:2px;}
.chord-mini .chord-svg{max-width:64px;}
.chord-mini.unknown{opacity:.6;}
.cm-name{font-weight:700;font-size:13px;}
.cm-na{font-size:22px;color:var(--muted);}
.song-strum{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin:12px 0;}
.song-body{margin:12px 0;overflow-x:auto;}
.song-row{margin-bottom:2px;}
.chord-line{margin:0;color:var(--accent);font-weight:700;font-family:ui-monospace,Consolas,monospace;white-space:pre;}
.lyric-line{margin:0 0 8px;color:var(--text);font-family:ui-monospace,Consolas,monospace;white-space:pre;}
.chord-detail{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;margin:12px 0;text-align:center;}
.chord-detail .chord-svg{max-width:200px;margin:0 auto;}
button.danger{background:none;border:1px solid #e06b6b;color:#e06b6b;border-radius:10px;padding:10px 16px;margin-top:8px;}
```

- [ ] **Step 3: Static check**

Run: `node -e "import('./js/songMode.js').then(()=>console.log('ok'))"`
Expected: prints `ok` (module parses; it references `document` only inside functions, not at import time).

- [ ] **Step 4: Commit**

```bash
git add js/songMode.js css/styles.css
git commit -m "feat: song mode screens (list/new/view) with chords-above-lyrics rendering"
```

---

## Task 6: Wire routes + Home button + service worker

**Files:**
- Modify: `js/router.js`
- Modify: `js/app.js`
- Modify: `js/screens.js`
- Modify: `service-worker.js`

- [ ] **Step 1: Confirm router handles two-segment routes**

The existing `js/router.js` parses `parts[0]` as name and `parts[1]` as param, so
`#/song/s123` → `{name:'song', param:'s123'}`, `#/songs` → `{name:'songs'}`, and
`#/song-new` → `{name:'song-new'}`. No router change needed. Verify by reading
`js/router.js` and confirming the `parse()` logic. (If it does not behave this way, stop
and report.)

- [ ] **Step 2: Add the song store to ctx and wire routes in `js/app.js`**

Replace the contents of `js/app.js` with:

```js
// js/app.js
import { createRouter } from './router.js';
import { createCourse } from './courseEngine.js';
import { createAudioEngine } from './audioEngine.js';
import { createSongStore } from './songStore.js';
import { screenHome, screenLessons, screenExercise } from './screens.js';
import { screenReference } from './reference.js';
import { screenSongs, screenSongNew, screenSong } from './songMode.js';

const root = document.getElementById('app');
const course = createCourse(window.localStorage);
const audio = createAudioEngine();
const songs = createSongStore(window.localStorage);
const ctx = { course, audio, songs, router: null };
const router = createRouter(render);
ctx.router = router;

function mount(node) { root.innerHTML = ''; root.appendChild(node); }

function render(route) {
  audio.stop();
  if (route.name === 'lessons') mount(screenLessons(ctx));
  else if (route.name === 'lesson') mount(screenExercise(ctx, route.param));
  else if (route.name === 'reference') mount(screenReference(ctx));
  else if (route.name === 'songs') mount(screenSongs(ctx));
  else if (route.name === 'song-new') mount(screenSongNew(ctx));
  else if (route.name === 'song') mount(screenSong(ctx, route.param));
  else mount(screenHome(ctx));
}

router.start();
```

- [ ] **Step 3: Add a "Piese" button to Home in `js/screens.js`**

In `screenHome`, change the `.home-actions` block to include a third button. Find:

```js
    <div class="home-actions">
      <button class="primary" id="go-lessons">Lecții</button>
      <button id="go-ref">Caută un acord</button>
    </div>`;
```

Replace with:

```js
    <div class="home-actions">
      <button class="primary" id="go-lessons">Lecții</button>
      <button id="go-songs">Piese</button>
      <button id="go-ref">Caută un acord</button>
    </div>`;
```

And after the existing `#go-ref` handler add:

```js
  el.querySelector('#go-songs').onclick = () => ctx.router.go('/songs');
```

- [ ] **Step 4: Update `service-worker.js`**

Bump the cache and add the new files. Change `const CACHE = 'chordhelper-v2';` to
`const CACHE = 'chordhelper-v3';` and add these entries to the `ASSETS` array:

```js
  './js/chordLib.js', './js/chordSheet.js', './js/songStore.js', './js/songMode.js',
  './data/chordLibrary.js',
```

- [ ] **Step 5: Static verification**

Run:
```bash
node -e "Promise.all(['./js/app.js','./js/songMode.js','./js/chordLib.js','./js/chordSheet.js','./js/songStore.js','./data/chordLibrary.js'].map(m=>import(m))).then(()=>console.log('all import ok'))"
```
Expected: `all import ok`.
Run: `npm test`
Expected: full suite passes.

- [ ] **Step 6: Commit**

```bash
git add js/app.js js/screens.js service-worker.js
git commit -m "feat: wire song-mode routes, Home button, and service-worker cache"
```

---

## Task 7: README update + final suite

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add a Song Mode section to `README.md`**

Append:

```markdown
## Song Mode
Paste any song's chord sheet (chords written above the lyrics) under **Piese → Piesă
nouă**. ChordHelper renders the lyrics with chord diagrams above the words, plays each
chord, suggests a strumming pattern with the metronome, and saves the song locally on
your device. Backed by a comprehensive chord dictionary (`data/chordLibrary.js`).
```

- [ ] **Step 2: Run full suite**

Run: `npm test`
Expected: v1 (18) + chordLibrary + chordLib (7) + chordSheet (5) + songStore (4) all pass.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document Song Mode"
```

---

## Self-Review notes (for the implementer)

- **Spec coverage:** comprehensive dictionary (Task 1), enharmonic/alias resolver + unknown→null (Task 2), chords-above-lyrics parser preserving columns + unique chords (Task 3), local persistence (Task 4), song list/new/view with chord strip, click-to-hear, suggested+changeable strumming + metronome, "diagramă indisponibilă" fallback (Task 5), Home "Piese" entry + routes + offline cache (Task 6).
- **Reused v1 modules:** `chordRenderer.renderChordSVG`, `audioEngine` (`start/stop/setBpm/playChord`), `strummingView.renderStrumming().highlight/clear`, `strumming.getPattern`, `STRUMMING_PATTERNS`.
- **Type consistency:** `getChordShape(name, instrument)` returns a v1-shaped chord or null; `parseChordSheet` → `{rows:[{chords:[{name,col}],lyrics}], chordsUsed:[]}`; `createSongStore` → `{list,get,save,remove}`; song shape `{id,title,text,instrument,strummingId}`.
- **Data-correctness risk:** Task 1 shapes MUST be verified (prefer the vendored dataset). The data-integrity test checks structure, not musicality — the reviewer verifies the actual fingerings.
```
