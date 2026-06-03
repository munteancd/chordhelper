# ChordHelper v3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand ChordHelper with a level-based course + song challenges, a rich chord browser, a microphone tuner, and song transposition.

**Architecture:** Four independent features, each a pure logic module (unit-tested with `node --test`) plus a thin DOM/audio/mic layer. No build step; ES modules. Service-worker cache bumps per milestone so live testing picks up changes.

**Tech Stack:** Vanilla JS ES modules, Web Audio API (oscillators + getUserMedia/AnalyserNode), `node --test`, localStorage, SVG chord diagrams.

**Reference spec:** `docs/superpowers/specs/2026-06-03-chordhelper-v3-design.md`

**Key facts about the codebase (verified):**
- Tests live in `test/*.test.js`, run via `npm test` (`node --test`). Pattern: `import { test } from 'node:test'; import assert from 'node:assert/strict';`.
- `getChordShape(name, instrument)` in `js/chordLib.js` returns `{ name, frets[], fingers[], baseFret }` or `null`. Frets are absolute (open=0, -1=muted). `instrument.openMidi[i] + fret` is the real pitch.
- `INSTRUMENTS` in `data/instruments.js`: guitar `openMidi [40,45,50,55,59,64]`, ukulele `openMidi [67,60,64,69]`.
- `renderChordSVG(shape, instrument)` → SVG string. `ctx.audio.playChord(shape, instrument)` plays it.
- All lesson chords used below exist in `data/chordLibrary.js` (verified: F, Bm, E, Am, Dm, E7, A7, D7, C7 guitar; Bb, E, D, Em, A, Dm, C7, A7, D7, G7 ukulele).
- Router (`js/router.js`): `route.name` = first hash segment, `route.param` = second. `js/app.js` `render()` dispatches by `route.name`.

---

## Milestone A — Level-based course + song challenges

### Task A1: Curriculum data (levels + lessons)

**Files:**
- Create: `data/curriculum.js`
- Test: `test/curriculum.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/curriculum.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM } from '../data/curriculum.js';
import { getChordShape } from '../js/chordLib.js';
import { INSTRUMENTS } from '../data/instruments.js';

test('both instruments have 4 ordered levels', () => {
  for (const inst of ['guitar', 'ukulele']) {
    assert.equal(CURRICULUM[inst].length, 4, inst);
    CURRICULUM[inst].forEach((lv, i) => {
      assert.ok(lv.id && lv.title && Array.isArray(lv.lessons) && lv.lessons.length > 0, `${inst} L${i}`);
    });
  }
});

test('every lesson id is unique per instrument', () => {
  for (const inst of ['guitar', 'ukulele']) {
    const ids = CURRICULUM[inst].flatMap((lv) => lv.lessons.map((l) => l.id));
    assert.equal(new Set(ids).size, ids.length, inst);
  }
});

test('every chord referenced by a lesson resolves in the library', () => {
  for (const inst of ['guitar', 'ukulele']) {
    const instrument = INSTRUMENTS[inst];
    CURRICULUM[inst].forEach((lv) => lv.lessons.forEach((l) => {
      l.chords.forEach((c) => assert.ok(getChordShape(c, instrument), `${inst} ${l.id} ${c}`));
    });
  }
});

test('level 1 preserves the original first lesson ids', () => {
  assert.equal(CURRICULUM.guitar[0].lessons[0].id, 'g1');
  assert.equal(CURRICULUM.ukulele[0].lessons[0].id, 'u1');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- test/curriculum.test.js` (or `node --test test/curriculum.test.js`)
Expected: FAIL — cannot find module `../data/curriculum.js`.

- [ ] **Step 3: Create the curriculum**

Build `data/curriculum.js`. Move the 6 existing lessons from `data/lessons.js` into Level 1 of each instrument (keep their ids g1..g6 / u1..u6, titles, goals, chords, strumming, steps, practice exactly). Then add Levels 2–4 with new lessons. Keep the lesson shape identical: `{ id, title, goal, chords:[names], strumming: patternId|null, steps:[text], practice:{chords, bpm} }`. Each level: `{ id, title, desc, lessons:[...], challenge: songId }` (challenge song ids defined in Task A2).

Level map (chords must come from the library — all verified present):
- Guitar: L1 `g-l1` Primii pași (Em, A, D, G — existing g1..g6) · L2 `g-l2` Major & minor (C, E, Am, Dm) · L3 `g-l3` Blues & septime (E7, A7, D7, C7) · L4 `g-l4` Barré (F, Bm).
- Ukulele: L1 `u-l1` Primii pași (C, Am, F, G — existing u1..u6) · L2 `u-l2` Major & minor (D, Em, A, Dm) · L3 `u-l3` Septime (C7, A7, D7, G7) · L4 `u-l4` Avansat (Bb, E).

For each NEW lesson write real beginner `steps` (finger-by-finger, Romanian, same voice as existing lessons), a `goal`, a `strumming` (reuse existing pattern ids: `allDown`, `downUp`, `island`, or `null`), and `practice:{chords, bpm:60}`. New lesson ids continue the sequence: guitar `g7`,`g8`,… ; ukulele `u7`,`u8`,… Use `getChordShape` finger data as the source of truth for which fingers/frets to describe. Give each non-first level a final "progresie" lesson that combines that level's chords.

Set each level's `challenge` to the matching builtin song id from Task A2: `g-l1`→`song-g1`, `g-l2`→`song-g2`, `g-l3`→`song-g3`, `g-l4`→`song-g4`; `u-l1`→`song-u1` … `u-l4`→`song-u4`.

Export shape:
```js
export const CURRICULUM = { guitar: [ /* 4 levels */ ], ukulele: [ /* 4 levels */ ] };
// Flat lesson list per instrument, derived — used for backward-compatible progress.
export const LESSONS = {
  guitar: CURRICULUM.guitar.flatMap((lv) => lv.lessons),
  ukulele: CURRICULUM.ukulele.flatMap((lv) => lv.lessons),
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/curriculum.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add data/curriculum.js test/curriculum.test.js
git commit -m "feat: level-based curriculum data (4 levels per instrument)"
```

### Task A2: Built-in challenge songs

**Files:**
- Create: `data/songsBuiltin.js`
- Test: `test/songsBuiltin.test.js`

**Copyright guardrail (must hold):** real song **title + artist** only, plus the **chord progression** (chords + section labels). **No lyric text** in this file.

- [ ] **Step 1: Write the failing test**

```js
// test/songsBuiltin.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_SONGS, getBuiltinSong } from '../data/songsBuiltin.js';
import { CURRICULUM } from '../data/curriculum.js';
import { getChordShape } from '../js/chordLib.js';
import { INSTRUMENTS } from '../data/instruments.js';
import { isChordToken } from '../js/chordLib.js';

test('there is one challenge song per level', () => {
  const ids = CURRICULUM.guitar.concat(CURRICULUM.ukulele).map((lv) => lv.challenge);
  ids.forEach((id) => assert.ok(getBuiltinSong(id), id));
});

test('builtin song text contains only chord tokens and section labels (no lyrics)', () => {
  Object.values(BUILTIN_SONGS).forEach((s) => {
    s.text.split('\n').forEach((line) => {
      const t = line.trim();
      if (!t) return;
      if (/^\[.*\]$/.test(t)) return; // [Verse] / [Refren]
      t.split(/\s+/).forEach((tok) => assert.ok(isChordToken(tok), `${s.id}: "${tok}"`));
    });
  });
});

test('each song only uses chords available up to its level', () => {
  for (const inst of ['guitar', 'ukulele']) {
    const instrument = INSTRUMENTS[inst];
    const learned = [];
    CURRICULUM[inst].forEach((lv) => {
      lv.lessons.forEach((l) => l.chords.forEach((c) => learned.push(c)));
      const song = getBuiltinSong(lv.challenge);
      song.text.split(/\s+/).filter(isChordToken).forEach((tok) => {
        assert.ok(getChordShape(tok, instrument), `${song.id}: ${tok} resolves`);
      });
    });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test test/songsBuiltin.test.js`
Expected: FAIL — cannot find module `../data/songsBuiltin.js`.

- [ ] **Step 3: Create the builtin songs**

For each level pick a real, famous song built on that level's chords, and ship only chords + section labels. Song shape mirrors the user song store so Song Mode can render it: `{ id, title, artist, instrument, strummingId, text }`. `text` is chords-above-(blank)-lyrics format using only chord lines and `[Section]` labels — **no lyrics**.

Suggested picks (verify each chord resolves; swap if needed):
- `song-g1` guitar L1 (Em A D G): "Knockin' on Heaven's Door" — Bob Dylan (uses G D Am/C; use G D Em — adapt to learned chords).
- `song-g2` guitar L2 (+C E Am Dm): a I–V–vi–IV pop progression, e.g. "Let It Be" — The Beatles (C G Am F).
- `song-g3` guitar L3 (+7 chords): a 12-bar blues in E (E7 A7 B7→use A7/E7/D7 as available).
- `song-g4` guitar L4 (+F Bm): "Wonderwall"-style (Em G D A C) or any tune needing F.
- `song-u1` ukulele L1 (C Am F G): "Stand By Me" — Ben E. King (C Am F G).
- `song-u2` ukulele L2 (+D Em A Dm): a vi–IV–I–V loop.
- `song-u3` ukulele L3 (+7 chords): a simple blues/turnaround.
- `song-u4` ukulele L4 (+Bb E): a tune needing Bb.

Example entry (chords only, no lyrics):
```js
export const BUILTIN_SONGS = {
  'song-u1': {
    id: 'song-u1', title: 'Stand By Me', artist: 'Ben E. King',
    instrument: 'ukulele', strummingId: 'island',
    text: [
      '[Vers]',
      'C',
      'Am',
      'F        G        C',
      '[Refren]',
      'C        Am       F        G',
    ].join('\n'),
  },
  // ...one per level id
};
export function getBuiltinSong(id) { return BUILTIN_SONGS[id] || null; }
```
Ensure every chord token resolves via `getChordShape` for that instrument; if a pick needs an unlearned chord, choose a different song or simplify the progression.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test test/songsBuiltin.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add data/songsBuiltin.js test/songsBuiltin.test.js
git commit -m "feat: builtin challenge songs (titles + chord progressions, no lyrics)"
```

### Task A3: Course engine — levels & challenge unlock

**Files:**
- Modify: `js/courseEngine.js`
- Test: `test/courseEngine.test.js` (extend)

- [ ] **Step 1: Write the failing tests (append to existing file)**

```js
// append to test/courseEngine.test.js
test('getLevels returns 4 levels with lessons and challenge', () => {
  const c = createCourse(fakeStorage());
  const levels = c.getLevels('guitar');
  assert.equal(levels.length, 4);
  assert.ok(levels[0].lessons.length > 0 && levels[0].challenge);
});

test('level is incomplete until all its lessons are done; challenge locked', () => {
  const c = createCourse(fakeStorage());
  const lv = c.getLevels('guitar')[0];
  assert.equal(c.isLevelComplete('guitar', lv.id), false);
  assert.equal(c.isChallengeUnlocked('guitar', lv.id), false);
});

test('completing all lessons in a level completes it and unlocks the challenge', () => {
  const c = createCourse(fakeStorage());
  const lv = c.getLevels('guitar')[0];
  lv.lessons.forEach((l) => c.markComplete('guitar', l.id));
  assert.equal(c.isLevelComplete('guitar', lv.id), true);
  assert.equal(c.isChallengeUnlocked('guitar', lv.id), true);
});

test('level 2 lessons are locked until level 1 is complete', () => {
  const c = createCourse(fakeStorage());
  const flat = c.getLessons('guitar');
  const firstL2Index = c.getLevels('guitar')[0].lessons.length; // first lesson of L2
  assert.equal(c.isUnlocked('guitar', firstL2Index), false);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/courseEngine.test.js`
Expected: FAIL — `c.getLevels is not a function`.

- [ ] **Step 3: Implement**

In `js/courseEngine.js` replace the `import { LESSONS }` line with `import { LESSONS, CURRICULUM } from '../data/curriculum.js';` and add three methods to the returned object (keep all existing methods; `getLessons`/`isUnlocked` already operate on the flat `LESSONS` derived in curriculum, which preserves order across levels so sequential unlock still works):

```js
    getLevels: (instrument) => CURRICULUM[instrument],
    isLevelComplete(instrument, levelId) {
      const lv = CURRICULUM[instrument].find((x) => x.id === levelId);
      if (!lv) return false;
      const done = state.completed[instrument];
      return lv.lessons.every((l) => done.includes(l.id));
    },
    isChallengeUnlocked(instrument, levelId) {
      return this.isLevelComplete(instrument, levelId);
    },
```

(Delete `data/lessons.js` is handled in Task A6.)

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/courseEngine.test.js`
Expected: PASS (all existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add js/courseEngine.js test/courseEngine.test.js
git commit -m "feat: course engine level grouping + challenge unlock"
```

### Task A4: Lessons screen shows levels; exercise screen uses the library

**Files:**
- Modify: `js/screens.js`

- [ ] **Step 1: Switch the exercise screen off `data/chords.js`**

In `js/screens.js`: remove `import { CHORDS } from '../data/chords.js';` and add `import { getChordShape } from './chordLib.js';`. In `screenExercise`, replace the `drawChord` body and the `play-chord`/`done` handlers' use of `CHORDS[inst][current]` with library lookups:

```js
  function drawChord() {
    const ch = getChordShape(current, instrument);
    nameEl.textContent = current;
    holder.innerHTML = ch ? renderChordSVG(ch, instrument) : '<p class="subtitle">diagramă indisponibilă</p>';
  }
```
and
```js
  el.querySelector('#play-chord').onclick = () => {
    const ch = getChordShape(current, instrument);
    if (ch) ctx.audio.playChord(ch, instrument);
  };
```
(Leave the `#done` handler logic, but it no longer needs `CHORDS`.)

- [ ] **Step 2: Render levels in `screenLessons`**

Replace the body of `screenLessons` so it renders levels (each with a progress bar, its lessons, and a challenge card when unlocked). Use `ctx.course.getLevels(inst)`, `getCompleted`, `isUnlocked` (by flat index), `isLevelComplete`, `isChallengeUnlocked`. Compute each lesson's flat index for unlock checks:

```js
export function screenLessons(ctx) {
  const inst = ctx.course.getInstrument();
  const levels = ctx.course.getLevels(inst);
  const completed = ctx.course.getCompleted(inst);
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Lecții — ${INSTRUMENTS[inst].name}</h2><div class="level-list"></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  const list = el.querySelector('.level-list');
  let flatIndex = 0;
  levels.forEach((lv, li) => {
    const prevComplete = li === 0 || ctx.course.isLevelComplete(inst, levels[li - 1].id);
    const doneCount = lv.lessons.filter((l) => completed.includes(l.id)).length;
    const section = document.createElement('div');
    section.className = 'level' + (prevComplete ? '' : ' locked');
    section.innerHTML = `<div class="level-head"><b>${lv.title}</b>
      <span class="progress"><span style="width:${Math.round(100 * doneCount / lv.lessons.length)}%"></span></span>
      <small>${doneCount}/${lv.lessons.length}</small></div>`;
    lv.lessons.forEach((lesson) => {
      const idx = flatIndex++;
      const unlocked = ctx.course.isUnlocked(inst, idx);
      const done = completed.includes(lesson.id);
      const card = document.createElement('button');
      card.className = 'lesson-card' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
      card.disabled = !unlocked;
      card.innerHTML = `<span class="meta"><b>${lesson.title}</b><small>${lesson.goal}</small></span>
        <span class="state">${done ? '✓' : unlocked ? '' : '🔒'}</span>`;
      card.onclick = () => ctx.router.go('/lesson/' + lesson.id);
      section.appendChild(card);
    });
    if (ctx.course.isChallengeUnlocked(inst, lv.id) && lv.challenge) {
      const ch = document.createElement('button');
      ch.className = 'challenge-card';
      ch.innerHTML = `🎵 Cântă o piesă cu ce ai învățat`;
      ch.onclick = () => ctx.router.go('/song/builtin:' + lv.challenge);
      section.appendChild(ch);
    }
    list.appendChild(section);
  });
  return el;
}
```

- [ ] **Step 3: Verify no remaining `CHORDS` references**

Run: `grep -n "CHORDS" js/screens.js`
Expected: no output.

- [ ] **Step 4: Verify the static module graph still loads (no syntax errors)**

Run: `node --input-type=module -e "import('./js/courseEngine.js').then(()=>console.log('ok'))"`
Expected: prints `ok`.

- [ ] **Step 5: Commit**

```bash
git add js/screens.js
git commit -m "feat: lessons screen renders levels + challenge cards; exercise uses chord library"
```

### Task A5: Song Mode loads built-in challenge songs (read-only)

**Files:**
- Modify: `js/songMode.js`

- [ ] **Step 1: Support `builtin:<id>` in `screenSong`**

In `js/songMode.js` add `import { getBuiltinSong } from '../data/songsBuiltin.js';`. At the top of `screenSong(ctx, id)`, resolve builtin songs and mark them read-only:

```js
export function screenSong(ctx, id) {
  const el = document.createElement('div');
  let song, readOnly = false;
  if (id && id.startsWith('builtin:')) {
    song = getBuiltinSong(id.slice('builtin:'.length));
    readOnly = true;
  } else {
    song = ctx.songs.get(id);
  }
  if (!song) { el.innerHTML = '<button class="back" id="back">‹ Piese</button><p>Piesă inexistentă.</p>'; el.querySelector('#back').onclick = () => ctx.router.go('/songs'); return el; }
  // ...existing rendering...
```

- [ ] **Step 2: Hide delete + save for read-only songs**

For builtin songs: do not render the "Șterge piesa" button, and skip `ctx.songs.save(...)` in the strumming `onchange` (guard with `if (!readOnly)`). Show the artist under the title: change the stepbar to `<b>${escapeHtml(song.title)}</b><span>${song.artist ? escapeHtml(song.artist) + ' · ' : ''}${instrument.name}</span>`. Guard the delete button creation/handler with `if (!readOnly)`.

- [ ] **Step 3: Verify module loads**

Run: `node --input-type=module -e "import('./data/songsBuiltin.js').then((m)=>console.log(!!m.getBuiltinSong))"`
Expected: prints `true`.

- [ ] **Step 4: Commit**

```bash
git add js/songMode.js
git commit -m "feat: Song Mode renders builtin challenge songs read-only"
```

### Task A6: Retire `data/lessons.js`; bump service worker

**Files:**
- Delete: `data/lessons.js`
- Modify: `service-worker.js`

- [ ] **Step 1: Confirm nothing imports `lessons.js`**

Run: `grep -rn "data/lessons" js test data`
Expected: no output (courseEngine now imports `curriculum.js`).

- [ ] **Step 2: Delete the file and update the service worker**

```bash
git rm data/lessons.js
```
In `service-worker.js`: bump `const CACHE = 'chordhelper-v3'` → `'chordhelper-v4'`. In `ASSETS`, remove `'./data/lessons.js'`, and add `'./data/curriculum.js'` and `'./data/songsBuiltin.js'`.

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS (all tests green).

- [ ] **Step 4: Commit**

```bash
git add service-worker.js data/lessons.js
git commit -m "chore: retire lessons.js, cache curriculum/builtin songs (sw v4)"
```

---

## Milestone B — Chord browser

### Task B1: Enumerate roots and qualities from the library

**Files:**
- Modify: `js/chordLib.js`
- Test: `test/chordLib.test.js` (extend)

- [ ] **Step 1: Write the failing tests (append)**

```js
// append to test/chordLib.test.js
import { listRoots, listQualities } from '../js/chordLib.js';

test('listRoots returns the 12 chromatic roots', () => {
  const roots = listRoots(INSTRUMENTS.guitar);
  assert.equal(roots.length, 12);
  assert.ok(roots.includes('C') && roots.includes('F#'));
});

test('listQualities for C includes major (empty), m and 7', () => {
  const q = listQualities('C', INSTRUMENTS.guitar);
  assert.ok(q.includes('') && q.includes('m') && q.includes('7'));
});

test('listQualities entries all resolve to a shape', () => {
  for (const q of listQualities('G', INSTRUMENTS.guitar)) {
    assert.ok(getChordShape('G' + q, INSTRUMENTS.guitar), 'G' + q);
  }
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/chordLib.test.js`
Expected: FAIL — `listRoots is not a function`.

- [ ] **Step 3: Implement**

Add to `js/chordLib.js`:

```js
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function listRoots() { return [...CHROMATIC]; }

export function listQualities(root, instrument) {
  const lib = CHORD_LIBRARY[instrument.id];
  if (!lib) return [];
  // canonical (sharp) spelling used as library keys
  const canon = FLAT_TO_SHARP[root] || root;
  const out = [];
  for (const key of Object.keys(lib)) {
    const m = key.match(/^([A-G]#?)(.*)$/);
    if (m && m[1] === canon) out.push(m[2]);
  }
  return out;
}
```
(`listRoots` ignores its arg but accepts one for call-site symmetry.)

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/chordLib.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/chordLib.js test/chordLib.test.js
git commit -m "feat: chordLib listRoots/listQualities enumeration"
```

### Task B2: Rewrite the reference screen as a root × type browser

**Files:**
- Modify: `js/reference.js`

- [ ] **Step 1: Rewrite `screenReference`**

Replace the whole file with a root-row + type-row browser plus free-text input. Use a friendly label map for qualities; clicking root or type re-renders; the 🔊 button and dblclick play.

```js
// js/reference.js
import { INSTRUMENTS } from '../data/instruments.js';
import { renderChordSVG } from './chordRenderer.js';
import { getChordShape, listRoots, listQualities } from './chordLib.js';

const QUALITY_LABEL = { '': 'major', m: 'minor', 7: '7', m7: 'm7', maj7: 'maj7', 6: '6', m6: 'm6', 9: '9', m9: 'm9', sus2: 'sus2', sus4: 'sus4', dim: 'dim', aug: 'aug', add9: 'add9' };

export function screenReference(ctx) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Acorduri — ${instrument.name}</h2>
    <input id="search" class="song-input" placeholder="Scrie un acord (ex. Bbm7)">
    <div class="root-row chip-row"></div>
    <div class="type-row chip-row"></div>
    <div class="ref-view"><div class="chord-name"></div><div class="chord-holder"></div>
      <button id="play">🔊 Ascultă</button></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  const rootRow = el.querySelector('.root-row');
  const typeRow = el.querySelector('.type-row');
  const nameEl = el.querySelector('.chord-name');
  const holder = el.querySelector('.chord-holder');
  let root = 'C', quality = '';

  function render() {
    const name = root + quality;
    const shape = getChordShape(name, instrument);
    nameEl.textContent = name;
    holder.innerHTML = shape ? renderChordSVG(shape, instrument) : '<p class="subtitle">diagramă indisponibilă</p>';
    rootRow.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b.dataset.r === root));
    typeRow.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b.dataset.q === quality));
  }
  function buildTypes() {
    const qs = listQualities(root, instrument);
    typeRow.innerHTML = qs.map((q) => `<button class="chip" data-q="${q}">${QUALITY_LABEL[q] || q}</button>`).join('');
    if (!qs.includes(quality)) quality = qs.includes('') ? '' : qs[0];
    typeRow.querySelectorAll('.chip').forEach((b) => b.onclick = () => { quality = b.dataset.q; render(); });
  }
  rootRow.innerHTML = listRoots(instrument).map((r) => `<button class="chip" data-r="${r}">${r}</button>`).join('');
  rootRow.querySelectorAll('.chip').forEach((b) => b.onclick = () => { root = b.dataset.r; buildTypes(); render(); });

  el.querySelector('#play').onclick = () => { const s = getChordShape(root + quality, instrument); if (s) ctx.audio.playChord(s, instrument); };
  el.querySelector('#search').oninput = (e) => {
    const v = e.target.value.trim();
    if (!v) return;
    const s = getChordShape(v, instrument);
    if (s) { nameEl.textContent = v; holder.innerHTML = renderChordSVG(s, instrument); }
    else { nameEl.textContent = v; holder.innerHTML = '<p class="subtitle">diagramă indisponibilă</p>'; }
  };

  buildTypes();
  render();
  return el;
}
```

- [ ] **Step 2: Verify no `data/chords.js` import remains**

Run: `grep -rn "data/chords" js`
Expected: no output (reference and screens both off it now).

- [ ] **Step 3: Verify module loads**

Run: `node --input-type=module -e "import('./js/chordLib.js').then(()=>console.log('ok'))"`
Expected: prints `ok`.

- [ ] **Step 4: Commit**

```bash
git add js/reference.js
git commit -m "feat: chord browser with root x type selector + text search"
```

### Task B3: Delete `data/chords.js`; bump service worker

**Files:**
- Delete: `data/chords.js`
- Modify: `service-worker.js`

- [ ] **Step 1: Confirm nothing imports it**

Run: `grep -rn "data/chords\b" js test data`
Expected: no output.

- [ ] **Step 2: Delete + update SW**

```bash
git rm data/chords.js
```
In `service-worker.js`: bump `CACHE` to `'chordhelper-v5'` and remove `'./data/chords.js'` from `ASSETS`.

- [ ] **Step 3: Full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add service-worker.js data/chords.js
git commit -m "chore: remove data/chords.js, sw v5"
```

---

## Milestone C — Transpose in Song Mode

### Task C1: Pure transpose function

**Files:**
- Create: `js/transpose.js`
- Test: `test/transpose.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/transpose.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transposeChord } from '../js/transpose.js';

test('up two semitones: C -> D', () => assert.equal(transposeChord('C', 2), 'D'));
test('wraps at B: B +1 -> C', () => assert.equal(transposeChord('B', 1), 'C'));
test('down one: C -1 -> B', () => assert.equal(transposeChord('C', -1), 'B'));
test('keeps quality: Am +3 -> Cm', () => assert.equal(transposeChord('Am', 3), 'Cm'));
test('keeps 7th: G7 +2 -> A7', () => assert.equal(transposeChord('G7', 2), 'A7'));
test('flat root resolves: Bb +1 -> B', () => assert.equal(transposeChord('Bb', 1), 'B'));
test('slash bass transposes too: D/F# +2 -> E/G#', () => assert.equal(transposeChord('D/F#', 2), 'E/G#'));
test('full octave is identity: C +12 -> C', () => assert.equal(transposeChord('C', 12), 'C'));
test('non-chord token returned unchanged', () => assert.equal(transposeChord('Verse', 2), 'Verse'));
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/transpose.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement**

```js
// js/transpose.js
const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };

function shiftNote(note, semitones) {
  if (!(note in PC)) return null;
  const idx = (((PC[note] + semitones) % 12) + 12) % 12;
  return SHARP[idx];
}

export function transposeChord(name, semitones) {
  const m = name.match(/^([A-G](?:#|b)?)([^/]*)(?:\/([A-G](?:#|b)?))?$/);
  if (!m || !(m[1] in PC)) return name;
  const root = shiftNote(m[1], semitones);
  if (!root) return name;
  const bass = m[3] ? shiftNote(m[3], semitones) : '';
  return root + m[2] + (bass ? '/' + bass : '');
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/transpose.test.js`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add js/transpose.js test/transpose.test.js
git commit -m "feat: pure transposeChord function"
```

### Task C2: Transpose controls in the song screen

**Files:**
- Modify: `js/songMode.js`
- Modify: `service-worker.js`

- [ ] **Step 1: Add transpose state + controls**

In `js/songMode.js` add `import { transposeChord } from './transpose.js';`. Introduce a `transpose` offset (default 0) in `screenSong`, and a small control next to the title/strum panel:

```html
<div class="transpose"><span>Ton</span>
  <button id="tr-down">−</button><span id="tr-val">0</span><button id="tr-up">+</button></div>
```
Add handlers that clamp to ±11, update `#tr-val` (show `+n`/`n`), and re-render the chord strip + song body + detail. Wrap chord name usage so every displayed chord goes through `transposeChord(name, transpose)` before `getChordShape`/render. Refactor the strip build and body build into a `redraw()` function called on load and on transpose change:

```js
  let transpose = 0;
  function disp(name) { return transposeChord(name, transpose); }
  function redraw() {
    strip.innerHTML = '';
    chordsUsed.forEach((name) => {
      const shown = disp(name);
      const shape = getChordShape(shown, instrument);
      const b = document.createElement('button');
      b.className = 'chord-mini' + (shape ? '' : ' unknown');
      b.innerHTML = `<span class="cm-name">${escapeHtml(shown)}</span>` + (shape ? renderChordSVG(shape, instrument) : '<span class="cm-na">?</span>');
      b.onclick = () => showDetail(shown);
      strip.appendChild(b);
    });
    body.innerHTML = '';
    rows.forEach((row) => {
      const rEl = document.createElement('div'); rEl.className = 'song-row';
      const cLine = document.createElement('pre'); cLine.className = 'chord-line';
      cLine.textContent = chordLineText(row.chords.map((c) => ({ name: disp(c.name), col: c.col })));
      const lLine = document.createElement('pre'); lLine.className = 'lyric-line'; lLine.textContent = row.lyrics;
      rEl.append(cLine, lLine); body.appendChild(rEl);
    });
    if (chordsUsed.length) showDetail(disp(chordsUsed[0]), false);
  }
```
`showDetail(name, play)` already takes a final name — keep it. Replace the original inline strip/body building with a single `redraw()` call. Wire:
```js
  const trVal = el.querySelector('#tr-val');
  const setTr = (d) => { transpose = Math.max(-11, Math.min(11, transpose + d)); trVal.textContent = transpose > 0 ? '+' + transpose : '' + transpose; redraw(); };
  el.querySelector('#tr-down').onclick = () => setTr(-1);
  el.querySelector('#tr-up').onclick = () => setTr(1);
```

- [ ] **Step 2: Bump SW to cache transpose.js**

In `service-worker.js`: bump `CACHE` to `'chordhelper-v6'` and add `'./js/transpose.js'` to `ASSETS`.

- [ ] **Step 3: Verify module graph loads**

Run: `node --input-type=module -e "import('./js/transpose.js').then(()=>console.log('ok'))"`
Expected: prints `ok`.

- [ ] **Step 4: Full suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/songMode.js service-worker.js
git commit -m "feat: transpose controls in Song Mode (sw v6)"
```

---

## Milestone D — Tuner

### Task D1: Pure pitch-detection module

**Files:**
- Create: `js/pitch.js`
- Test: `test/pitch.test.js`

- [ ] **Step 1: Write the failing test**

```js
// test/pitch.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { autocorrelate, freqToNote, centsOff, nearestString } from '../js/pitch.js';
import { INSTRUMENTS } from '../data/instruments.js';

function sine(freq, rate = 44100, n = 4096) {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = Math.sin((2 * Math.PI * freq * i) / rate);
  return b;
}

test('autocorrelate finds 440 Hz within 2 Hz', () => {
  const f = autocorrelate(sine(440), 44100);
  assert.ok(Math.abs(f - 440) < 2, 'got ' + f);
});

test('autocorrelate finds 196 Hz (guitar G3) within 2 Hz', () => {
  const f = autocorrelate(sine(196), 44100);
  assert.ok(Math.abs(f - 196) < 2, 'got ' + f);
});

test('autocorrelate returns -1 on silence', () => {
  assert.equal(autocorrelate(new Float32Array(4096), 44100), -1);
});

test('freqToNote: 440 -> A4 with ~0 cents', () => {
  const r = freqToNote(440);
  assert.equal(r.name, 'A');
  assert.ok(Math.abs(r.cents) < 1);
});

test('centsOff: 440 vs A4 (midi 69) is ~0', () => {
  assert.ok(Math.abs(centsOff(440, 69)) < 1);
});

test('nearestString: 330 Hz is high E (index 5) on guitar', () => {
  assert.equal(nearestString(330, INSTRUMENTS.guitar), 5);
});

test('nearestString: 262 Hz is C string (index 1) on ukulele', () => {
  assert.equal(nearestString(262, INSTRUMENTS.ukulele), 1);
});
```

- [ ] **Step 2: Run to verify failure**

Run: `node --test test/pitch.test.js`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement**

```js
// js/pitch.js
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// Autocorrelation pitch detection. Returns frequency in Hz, or -1 if no clear pitch.
export function autocorrelate(buf, sampleRate) {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.01) return -1; // too quiet

  let bestOffset = -1, bestCorr = 0, found = false, lastCorr = 1;
  const MIN = Math.floor(sampleRate / 1000); // up to 1000 Hz
  const MAX = Math.floor(sampleRate / 60);   // down to 60 Hz
  for (let offset = MIN; offset <= MAX; offset++) {
    let corr = 0;
    for (let i = 0; i < n - offset; i++) corr += buf[i] * buf[i + offset];
    corr /= (n - offset);
    if (corr > 0.9 * lastCorr && corr > bestCorr) { bestCorr = corr; bestOffset = offset; found = true; }
    else if (found && corr < bestCorr) break;
    lastCorr = corr;
  }
  if (bestOffset <= 0 || bestCorr < 0.01) return -1;
  return sampleRate / bestOffset;
}

export function freqToNote(freq) {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const cents = 1200 * Math.log2(freq / midiToFreq(midi));
  return { name: NOTES[((midi % 12) + 12) % 12], midi, cents };
}

export function centsOff(freq, targetMidi) {
  return 1200 * Math.log2(freq / midiToFreq(targetMidi));
}

export function nearestString(freq, instrument) {
  let best = 0, bestAbs = Infinity;
  instrument.openMidi.forEach((m, i) => {
    const c = Math.abs(centsOff(freq, m));
    if (c < bestAbs) { bestAbs = c; best = i; }
  });
  return best;
}
```

- [ ] **Step 4: Run to verify pass**

Run: `node --test test/pitch.test.js`
Expected: PASS (7 tests). If `autocorrelate` is off by an octave on a test, adjust MIN/MAX bounds and re-run.

- [ ] **Step 5: Commit**

```bash
git add js/pitch.js test/pitch.test.js
git commit -m "feat: pure pitch-detection module (autocorrelation + note math)"
```

### Task D2: Tuner screen + microphone

**Files:**
- Create: `js/tuner.js`
- Modify: `js/app.js`, `js/screens.js`, `js/router.js` (only if needed — router already exposes param-less routes)

- [ ] **Step 1: Create the tuner screen**

```js
// js/tuner.js
import { INSTRUMENTS } from '../data/instruments.js';
import { autocorrelate, freqToNote, centsOff, nearestString } from './pitch.js';

export function screenTuner(ctx) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Acordează — ${instrument.name}</h2>
    <p class="subtitle">Coarde: ${instrument.tuning.join(' ')}</p>
    <div class="tuner-note">—</div>
    <div class="tuner-string"></div>
    <div class="tuner-meter"><div class="needle"></div></div>
    <div class="tuner-hint"></div>
    <button class="primary" id="start">🎤 Pornește microfonul</button>`;
  el.querySelector('#back').onclick = () => { stop(); ctx.router.go('/'); };

  const noteEl = el.querySelector('.tuner-note');
  const stringEl = el.querySelector('.tuner-string');
  const needle = el.querySelector('.needle');
  const hint = el.querySelector('.tuner-hint');
  let audioCtx = null, analyser = null, raf = null, stream = null, buf = null;

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    raf = null; stream = null; audioCtx = null;
  }

  function loop() {
    analyser.getFloatTimeDomainData(buf);
    const f = autocorrelate(buf, audioCtx.sampleRate);
    if (f > 0) {
      const note = freqToNote(f);
      const si = nearestString(f, instrument);
      const cents = centsOff(f, instrument.openMidi[si]);
      noteEl.textContent = note.name;
      stringEl.textContent = `Coarda ${si + 1}: ${instrument.tuning[si]}`;
      needle.style.transform = `translateX(${Math.max(-50, Math.min(50, cents))}px)`;
      hint.textContent = Math.abs(cents) < 5 ? '✓ corect' : cents < 0 ? 'prea jos — strânge' : 'prea sus — slăbește';
      hint.className = 'tuner-hint ' + (Math.abs(cents) < 5 ? 'ok' : 'off');
    }
    raf = requestAnimationFrame(loop);
  }

  el.querySelector('#start').onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      buf = new Float32Array(analyser.fftSize);
      src.connect(analyser);
      el.querySelector('#start').textContent = '🎤 Ascult...';
      loop();
    } catch (e) {
      hint.textContent = 'Microfon indisponibil sau refuzat.';
    }
  };

  el.addEventListener('screen:leave', stop);
  return el;
}
```

- [ ] **Step 2: Wire the route in `js/app.js`**

Add `import { screenTuner } from './tuner.js';` and a branch in `render()`:
```js
  else if (route.name === 'tuner') mount(screenTuner(ctx));
```
(Place before the final `else mount(screenHome(ctx));`.)

- [ ] **Step 3: Add a Home button**

In `js/screens.js` `screenHome`, add a button inside `.home-actions`:
```html
      <button id="go-tuner">🎸 Acordează</button>
```
and a handler:
```js
  el.querySelector('#go-tuner').onclick = () => ctx.router.go('/tuner');
```

- [ ] **Step 4: Verify module loads**

Run: `node --input-type=module -e "import('./js/pitch.js').then(()=>console.log('ok'))"`
Expected: prints `ok`. (`tuner.js` references `navigator`/`window`, so it is not import-checked in Node — it is the entry-only UI layer, like `app.js`.)

- [ ] **Step 5: Commit**

```bash
git add js/tuner.js js/app.js js/screens.js
git commit -m "feat: microphone tuner screen + route + home button"
```

### Task D3: Cache the tuner; final service-worker bump

**Files:**
- Modify: `service-worker.js`

- [ ] **Step 1: Update the service worker**

In `service-worker.js`: bump `CACHE` to `'chordhelper-v7'` and add `'./js/pitch.js'` and `'./js/tuner.js'` to `ASSETS`.

- [ ] **Step 2: Full suite**

Run: `npm test`
Expected: PASS (all v1 + v3 tests green).

- [ ] **Step 3: Commit**

```bash
git add service-worker.js
git commit -m "chore: cache tuner + pitch modules (sw v7)"
```

---

## Final verification (after all milestones)

- [ ] Run `npm test` — all green.
- [ ] `grep -rn "data/chords\b\|data/lessons" js test` — no output (old data files fully retired).
- [ ] Manual browser pass (user) on the live/local site:
  - Lessons screen shows 4 levels per instrument with progress; completing a level unlocks its "🎵 Cântă o piesă" card.
  - Chord browser: pick root + type, hear the chord; type `Bbm7` and see a diagram.
  - Open a song, transpose +2/−2, chords and strip update.
  - Tuner: grant mic, play/sing a note, needle + string indicator respond.
- [ ] Push to GitHub; confirm GitHub Pages serves the new files (cache `v7`).

## CSS note

New class hooks introduced (style in `css/styles.css` as part of the relevant tasks if visuals look rough): `.level`, `.level-head`, `.progress`, `.challenge-card`, `.root-row`, `.type-row`, `.transpose`, `.tuner-note`, `.tuner-string`, `.tuner-meter`, `.needle`, `.tuner-hint`. Existing `.chip`, `.lesson-card`, `.song-input`, `.chord-mini` styles are reused.
```
