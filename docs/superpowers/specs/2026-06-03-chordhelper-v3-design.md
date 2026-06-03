# ChordHelper v3 — Design

Date: 2026-06-03
Status: Approved (pending spec review)

## Context

ChordHelper is a no-build vanilla-JS PWA teaching absolute-beginner guitar and
ukulele. v1 shipped a 6-lesson guided course per instrument plus a chord
reference; v2 added Song Mode (paste a chord sheet, play chords, strumming +
metronome) and a vendored dictionary of 336 chord shapes (`data/chordLibrary.js`,
from MIT-licensed chords-db).

Two gaps surfaced in use:

1. The guided **course is only 6 lessons** per instrument — too short to feel like
   a real learning path.
2. The **336-chord dictionary is invisible** — the reference screen doesn't show
   how rich it is, so the user didn't know the app already "knows" hundreds of
   chords.

The user also wants new beginner-facing features. v3 adds four independent
features, each shippable on its own milestone. All remain offline, no build step.
Service worker cache bumps to `v4`.

A fifth idea — microphone chord recognition ("listen to what I play") — is
explicitly **out of scope** for v3 (hard, unreliable on phones) but wanted later.

## Architecture principle

Each feature is split into a **pure logic module** (unit-tested with
`node --test`) and a **thin UI/audio layer** (verified manually in browser).
This keeps musical/DSP logic testable and the DOM/Web-Audio/microphone plumbing
small.

---

## Feature 1 — Level-based course + song challenges

### Goal
Turn the flat 6-lesson list into a multi-level curriculum with a long learning
path, and reward each completed level with a real piece to play.

### Data
- **`data/curriculum.js`** (new): lessons grouped into ordered **levels** per
  instrument. Each level: `{ id, title, desc, lessons:[...], challenge }`.
  - Guitar:
    - L1 Primii pași: Em, A, D, G (existing)
    - L2 Major/minor: C, E, Am, Dm
    - L3 Blues & 7: E7, A7, D7, C7
    - L4 Barré (avansat): F, Bm
  - Ukulele:
    - L1 Primii pași: C, Am, F, G (existing)
    - L2 Major/minor: D, Em, A, Dm
    - L3 7-uri: C7, A7, D7, G7
    - L4 Avansat: Bb, E
  - Exact lesson count per level is finalized during implementation; the level
    structure above is the contract.
- Each lesson keeps: `id, title, goal, chords:[names], strumming, steps:[text],
  practice:{chords, bpm}`. Hand-written `steps` remain the pedagogical content.

### Chord-shape source unification (cleanup)
The exercise screen currently reads curated shapes from `data/chords.js`
(`CHORDS[inst][name]`). New lessons would require hand-authoring shapes there.
Instead, the exercise screen switches to **`getChordShape(name, instrument)`**
from the 336-chord library, so any new lesson chord renders without
hand-authoring. `data/chords.js` is retired once the exercise screen no longer
depends on it (reference and lessons both use the library).

### Course engine
- **`js/courseEngine.js`**: add level awareness on top of existing per-lesson
  completion. New behavior:
  - group lessons by level
  - `isLevelComplete(inst, levelId)` — all lessons in level done
  - challenge for a level unlocks when the level is complete
- Existing localStorage progress (`completed` lesson ids) stays
  **backward-compatible** — no migration needed; levels are derived from data.

### Challenge songs
- **`data/songsBuiltin.js`** (new): short challenge pieces, one per level, each
  using **only chords taught up to that level**.
- **Copyright safety:** challenge content uses public-domain / traditional
  melodies (e.g. folk tunes) or original simple practice progressions. **No
  copyrighted lyrics are reproduced.** Where a piece has no public-domain lyrics,
  it ships as a labelled chord progression (a "vamp") without lyrics.
- On completing a level, the Lessons screen shows a "🎵 Cântă o piesă" card that
  loads the built-in song into Song Mode (reusing the existing Song Mode screen
  and player). Built-in songs are read-only (not stored in the user's song list).

### UI
- The Lessons screen renders **levels** with a per-level progress bar; lessons
  nest under their level. Locked levels show a 🔒 until the prior level completes.

---

## Feature 2 — Chord browser (surface the 336 chords)

### Goal
Make the dictionary obviously rich and easy to navigate.

### UI (`js/reference.js`)
- A row of **root buttons** (C, C#, D, … B) and a row of **type buttons**
  (major, minor, 7, m7, maj7, m7, sus2, sus4, dim, aug, …). Selecting root + type
  shows the chord diagram + a "🔊 Ascultă" button.
- A free-text input: typing e.g. `Bbm7` resolves and shows the diagram (reusing
  `getChordShape` enharmonic handling).

### Logic (`js/chordLib.js`)
- Add a function to **enumerate available qualities** present in the library for a
  given root (so type buttons reflect what actually exists). Unit-tested.

---

## Feature 3 — Tuner (microphone)

### Goal
Let the user tune each string by ear-free feedback — essential for a beginner.

### Logic (`js/pitch.js`, pure, tested)
- `autocorrelate(buffer, sampleRate) -> freq | null` — autocorrelation pitch
  detection (returns null below a confidence/energy threshold).
- `freqToNote(freq) -> { name, midi, cents }` — nearest note + cents offset.
- `centsOff(freq, targetMidi) -> cents`.
- `nearestString(freq, instrument) -> stringIndex` — uses `instrument.openMidi`.
- Tested with synthetic sine buffers at known frequencies.

### UI (`js/tuner.js`, thin)
- Requests microphone via `getUserMedia` (works on GitHub Pages HTTPS and
  localhost; requires a user gesture). Handles permission-denied gracefully with a
  message.
- Shows detected note, the nearest open string for the current instrument, and a
  needle reading "prea jos / corect / prea sus" in cents.
- New "🎸 Acordează" button on Home; route `/tuner`.

---

## Feature 4 — Transpose in Song Mode

### Goal
Shift a song's key up/down to suit the user's voice or a capo.

### Logic (`js/transpose.js`, pure, tested)
- `transposeChord(name, semitones) -> name` — uses the existing root parser
  (`chordLib`), preserves quality and bass/slash if present, normalizes
  enharmonics. Unit-tested across roots, sharps/flats, and ±12.

### UI (`js/songMode.js`)
- **+ / −** buttons in the song screen transpose all chords; display the current
  offset (e.g. "+2"). Re-render the chord strip and the chords-above-lyrics body
  with transposed names. Offset is view-state (reset on reopen; persistence is a
  later nicety).
- **Known limitation:** a longer transposed name (C → C#) can slightly shift
  alignment on the chord line relative to lyrics. Acceptable for now.

---

## Testing

New/extended pure modules covered by `node --test`:
- `js/transpose.js`
- `js/pitch.js`
- `js/chordLib.js` (quality enumeration)
- `js/courseEngine.js` (level grouping / challenge unlock)

UI, microphone, and audio layers stay thin and are verified manually in the
browser by the user.

## Build order (milestones)

1. Level-based course + challenges (largest; user priority)
2. Transpose (quick win)
3. Chord browser (quick win)
4. Tuner (newest technically)

## Out of scope (v3)

- Microphone chord recognition ("listen to what I play") — wanted later.
- Alternate voicings / positions in the chord browser — possible later extension.
- Persisting transpose offset per song.
