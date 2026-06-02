# ChordHelper Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, no-build PWA that teaches an absolute beginner to play guitar and ukulele via a from-zero course plus a free chord reference.

**Architecture:** Data-driven vanilla JS (ES modules). Pure logic modules (chord SVG renderer, course/progress engine, metronome scheduling math, strumming pattern model) are unit-tested with Node's built-in test runner. Thin DOM/audio layers consume those pure modules. Content (instruments, chords, strumming patterns, lessons) lives in plain ES-module data files. Offline via a service worker.

**Tech Stack:** HTML + CSS + vanilla JavaScript (ES modules, no bundler). Web Audio API for metronome + chord synth. localStorage for progress. `node --test` for unit tests. PWA manifest + service worker.

> **Note on data format:** The design doc described content as JSON. We use `.js` ES-module exports instead (e.g. `data/chords.js` exporting `const`), because that imports cleanly in both the browser over `file://` and in Node test files without `fetch`/CORS. Same data shape, more portable.

---

## File Structure

```
ChordHelper/
  index.html                  # App shell, mounts #app, registers SW
  manifest.json               # PWA manifest
  service-worker.js           # Offline cache of shell + modules
  icon.svg                    # App icon (SVG, used by manifest)
  package.json                # type:module + test script (dev only)
  css/
    styles.css                # All styling
  js/
    app.js                    # Bootstraps app, wires router to screens
    router.js                 # Hash-based router
    screens.js                # Render functions for Home / Lessons / Exercise / Reference
    chordRenderer.js          # PURE: chord def -> SVG string
    strumming.js              # PURE: strumming pattern model + helpers (data lives in data/)
    strummingView.js          # DOM: render pattern + highlight current slot
    audioEngine.js            # Web Audio: scheduler + click + chord synth (uses scheduleMath)
    scheduleMath.js           # PURE: metronome tick-time math
    courseEngine.js           # PURE-ish: progress/unlock logic + localStorage adapter
    reference.js              # Free chord browser screen logic
  data/
    instruments.js            # guitar + ukulele definitions
    chords.js                 # chord shapes per instrument
    strummingPatterns.js      # named strumming patterns
    lessons.js                # ordered course per instrument
  test/
    chordRenderer.test.js
    courseEngine.test.js
    scheduleMath.test.js
    strumming.test.js
```

Each pure module is independently testable. UI modules (`screens.js`, `strummingView.js`, `audioEngine.js`) are thin and consume the pure modules.

---

## Task 1: Project scaffold + test runner

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "chordhelper",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test"
  }
}
```

- [ ] **Step 2: Create minimal `index.html`**

```html
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>ChordHelper</title>
  <link rel="manifest" href="manifest.json">
  <meta name="theme-color" content="#11151f">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="js/app.js"></script>
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () =>
        navigator.serviceWorker.register('service-worker.js').catch(() => {}));
    }
  </script>
</body>
</html>
```

- [ ] **Step 3: Create minimal `css/styles.css`**

```css
:root{--bg:#11151f;--panel:#1b1f2a;--panel2:#222736;--line:#333a4d;--accent:#4ea1ff;--accent2:#b07cff;--ok:#8be08b;--text:#e7ebf3;--muted:#7f8aa3;}
*{box-sizing:border-box;}
html,body{margin:0;height:100%;background:var(--bg);color:var(--text);font-family:system-ui,Segoe UI,Roboto,sans-serif;}
#app{max-width:980px;margin:0 auto;padding:16px;}
button{cursor:pointer;font:inherit;}
```

- [ ] **Step 4: Create minimal `js/app.js`**

```js
const app = document.getElementById('app');
app.textContent = 'ChordHelper';
```

- [ ] **Step 5: Verify it loads**

Run: open `index.html` in a browser (or `node --test` which should report 0 tests, exit 0).
Run: `npm test`
Expected: exits 0 (no test files yet, Node prints "tests 0").

- [ ] **Step 6: Commit**

```bash
git add package.json index.html css/styles.css js/app.js
git commit -m "chore: scaffold ChordHelper static PWA shell"
```

---

## Task 2: Instrument + chord data

**Files:**
- Create: `data/instruments.js`
- Create: `data/chords.js`

Convention: `tuning` and all `frets`/`fingers` arrays are ordered **low-pitch string first** (index 0 = thickest/lowest string), drawn left-to-right. `frets` entries: `-1` = muted (×), `0` = open (○), `>=1` = fret pressed. `fingers` entries: `0` = none, `1..4` = finger number.

- [ ] **Step 1: Create `data/instruments.js`**

```js
export const INSTRUMENTS = {
  guitar: {
    id: 'guitar',
    name: 'Chitară',
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'], // low E -> high E
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    strings: 4,
    tuning: ['G', 'C', 'E', 'A'],
  },
};

export const INSTRUMENT_IDS = ['guitar', 'ukulele'];
```

- [ ] **Step 2: Create `data/chords.js`**

```js
// frets: -1 muted, 0 open, >=1 fret. fingers: 0 none, 1..4 finger. Index 0 = lowest string.
export const CHORDS = {
  guitar: {
    Em: { name: 'Em', displayName: 'Mi minor', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    A:  { name: 'A',  displayName: 'La',        frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    D:  { name: 'D',  displayName: 'Re',        frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    G:  { name: 'G',  displayName: 'Sol',       frets: [3, 2, 0, 0, 0, 3],  fingers: [2, 1, 0, 0, 0, 3] },
    C:  { name: 'C',  displayName: 'Do',        frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  },
  ukulele: {
    C:  { name: 'C',  displayName: 'Do',  frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
    Am: { name: 'Am', displayName: 'La minor', frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0] },
    F:  { name: 'F',  displayName: 'Fa',  frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
    G:  { name: 'G',  displayName: 'Sol', frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
  },
};
```

- [ ] **Step 3: Commit**

```bash
git add data/instruments.js data/chords.js
git commit -m "feat: add instrument and chord data"
```

---

## Task 3: Chord SVG renderer (PURE, TDD)

**Files:**
- Create: `js/chordRenderer.js`
- Test: `test/chordRenderer.test.js`

`renderChordSVG(chord, instrument)` returns an SVG **string** with:
- one `<line class="string-line">` per string,
- one `<circle class="finger-dot">` per pressed string (fret >= 1),
- one `<text class="open-marker">` per open string (fret 0),
- one `<text class="muted-marker">` per muted string (fret -1),
- finger-number `<text class="finger-num">` inside each dot when finger > 0.

- [ ] **Step 1: Write the failing test**

```js
// test/chordRenderer.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderChordSVG } from '../js/chordRenderer.js';
import { INSTRUMENTS } from '../data/instruments.js';
import { CHORDS } from '../data/chords.js';

const count = (s, sub) => s.split(sub).length - 1;

test('guitar Em renders 6 string lines', () => {
  const svg = renderChordSVG(CHORDS.guitar.Em, INSTRUMENTS.guitar);
  assert.equal(count(svg, 'class="string-line"'), 6);
});

test('guitar Em has 2 pressed dots, 4 open markers, 0 muted', () => {
  const svg = renderChordSVG(CHORDS.guitar.Em, INSTRUMENTS.guitar);
  assert.equal(count(svg, 'class="finger-dot"'), 2);
  assert.equal(count(svg, 'class="open-marker"'), 4);
  assert.equal(count(svg, 'class="muted-marker"'), 0);
});

test('guitar C has 1 muted marker (low E)', () => {
  const svg = renderChordSVG(CHORDS.guitar.C, INSTRUMENTS.guitar);
  assert.equal(count(svg, 'class="muted-marker"'), 1);
});

test('ukulele C renders 4 string lines and 1 dot', () => {
  const svg = renderChordSVG(CHORDS.ukulele.C, INSTRUMENTS.ukulele);
  assert.equal(count(svg, 'class="string-line"'), 4);
  assert.equal(count(svg, 'class="finger-dot"'), 1);
});

test('returns a string starting with <svg', () => {
  const svg = renderChordSVG(CHORDS.ukulele.C, INSTRUMENTS.ukulele);
  assert.ok(svg.trim().startsWith('<svg'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/chordRenderer.test.js`
Expected: FAIL — cannot import `renderChordSVG` (module/file missing).

- [ ] **Step 3: Write minimal implementation**

```js
// js/chordRenderer.js
// Renders a chord shape to an SVG string. Pure: no DOM access.
const FRETS_SHOWN = 4;

export function renderChordSVG(chord, instrument) {
  const n = instrument.strings;
  const W = 200, H = 230;
  const padX = 26, padTop = 40, padBottom = 24;
  const boardW = W - padX * 2;
  const boardH = H - padTop - padBottom;
  const colGap = boardW / (n - 1);
  const rowGap = boardH / FRETS_SHOWN;
  const x = (i) => padX + i * colGap;

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="chord-svg">`);

  // nut
  parts.push(`<rect class="nut" x="${padX}" y="${padTop}" width="${boardW}" height="5" rx="2"/>`);
  // fret rows
  for (let f = 1; f <= FRETS_SHOWN; f++) {
    const y = padTop + f * rowGap;
    parts.push(`<line class="fret-line" x1="${padX}" y1="${y}" x2="${padX + boardW}" y2="${y}"/>`);
  }
  // strings + markers
  for (let i = 0; i < n; i++) {
    const sx = x(i);
    parts.push(`<line class="string-line" x1="${sx}" y1="${padTop}" x2="${sx}" y2="${padTop + boardH}"/>`);
    const fret = chord.frets[i];
    const finger = chord.fingers[i];
    if (fret === -1) {
      parts.push(`<text class="muted-marker" x="${sx}" y="${padTop - 12}" text-anchor="middle">×</text>`);
    } else if (fret === 0) {
      parts.push(`<text class="open-marker" x="${sx}" y="${padTop - 12}" text-anchor="middle">○</text>`);
    } else {
      const cy = padTop + (fret - 0.5) * rowGap;
      parts.push(`<circle class="finger-dot" cx="${sx}" cy="${cy}" r="11"/>`);
      if (finger > 0) {
        parts.push(`<text class="finger-num" x="${sx}" y="${cy + 4}" text-anchor="middle">${finger}</text>`);
      }
    }
  }
  parts.push(`</svg>`);
  return parts.join('');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/chordRenderer.test.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add js/chordRenderer.js test/chordRenderer.test.js
git commit -m "feat: chord SVG renderer with tests"
```

---

## Task 4: Strumming patterns + model (PURE, TDD)

**Files:**
- Create: `data/strummingPatterns.js`
- Create: `js/strumming.js`
- Test: `test/strumming.test.js`

A pattern is 8 eighth-note slots over one 4/4 bar. Each slot is `'D'` (down), `'U'` (up), or `''` (rest). `getPattern(id)` returns `{ id, label, slots }`. `slotLabel(index)` returns the beat label for slot index (`'1','&','2','&','3','&','4','&'`).

- [ ] **Step 1: Create `data/strummingPatterns.js`**

```js
// 8 eighth-note slots per 4/4 bar. 'D' down, 'U' up, '' rest.
export const STRUMMING_PATTERNS = {
  allDown: { id: 'allDown', label: 'Tot în jos', slots: ['D', '', 'D', '', 'D', '', 'D', ''] },
  downUp:  { id: 'downUp',  label: 'Jos-Sus',    slots: ['D', '', 'U', '', 'D', '', 'U', ''] },
  island:  { id: 'island',  label: 'D DU UDU',   slots: ['D', '', 'D', 'U', '', 'U', 'D', 'U'] },
};
```

- [ ] **Step 2: Write the failing test**

```js
// test/strumming.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPattern, slotLabel, SLOTS_PER_BAR } from '../js/strumming.js';

test('SLOTS_PER_BAR is 8', () => {
  assert.equal(SLOTS_PER_BAR, 8);
});

test('getPattern returns island pattern with 8 slots', () => {
  const p = getPattern('island');
  assert.equal(p.slots.length, 8);
  assert.equal(p.label, 'D DU UDU');
});

test('slotLabel maps quarter beats and offbeats', () => {
  assert.deepEqual([0,1,2,3,4,5,6,7].map(slotLabel), ['1','&','2','&','3','&','4','&']);
});

test('getPattern throws on unknown id', () => {
  assert.throws(() => getPattern('nope'));
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/strumming.test.js`
Expected: FAIL — `js/strumming.js` missing.

- [ ] **Step 4: Write minimal implementation**

```js
// js/strumming.js
import { STRUMMING_PATTERNS } from '../data/strummingPatterns.js';

export const SLOTS_PER_BAR = 8;
const LABELS = ['1', '&', '2', '&', '3', '&', '4', '&'];

export function getPattern(id) {
  const p = STRUMMING_PATTERNS[id];
  if (!p) throw new Error(`Unknown strumming pattern: ${id}`);
  return p;
}

export function slotLabel(index) {
  return LABELS[index % SLOTS_PER_BAR];
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/strumming.test.js`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add data/strummingPatterns.js js/strumming.js test/strumming.test.js
git commit -m "feat: strumming pattern model with tests"
```

---

## Task 5: Metronome scheduling math (PURE, TDD)

**Files:**
- Create: `js/scheduleMath.js`
- Test: `test/scheduleMath.test.js`

The metronome ticks eighth notes. `eighthDuration(bpm)` returns seconds per eighth note. `tickTimes(startTime, bpm, numTicks)` returns absolute times. `isQuarter(tickIndex)` is true on the click beats (even indices).

- [ ] **Step 1: Write the failing test**

```js
// test/scheduleMath.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eighthDuration, tickTimes, isQuarter } from '../js/scheduleMath.js';

test('eighthDuration at 60 BPM is 0.5s', () => {
  assert.equal(eighthDuration(60), 0.5);
});

test('tickTimes produces evenly spaced times', () => {
  const times = tickTimes(10, 120, 4); // 120bpm -> eighth = 0.25s
  assert.deepEqual(times, [10, 10.25, 10.5, 10.75]);
});

test('isQuarter true on even ticks only', () => {
  assert.equal(isQuarter(0), true);
  assert.equal(isQuarter(1), false);
  assert.equal(isQuarter(2), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/scheduleMath.test.js`
Expected: FAIL — `js/scheduleMath.js` missing.

- [ ] **Step 3: Write minimal implementation**

```js
// js/scheduleMath.js
// Pure timing math for the metronome (eighth-note grid).
export function eighthDuration(bpm) {
  return 60 / bpm / 2;
}

export function tickTimes(startTime, bpm, numTicks) {
  const d = eighthDuration(bpm);
  const out = [];
  for (let i = 0; i < numTicks; i++) out.push(startTime + i * d);
  return out;
}

export function isQuarter(tickIndex) {
  return tickIndex % 2 === 0;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/scheduleMath.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add js/scheduleMath.js test/scheduleMath.test.js
git commit -m "feat: metronome scheduling math with tests"
```

---

## Task 6: Lessons data + course/progress engine (PURE-ish, TDD)

**Files:**
- Create: `data/lessons.js`
- Create: `js/courseEngine.js`
- Test: `test/courseEngine.test.js`

`courseEngine` works over an injected `storage` object (so tests pass a fake; the app passes `localStorage`). Progress shape: `{ instrument: 'guitar'|'ukulele', completed: { guitar: [ids], ukulele: [ids] } }`.

Unlock rule: lesson at index `i` is unlocked if `i === 0` or the lesson at `i-1` is in `completed`.

- [ ] **Step 1: Create `data/lessons.js`**

```js
// Ordered course per instrument. Each lesson:
//  id, title, goal, chords:[names], strumming: patternId|null, steps:[text], practice:{chords:[names], bpm}
export const LESSONS = {
  guitar: [
    { id: 'g1', title: 'Primul acord: Mi minor (Em)', goal: 'Înveți să ții acordul Em curat.',
      chords: ['Em'], strumming: null,
      steps: [
        'Pune degetul 2 pe coarda A (a 5-a) fret 2, și degetul 3 pe coarda D (a 4-a) fret 2.',
        'Apasă ferm, cu vârful degetelor, aproape de bara de fret.',
        'Ciupește pe rând fiecare coardă: toate trebuie să sune clar, fără buzz.',
      ],
      practice: { chords: ['Em'], bpm: 60 } },
    { id: 'g2', title: 'Al doilea acord: La (A)', goal: 'Înveți acordul A și îl ții curat.',
      chords: ['A'], strumming: null,
      steps: [
        'Degetele 1, 2, 3 pe corzile D, G, B (4-3-2), toate la fret 2.',
        'Coarda A (a 5-a) rămâne liberă; coarda joasă E (a 6-a) nu se cântă.',
        'Ciupește corzile A-D-G-B-e: toate clar.',
      ],
      practice: { chords: ['A'], bpm: 60 } },
    { id: 'g3', title: 'Schimbă între Em și A', goal: 'Treci lin de la Em la A și înapoi.',
      chords: ['Em', 'A'], strumming: 'allDown',
      steps: [
        'Ține Em, apoi A, apoi Em — fără grabă, doar mișcarea degetelor.',
        'Pornește metronomul la 60 BPM. Schimbă acordul la fiecare 4 bătăi.',
        'Lovește o dată în jos pe fiecare bătaie (pattern „Tot în jos").',
      ],
      practice: { chords: ['Em', 'A'], bpm: 60 } },
    { id: 'g4', title: 'Acordul Re (D)', goal: 'Adaugi D la repertoriu.',
      chords: ['D'], strumming: 'allDown',
      steps: [
        'Degetele 1, 3, 2 pe corzile G, B, e (3-2-1): fret 2, 3, 2.',
        'Se cântă doar de la coarda D în jos (primele două corzi groase mute).',
        'Lovește în jos pe fiecare bătaie la 60 BPM.',
      ],
      practice: { chords: ['D'], bpm: 60 } },
    { id: 'g5', title: 'Acordul Sol (G)', goal: 'Înveți G, cel mai întins acord de început.',
      chords: ['G'], strumming: 'downUp',
      steps: [
        'Deget 2 pe E jos (fret 3), deget 1 pe A (fret 2), deget 3 pe e sus (fret 3).',
        'Restul corzilor libere.',
        'Încearcă pattern-ul „Jos-Sus" la 60 BPM.',
      ],
      practice: { chords: ['G'], bpm: 60 } },
    { id: 'g6', title: 'Cântă o progresie: Em – G – D – A', goal: 'Pui totul cap la cap într-o buclă.',
      chords: ['Em', 'G', 'D', 'A'], strumming: 'downUp',
      steps: [
        'Ține fiecare acord câte un rând de 4 bătăi, în ordinea Em → G → D → A.',
        'Pornește la 60 BPM cu pattern „Jos-Sus".',
        'Când e curat, crește la 70 BPM.',
      ],
      practice: { chords: ['Em', 'G', 'D', 'A'], bpm: 60 } },
  ],
  ukulele: [
    { id: 'u1', title: 'Primul acord: Do (C)', goal: 'Cel mai ușor acord — un singur deget.',
      chords: ['C'], strumming: null,
      steps: [
        'Deget 3 pe coarda A (prima de jos) la fret 3. Restul libere.',
        'Lovește toate cele 4 corzi de sus în jos cu degetul mare sau arătătorul.',
        'Trebuie să sune clar și rotund.',
      ],
      practice: { chords: ['C'], bpm: 60 } },
    { id: 'u2', title: 'Al doilea acord: La minor (Am)', goal: 'Înveți Am.',
      chords: ['Am'], strumming: null,
      steps: [
        'Deget 2 pe coarda G (a 4-a, cea de sus) la fret 2. Restul libere.',
        'Lovește toate corzile. Sunet trist, frumos.',
      ],
      practice: { chords: ['Am'], bpm: 60 } },
    { id: 'u3', title: 'Schimbă între C și Am', goal: 'Treci lin C ↔ Am.',
      chords: ['C', 'Am'], strumming: 'allDown',
      steps: [
        'Alternează C și Am fără metronom, doar mișcarea.',
        'Apoi 60 BPM, schimbă la fiecare 4 bătăi, lovituri în jos.',
      ],
      practice: { chords: ['C', 'Am'], bpm: 60 } },
    { id: 'u4', title: 'Acordul Fa (F)', goal: 'Adaugi F (două degete).',
      chords: ['F'], strumming: 'allDown',
      steps: [
        'Deget 2 pe G (fret 2) și deget 1 pe E (fret 1).',
        'Lovește toate corzile, verifică să sune curat.',
      ],
      practice: { chords: ['F'], bpm: 60 } },
    { id: 'u5', title: 'Acordul Sol (G)', goal: 'Înveți G pe ukulele.',
      chords: ['G'], strumming: 'island',
      steps: [
        'Degete pe C (fret 2), E (fret 3), A (fret 2) — formă de triunghi.',
        'Încearcă pattern-ul „D DU UDU" rar, la 60 BPM.',
      ],
      practice: { chords: ['G'], bpm: 60 } },
    { id: 'u6', title: 'Cântă o progresie: C – Am – F – G', goal: 'Bucla clasică pe care merg sute de melodii.',
      chords: ['C', 'Am', 'F', 'G'], strumming: 'island',
      steps: [
        'Câte 4 bătăi pe fiecare acord, în ordinea C → Am → F → G.',
        '60 BPM cu „D DU UDU", apoi crește când e curat.',
      ],
      practice: { chords: ['C', 'Am', 'F', 'G'], bpm: 60 } },
  ],
};
```

- [ ] **Step 2: Write the failing test**

```js
// test/courseEngine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCourse } from '../js/courseEngine.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

test('default progress: guitar selected, nothing completed', () => {
  const c = createCourse(fakeStorage());
  assert.equal(c.getInstrument(), 'guitar');
  assert.deepEqual(c.getCompleted('guitar'), []);
});

test('first lesson unlocked, second locked initially', () => {
  const c = createCourse(fakeStorage());
  assert.equal(c.isUnlocked('guitar', 0), true);
  assert.equal(c.isUnlocked('guitar', 1), false);
});

test('completing first lesson unlocks the second', () => {
  const c = createCourse(fakeStorage());
  c.markComplete('guitar', 'g1');
  assert.equal(c.isUnlocked('guitar', 1), true);
  assert.deepEqual(c.getCompleted('guitar'), ['g1']);
});

test('progress persists via storage', () => {
  const s = fakeStorage();
  createCourse(s).markComplete('ukulele', 'u1');
  const c2 = createCourse(s);
  assert.deepEqual(c2.getCompleted('ukulele'), ['u1']);
});

test('setInstrument changes and persists current instrument', () => {
  const s = fakeStorage();
  const c = createCourse(s);
  c.setInstrument('ukulele');
  assert.equal(createCourse(s).getInstrument(), 'ukulele');
});

test('markComplete is idempotent (no duplicates)', () => {
  const c = createCourse(fakeStorage());
  c.markComplete('guitar', 'g1');
  c.markComplete('guitar', 'g1');
  assert.deepEqual(c.getCompleted('guitar'), ['g1']);
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `node --test test/courseEngine.test.js`
Expected: FAIL — `js/courseEngine.js` missing.

- [ ] **Step 4: Write minimal implementation**

```js
// js/courseEngine.js
import { LESSONS } from '../data/lessons.js';

const KEY = 'chordhelper.progress.v1';

function defaultProgress() {
  return { instrument: 'guitar', completed: { guitar: [], ukulele: [] } };
}

function load(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw);
    return {
      instrument: p.instrument === 'ukulele' ? 'ukulele' : 'guitar',
      completed: {
        guitar: Array.isArray(p.completed?.guitar) ? p.completed.guitar : [],
        ukulele: Array.isArray(p.completed?.ukulele) ? p.completed.ukulele : [],
      },
    };
  } catch {
    return defaultProgress();
  }
}

export function createCourse(storage) {
  let state = load(storage);
  const save = () => { try { storage.setItem(KEY, JSON.stringify(state)); } catch {} };

  return {
    getInstrument: () => state.instrument,
    setInstrument(id) { state.instrument = id === 'ukulele' ? 'ukulele' : 'guitar'; save(); },
    getCompleted: (instrument) => [...state.completed[instrument]],
    getLessons: (instrument) => LESSONS[instrument],
    isUnlocked(instrument, index) {
      if (index <= 0) return true;
      const prev = LESSONS[instrument][index - 1];
      return state.completed[instrument].includes(prev.id);
    },
    markComplete(instrument, lessonId) {
      if (!state.completed[instrument].includes(lessonId)) {
        state.completed[instrument].push(lessonId);
        save();
      }
    },
  };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `node --test test/courseEngine.test.js`
Expected: PASS (6 tests).

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: all tests pass (chordRenderer + strumming + scheduleMath + courseEngine).

- [ ] **Step 7: Commit**

```bash
git add data/lessons.js js/courseEngine.js test/courseEngine.test.js
git commit -m "feat: lessons data and course/progress engine with tests"
```

---

## Task 7: Audio engine (Web Audio: click + chord synth + scheduler)

**Files:**
- Create: `js/audioEngine.js`

This module touches Web Audio (not unit-tested; its math lives in `scheduleMath.js` which IS tested). It exposes a metronome that drives a per-tick callback, and a chord synth.

Notes used by the chord synth come from `tuning` + `fret`: each played string's MIDI pitch = openMidi(tuning note for that string) + fret. We map note names to a base octave; exact octave is not critical for a reference tone.

- [ ] **Step 1: Create `js/audioEngine.js`**

```js
// js/audioEngine.js
import { eighthDuration, isQuarter } from './scheduleMath.js';

const NOTE_SEMITONE = { C:0, 'C#':1, D:2, 'D#':3, E:4, F:5, 'F#':6, G:7, 'G#':8, A:9, 'A#':10, B:11 };

// Rough open-string MIDI numbers (octave chosen for a pleasant reference range).
function openMidi(note, stringIndex) {
  // place strings in ascending octaves so chords sound layered
  const base = 48; // C3
  return base + NOTE_SEMITONE[note] + stringIndex * 0; // octave handled by index below
}

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

export function createAudioEngine() {
  let ctx = null;
  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // --- metronome ---
  let timerId = null;
  let tickIndex = 0;
  let nextTickTime = 0;
  let bpmRef = 60;
  let onTick = null;
  const LOOKAHEAD = 0.1;       // seconds scheduled ahead
  const INTERVAL = 25;          // ms timer

  function playClick(time, accent) {
    const c = ensureCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.value = accent ? 1000 : 700;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.3, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain).connect(c.destination);
    osc.start(time); osc.stop(time + 0.06);
  }

  function scheduler() {
    const c = ensureCtx();
    const d = eighthDuration(bpmRef);
    while (nextTickTime < c.currentTime + LOOKAHEAD) {
      const idx = tickIndex;
      if (isQuarter(idx)) playClick(nextTickTime, idx % 8 === 0);
      const when = nextTickTime;
      // schedule UI highlight close to audio time
      const delayMs = Math.max(0, (when - c.currentTime) * 1000);
      const slot = idx % 8;
      if (onTick) setTimeout(() => onTick(slot, idx), delayMs);
      nextTickTime += d;
      tickIndex++;
    }
  }

  return {
    start(bpm, tickCb) {
      const c = ensureCtx();
      bpmRef = bpm; onTick = tickCb; tickIndex = 0;
      nextTickTime = c.currentTime + 0.1;
      if (timerId) clearInterval(timerId);
      timerId = setInterval(scheduler, INTERVAL);
    },
    stop() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      onTick = null;
    },
    setBpm(bpm) { bpmRef = bpm; },

    // --- chord reference tone ---
    playChord(chord, instrument) {
      const c = ensureCtx();
      const now = c.currentTime;
      let s = 0;
      chord.frets.forEach((fret, i) => {
        if (fret < 0) return; // muted
        const note = instrument.tuning[i];
        const midi = openMidi(note) + i * 5 + fret; // spread strings upward
        const freq = midiToFreq(midi);
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + s * 0.03; // slight strum spread
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        osc.connect(gain).connect(c.destination);
        osc.start(t); osc.stop(t + 1.5);
        s++;
      });
    },

    resume() { ensureCtx(); },
  };
}
```

> Note: `openMidi(note)` is called with one arg here (the `stringIndex*0` term made the param unused). Keep the signature `openMidi(note)` — simplify by removing the second param.

- [ ] **Step 2: Simplify `openMidi` signature**

Replace the `openMidi` function with:

```js
function openMidi(note) {
  const base = 48; // C3
  return base + NOTE_SEMITONE[note];
}
```

- [ ] **Step 3: Manual smoke check**

Run: open `index.html`, then in the browser console:
```js
const { createAudioEngine } = await import('./js/audioEngine.js');
const { CHORDS } = await import('./data/chords.js');
const { INSTRUMENTS } = await import('./data/instruments.js');
const a = createAudioEngine(); a.resume(); a.playChord(CHORDS.guitar.Em, INSTRUMENTS.guitar);
```
Expected: you hear a short strummed chord. Then `a.start(60, (slot)=>console.log(slot)); ` logs 0..7 and you hear a click on quarter beats. `a.stop()` stops it.

- [ ] **Step 4: Commit**

```bash
git add js/audioEngine.js
git commit -m "feat: Web Audio engine - metronome scheduler and chord synth"
```

---

## Task 8: Strumming view (DOM)

**Files:**
- Create: `js/strummingView.js`

Renders the pattern arrows and exposes `highlight(slot)` to light the active slot.

- [ ] **Step 1: Create `js/strummingView.js`**

```js
// js/strummingView.js
import { slotLabel } from './strumming.js';

export function renderStrumming(container, pattern) {
  container.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'strum-row';
  pattern.slots.forEach((s, i) => {
    const cell = document.createElement('div');
    cell.className = 'strum-cell';
    cell.dataset.slot = String(i);
    const arrow = document.createElement('div');
    arrow.className = 'strum-arrow ' + (s === 'D' ? 'down' : s === 'U' ? 'up' : 'rest');
    arrow.textContent = s === 'D' ? '↓' : s === 'U' ? '↑' : '·';
    const lbl = document.createElement('div');
    lbl.className = 'strum-label';
    lbl.textContent = slotLabel(i);
    cell.append(arrow, lbl);
    row.appendChild(cell);
  });
  container.appendChild(row);
  return {
    highlight(slot) {
      row.querySelectorAll('.strum-cell').forEach((c) =>
        c.classList.toggle('active', Number(c.dataset.slot) === slot));
    },
    clear() {
      row.querySelectorAll('.strum-cell').forEach((c) => c.classList.remove('active'));
    },
  };
}
```

- [ ] **Step 2: Add strumming styles to `css/styles.css`**

Append:

```css
.strum-row{display:flex;gap:6px;justify-content:center;}
.strum-cell{width:34px;text-align:center;padding:6px 0;border-radius:8px;transition:background .05s;}
.strum-cell.active{background:rgba(78,161,255,.25);}
.strum-arrow{font-size:26px;line-height:1;}
.strum-arrow.down{color:var(--accent);}
.strum-arrow.up{color:var(--accent2);}
.strum-arrow.rest{color:var(--muted);}
.strum-label{font-size:12px;color:var(--muted);margin-top:2px;}
```

- [ ] **Step 3: Commit**

```bash
git add js/strummingView.js css/styles.css
git commit -m "feat: strumming view with active-slot highlight"
```

---

## Task 9: Router + screens (Home, Lessons, Exercise, Reference)

**Files:**
- Create: `js/router.js`
- Create: `js/screens.js`
- Create: `js/reference.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`

- [ ] **Step 1: Create `js/router.js`**

```js
// js/router.js — minimal hash router. Routes: #/, #/lessons, #/lesson/:id, #/reference
export function createRouter(onRoute) {
  function parse() {
    const hash = location.hash.replace(/^#/, '') || '/';
    const parts = hash.split('/').filter(Boolean); // [] | ['lessons'] | ['lesson','g1'] | ['reference']
    return { name: parts[0] || 'home', param: parts[1] || null };
  }
  function fire() { onRoute(parse()); }
  window.addEventListener('hashchange', fire);
  return { start: fire, go: (path) => { location.hash = path; } };
}
```

- [ ] **Step 2: Create `js/screens.js`**

```js
// js/screens.js
import { INSTRUMENTS } from '../data/instruments.js';
import { CHORDS } from '../data/chords.js';
import { renderChordSVG } from './chordRenderer.js';
import { getPattern } from './strumming.js';
import { renderStrumming } from './strummingView.js';

export function screenHome(ctx) {
  const inst = ctx.course.getInstrument();
  const el = document.createElement('div');
  el.innerHTML = `
    <h1>ChordHelper</h1>
    <p class="subtitle">Învață chitară și ukulele, pas cu pas.</p>
    <div class="inst-switch">
      <button data-i="guitar" class="${inst==='guitar'?'on':''}">Chitară</button>
      <button data-i="ukulele" class="${inst==='ukulele'?'on':''}">Ukulele</button>
    </div>
    <div class="home-actions">
      <button class="primary" id="go-lessons">Lecții</button>
      <button id="go-ref">Caută un acord</button>
    </div>`;
  el.querySelectorAll('.inst-switch button').forEach((b) =>
    b.onclick = () => { ctx.course.setInstrument(b.dataset.i); ctx.router.start(); });
  el.querySelector('#go-lessons').onclick = () => ctx.router.go('/lessons');
  el.querySelector('#go-ref').onclick = () => ctx.router.go('/reference');
  return el;
}

export function screenLessons(ctx) {
  const inst = ctx.course.getInstrument();
  const lessons = ctx.course.getLessons(inst);
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Lecții — ${INSTRUMENTS[inst].name}</h2><div class="lesson-list"></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  const list = el.querySelector('.lesson-list');
  lessons.forEach((lesson, i) => {
    const unlocked = ctx.course.isUnlocked(inst, i);
    const done = ctx.course.getCompleted(inst).includes(lesson.id);
    const card = document.createElement('button');
    card.className = 'lesson-card' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
    card.disabled = !unlocked;
    card.innerHTML = `<span class="num">${i + 1}</span>
      <span class="meta"><b>${lesson.title}</b><small>${lesson.goal}</small></span>
      <span class="state">${done ? '✓' : unlocked ? '' : '🔒'}</span>`;
    card.onclick = () => ctx.router.go('/lesson/' + lesson.id);
    list.appendChild(card);
  });
  return el;
}

export function screenExercise(ctx, lessonId) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const lessons = ctx.course.getLessons(inst);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[idx];
  const el = document.createElement('div');
  if (!lesson) { el.textContent = 'Lecție inexistentă'; return el; }

  const firstChord = CHORDS[inst][lesson.chords[0]];
  const patternId = lesson.strumming;
  el.innerHTML = `
    <button class="back" id="back">‹ Lecții</button>
    <div class="stepbar"><b>${lesson.title}</b><span>${idx + 1}/${lessons.length}</span></div>
    <div class="exercise">
      <div class="ex-left">
        <div class="panel-label">Unde ții degetele</div>
        <div class="chord-switch"></div>
        <div class="chord-name"></div>
        <div class="chord-holder"></div>
      </div>
      <div class="ex-right">
        ${patternId ? '<div class="panel-label">Strumming</div><div class="strum-holder"></div>' : ''}
        <div class="panel-label" style="margin-top:14px">Metronom</div>
        <div class="bpm"><button id="bpm-down">−</button><span id="bpm-val">${lesson.practice.bpm}</span><span> BPM</span><button id="bpm-up">+</button></div>
        <button class="primary" id="toggle">▶ Start</button>
        <button id="play-chord">🔊 Ascultă acordul</button>
      </div>
    </div>
    <ol class="steps">${lesson.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
    <button class="primary done-btn" id="done">Am terminat lecția ✓</button>`;

  el.querySelector('#back').onclick = () => { ctx.audio.stop(); ctx.router.go('/lessons'); };

  // chord selector (if lesson uses multiple chords)
  let current = lesson.chords[0];
  const nameEl = el.querySelector('.chord-name');
  const holder = el.querySelector('.chord-holder');
  const switchEl = el.querySelector('.chord-switch');
  function drawChord() {
    const ch = CHORDS[inst][current];
    nameEl.textContent = ch.name + ' · ' + ch.displayName;
    holder.innerHTML = renderChordSVG(ch, instrument);
  }
  lesson.chords.forEach((cn) => {
    const b = document.createElement('button');
    b.textContent = cn; b.className = 'chip' + (cn === current ? ' on' : '');
    b.onclick = () => { current = cn; switchEl.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x.textContent === cn)); drawChord(); };
    switchEl.appendChild(b);
  });
  drawChord();

  // strumming
  let strum = null;
  if (patternId) strum = renderStrumming(el.querySelector('.strum-holder'), getPattern(patternId));

  // bpm
  let bpm = lesson.practice.bpm;
  const bpmVal = el.querySelector('#bpm-val');
  el.querySelector('#bpm-down').onclick = () => { bpm = Math.max(40, bpm - 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };
  el.querySelector('#bpm-up').onclick = () => { bpm = Math.min(160, bpm + 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };

  // transport
  let playing = false;
  const toggle = el.querySelector('#toggle');
  toggle.onclick = () => {
    playing = !playing;
    if (playing) {
      toggle.textContent = '■ Stop';
      ctx.audio.start(bpm, (slot) => { if (strum) strum.highlight(slot); });
    } else {
      toggle.textContent = '▶ Start';
      ctx.audio.stop(); if (strum) strum.clear();
    }
  };

  el.querySelector('#play-chord').onclick = () => ctx.audio.playChord(CHORDS[inst][current], instrument);
  el.querySelector('#done').onclick = () => { ctx.audio.stop(); ctx.course.markComplete(inst, lesson.id); ctx.router.go('/lessons'); };
  return el;
}
```

- [ ] **Step 3: Create `js/reference.js`**

```js
// js/reference.js
import { INSTRUMENTS } from '../data/instruments.js';
import { CHORDS } from '../data/chords.js';
import { renderChordSVG } from './chordRenderer.js';

export function screenReference(ctx) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const chords = CHORDS[inst];
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Acorduri — ${instrument.name}</h2>
    <div class="chip-row">${Object.keys(chords).map((k) => `<button class="chip" data-c="${k}">${k}</button>`).join('')}</div>
    <div class="ref-view"><div class="chord-name"></div><div class="chord-holder"></div></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  const nameEl = el.querySelector('.chord-name');
  const holder = el.querySelector('.chord-holder');
  function show(k) {
    const ch = chords[k];
    nameEl.textContent = ch.name + ' · ' + ch.displayName;
    holder.innerHTML = renderChordSVG(ch, instrument);
    el.querySelectorAll('.chip-row .chip').forEach((b) => b.classList.toggle('on', b.dataset.c === k));
  }
  el.querySelectorAll('.chip-row .chip').forEach((b) => {
    b.onclick = () => show(b.dataset.c);
    b.addEventListener('dblclick', () => ctx.audio.playChord(chords[b.dataset.c], instrument));
  });
  show(Object.keys(chords)[0]);
  return el;
}
```

- [ ] **Step 4: Rewrite `js/app.js` to wire everything**

```js
// js/app.js
import { createRouter } from './router.js';
import { createCourse } from './courseEngine.js';
import { createAudioEngine } from './audioEngine.js';
import { screenHome, screenLessons, screenExercise } from './screens.js';
import { screenReference } from './reference.js';

const root = document.getElementById('app');
const course = createCourse(window.localStorage);
const audio = createAudioEngine();
const ctx = { course, audio, router: null };
const router = createRouter(render);
ctx.router = router;

function mount(node) { root.innerHTML = ''; root.appendChild(node); }

function render(route) {
  audio.stop();
  if (route.name === 'lessons') mount(screenLessons(ctx));
  else if (route.name === 'lesson') mount(screenExercise(ctx, route.param));
  else if (route.name === 'reference') mount(screenReference(ctx));
  else mount(screenHome(ctx));
}

router.start();
```

- [ ] **Step 5: Append screen styles to `css/styles.css`**

```css
h1{margin:.2em 0;}
.subtitle{color:var(--muted);margin-top:0;}
.inst-switch{display:flex;gap:8px;margin:16px 0;}
.inst-switch button,.home-actions button,.bpm button{background:var(--panel2);color:var(--text);border:1px solid var(--line);border-radius:10px;padding:10px 16px;}
.inst-switch button.on{border-color:var(--accent);color:var(--accent);}
.home-actions{display:flex;gap:10px;}
button.primary{background:var(--accent);color:#06101f;border:none;border-radius:10px;padding:12px 16px;font-weight:700;}
.back{background:none;border:none;color:var(--muted);padding:8px 0;}
.lesson-list{display:flex;flex-direction:column;gap:8px;}
.lesson-card{display:flex;align-items:center;gap:12px;text-align:left;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;color:var(--text);}
.lesson-card .num{width:28px;height:28px;border-radius:50%;background:var(--panel2);display:flex;align-items:center;justify-content:center;font-weight:700;}
.lesson-card .meta{flex:1;display:flex;flex-direction:column;}
.lesson-card small{color:var(--muted);}
.lesson-card.locked{opacity:.5;}
.lesson-card.done{border-color:var(--ok);}
.lesson-card .state{color:var(--ok);font-weight:700;}
.stepbar{display:flex;justify-content:space-between;align-items:center;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:8px 0;}
.exercise{display:flex;gap:16px;align-items:flex-start;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;}
.ex-left{flex:1.2;}
.ex-right{flex:1;border-left:1px solid var(--line);padding-left:14px;}
.panel-label{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px;}
.chord-name{font-size:20px;font-weight:800;margin:4px 0 8px;}
.chord-svg{width:100%;max-width:230px;display:block;}
.chord-svg .nut{fill:#cfd6e6;}
.chord-svg .fret-line{stroke:#444b5e;stroke-width:1.5;}
.chord-svg .string-line{stroke:#6b748c;stroke-width:2;}
.chord-svg .finger-dot{fill:var(--accent);}
.chord-svg .finger-num{fill:#06101f;font-size:13px;font-weight:700;}
.chord-svg .open-marker{fill:var(--ok);font-size:14px;}
.chord-svg .muted-marker{fill:#e06b6b;font-size:14px;}
.chip,.chord-switch button{background:var(--panel2);border:1px solid var(--line);color:var(--text);border-radius:999px;padding:6px 12px;margin:2px;}
.chip.on{border-color:var(--accent);color:var(--accent);}
.chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;}
.bpm{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.ex-right .primary,.ex-right button{margin-top:8px;width:100%;}
.steps{margin-top:14px;line-height:1.5;}
.done-btn{margin-top:14px;width:100%;}
.ref-view{margin-top:10px;}
@media(max-width:640px){.exercise{flex-direction:column;}.ex-right{border-left:none;border-top:1px solid var(--line);padding-left:0;padding-top:12px;}}
```

- [ ] **Step 6: Manual verification of the whole flow**

Run: open `index.html`.
Expected:
- Home shows ChordHelper, instrument switch (Chitară/Ukulele), Lecții + Caută un acord.
- Switching instrument updates which is highlighted.
- Lecții: lesson 1 unlocked, rest locked (🔒).
- Open lesson 1 → chord diagram on left, steps below. "Ascultă acordul" plays sound. "Am terminat lecția" returns and unlocks lesson 2.
- A lesson with strumming (lesson 3) shows arrows; Start runs the metronome and highlights slots in time; Stop halts.
- Caută un acord: click a chip shows the diagram; double-click plays it.

- [ ] **Step 7: Commit**

```bash
git add js/router.js js/screens.js js/reference.js js/app.js css/styles.css
git commit -m "feat: router, screens (home/lessons/exercise) and chord reference"
```

---

## Task 10: PWA — manifest, icon, service worker

**Files:**
- Create: `manifest.json`
- Create: `icon.svg`
- Create: `service-worker.js`

- [ ] **Step 1: Create `icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" rx="36" fill="#11151f"/>
  <g stroke="#6b748c" stroke-width="6">
    <line x1="48" y1="36" x2="48" y2="156"/><line x1="80" y1="36" x2="80" y2="156"/>
    <line x1="112" y1="36" x2="112" y2="156"/><line x1="144" y1="36" x2="144" y2="156"/>
  </g>
  <rect x="40" y="40" width="112" height="8" rx="3" fill="#cfd6e6"/>
  <circle cx="80" cy="86" r="14" fill="#4ea1ff"/>
  <circle cx="112" cy="118" r="14" fill="#4ea1ff"/>
</svg>
```

- [ ] **Step 2: Create `manifest.json`**

```json
{
  "name": "ChordHelper",
  "short_name": "ChordHelper",
  "start_url": "./index.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#11151f",
  "theme_color": "#11151f",
  "icons": [
    { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }
  ]
}
```

- [ ] **Step 3: Create `service-worker.js`**

```js
// service-worker.js
const CACHE = 'chordhelper-v1';
const ASSETS = [
  './', './index.html', './manifest.json', './icon.svg',
  './css/styles.css',
  './js/app.js', './js/router.js', './js/screens.js', './js/reference.js',
  './js/chordRenderer.js', './js/strumming.js', './js/strummingView.js',
  './js/audioEngine.js', './js/scheduleMath.js', './js/courseEngine.js',
  './data/instruments.js', './data/chords.js', './data/strummingPatterns.js', './data/lessons.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
```

- [ ] **Step 4: Manual verification (offline)**

Run: serve the folder over http (service workers need http, not `file://`):
```bash
npx --yes http-server -p 8080 .
```
Open `http://localhost:8080`, load once, then in DevTools → Application → Service Workers confirm it's activated; toggle "Offline" and reload — app still works.

- [ ] **Step 5: Commit**

```bash
git add manifest.json icon.svg service-worker.js
git commit -m "feat: PWA manifest, icon and offline service worker"
```

---

## Task 11: README + final full-suite check

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# ChordHelper

A small, no-build PWA that teaches absolute beginners to play **guitar** and **ukulele**,
step by step: a from-zero lesson course plus a free chord reference. Shows finger
placement on the left, strumming + metronome on the right.

## Run locally
Service workers need http, so serve the folder:
```
npx http-server -p 8080 .
```
Then open http://localhost:8080

(For quick UI tinkering without the service worker, you can also just open `index.html`.)

## Tests
```
npm test
```
Unit tests cover the pure modules: chord renderer, strumming model, metronome
scheduling math, and the course/progress engine.

## Structure
- `js/` — app code (pure modules + thin DOM/audio layers)
- `data/` — instruments, chords, strumming patterns, lessons
- `test/` — node:test unit tests
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all suites pass (chordRenderer, strumming, scheduleMath, courseEngine).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Self-Review notes (for the implementer)

- **Spec coverage:** instruments-agnostic engine (Tasks 2,3), both instruments (Task 2,6), chord diagram left + strumming/metronome right (Task 9), click + chord synth, no full playback/mic (Task 7), from-zero course both instruments (Task 6), localStorage progress (Task 6), PWA offline (Task 10), tested pure modules (Tasks 3–6).
- **Deferred (per spec):** microphone detection, larger song library, React migration — not in this plan by design.
- **Type consistency:** `frets`/`fingers` ordering (low string first), `createCourse` method names, `getPattern`/`slotLabel`, `createAudioEngine().start/stop/setBpm/playChord/resume`, `renderStrumming().highlight/clear` are used consistently across tasks.
```
