# ChordHelper — Design Doc

**Date:** 2026-06-03
**Status:** Approved (brainstorming complete)

## Summary

ChordHelper is a static, no-build Progressive Web App (vanilla JS + ES modules)
that teaches an absolute beginner ("below-beginner") to play **guitar and ukulele**.
It combines a **structured from-zero course** with a **free chord reference**.

The signature screen — the exercise view — shows the chord diagram on the left
(strings, frets, finger positions) and the strumming pattern + metronome on the
right, with the chord diagram visually dominant because clean finger placement is
the hardest part for a beginner.

Hosted later as its own GitHub repo (separate from the user's other projects).

## Goals

- Take someone who is below-beginner on both instruments and walk them, step by
  step, from "I can't hold a single chord" to playing a short chord progression.
- Support **both guitar (6 strings, EADGBE) and ukulele (4 strings, GCEA)** with a
  shared, instrument-agnostic engine — switch instrument, content adapts.
- Make finger placement unmistakably clear (big, readable chord diagrams).
- Provide rhythm support: visible strumming pattern synced to a precise metronome,
  plus an audible reference of how each chord should sound.
- Work offline as an installable PWA.

## Non-Goals (v1)

- No microphone listening / chord detection (the app does not "hear" the user play).
- No full backing-track playback to play over (only metronome click + on-demand
  chord synth).
- No accounts, no sync, no backend. Progress lives in `localStorage`.
- No song library beyond the short practice progressions inside lessons.

## User Decisions (from brainstorming)

| Topic | Decision |
|-------|----------|
| App type | **Mix**: structured course + free chord reference |
| Instruments | **Both** guitar and ukulele from the start |
| Sound | **Click + chord sound**: metronome click + tap-to-hear-chord (synth). No full playback. |
| Exercise layout | Left = chord diagram, Right = strumming + metronome. Chord diagram enlarged. Landscape suggested. |
| v1 content | **Complete from-zero beginner course** for both instruments |
| Name | ChordHelper |
| Stack | Vanilla JS, no build step |

## Architecture

Data-driven. All instrument/chord/lesson content lives in plain data files so the
engine code stays small and content can grow without touching logic.

### Data layer

- **`data/instruments.js`** — instrument definitions:
  - `guitar`: 6 strings, tuning `[E, A, D, G, B, E]`, string labels.
  - `ukulele`: 4 strings, tuning `[G, C, E, A]`, string labels.
  - Each defines string count, tuning, and display order.

- **`data/chords.json`** — per instrument, a map of chord definitions:
  - `name` (e.g. "C", "Em", "Am"), `displayName` (e.g. "Do").
  - `frets`: array per string — `x` (muted/not played), `0` (open), or fret number.
  - `fingers`: array per string — which finger (1–4) presses that string, or null.
  - `baseFret`: lowest fret shown (for chords higher up the neck; usually 1).

- **`data/lessons.json`** — ordered curriculum per instrument. Each lesson:
  - `id`, `title`, `goal` (one sentence).
  - `chords`: chord names introduced/used.
  - `strumming`: pattern reference (id into strumming patterns) or `null` for
    finger-placement-only early lessons.
  - `steps`: ordered micro-steps shown in the lesson (text + which chord/pattern
    each step focuses on).
  - `practice`: a short progression to loop (e.g. `[C, Am, F, G]`) with a tempo.

- **`data/strumming.js`** — named strumming patterns: ordered list of beats, each
  beat is `down`, `up`, or `rest`, with its beat label ("1", "&", "2", ...).

### Components (each isolated, single-purpose, testable)

1. **`chordRenderer.js`** — pure function `renderChord(chordDef, instrument) -> SVG`.
   Instrument-agnostic: draws N string lines, fret lines, finger dots with numbers,
   open (○) / muted (×) markers above the nut. No DOM dependencies beyond producing
   an SVG element/string. **Unit-tested.**

2. **`strummingView.js`** — renders a strumming pattern as arrows (↓ down, ↑ up,
   pauses) with beat labels, and exposes `highlightBeat(index)` so the metronome can
   light up the current beat. Rendering logic is pure; highlight is a thin DOM update.

3. **`audioEngine.js`** — Web Audio:
   - **Metronome scheduler** using a lookahead scheduler (timer + `currentTime`
     scheduling) for sample-accurate timing independent of the JS event loop. Emits
     beat callbacks consumed by `strummingView` and the metronome dots.
   - **Chord synth**: on-demand synthesis of a chord's notes (plucked-string style,
     e.g. Karplus–Strong or simple oscillator stack) from the chord's fretted notes.
   - **`AudioContext` resume on first user gesture** (autoplay policy): the Start
     button resumes the context. Scheduling math is separated from audio output so
     timing logic can be tested without sound.

4. **`courseEngine.js`** — tracks current instrument, current lesson, completed
   lessons, unlocking the next lesson, and reads/writes progress to `localStorage`.
   Pure logic over a progress object; storage access is a thin adapter. **Unit-tested.**

5. **`reference.js`** — the free-browse mode: list all chords for the current
   instrument, pick one, show diagram + strumming + play sound. Reuses `chordRenderer`
   and `audioEngine`.

6. **`app.js` + `router.js`** — app shell and simple hash router. Screens:
   - **Home** — pick instrument / "Continue" where you left off.
   - **Lessons** — ordered lesson list with progress/unlock state.
   - **Exercise** — the signature screen (chord left, strumming+metronome right).
   - **Reference** — free chord browser.

7. **PWA shell** — `manifest.json`, `service-worker.js` (cache app shell + data for
   offline), installable. Icons.

### Data flow

```
User picks instrument
  -> courseEngine loads progress + lessons for that instrument
  -> user opens a lesson (or Continue)
  -> Exercise screen renders:
       chordRenderer(chordDef, instrument)   -> left panel SVG
       strummingView(pattern)                 -> right panel arrows
  -> user taps Start
  -> audioEngine resumes context, scheduler runs at lesson tempo
       each beat -> metronome dot + strummingView.highlightBeat()
  -> user taps chord -> audioEngine plays chord synth as reference
  -> user marks step/lesson done -> courseEngine saves to localStorage
```

## Curriculum (v1)

Both instruments follow the same difficulty arc. Per instrument ~6–8 short lessons,
each using the pattern: (1) meet the chord → (2) press it cleanly → (3) switch
between two chords → (4) add strumming → (5) play a mini-progression.

- **Ukulele:** C → Am → F → G. Strumming from "all down" to "D D U U D U".
- **Guitar:** Em → A → D → G → C. Same difficulty progression and strumming arc.

Exact per-lesson text is authored during implementation; the data shape above is
fixed.

## Error handling & edge cases

- **AudioContext autoplay**: nothing plays until the first Start tap resumes the
  context; UI makes the Start gesture explicit.
- **No `localStorage`** (private mode/blocked): app still runs; progress simply does
  not persist (in-memory fallback).
- **Orientation**: exercise screen is designed for landscape but degrades to a
  stacked portrait layout.
- **Offline**: service worker caches shell + data; full course is usable offline
  after first load.

## Testing strategy

- **Unit tests** for the pure pieces: `chordRenderer` (correct dots/markers for known
  chords on 4- and 6-string instruments), `courseEngine` (progression/unlock logic),
  and the metronome **scheduling math** (beat times for a given BPM/pattern),
  separated from real audio.
- **Manual verification** for actual sound output and visual timing sync.

## Tech decisions

- **Vanilla JS + ES modules, no build step** — matches a simple static-hosting
  workflow and the "vibe code" spirit; no framework.
- **Web Audio API** for click + chord synth (no audio sample assets needed).
- **localStorage** for persistence.
- **PWA** (manifest + service worker) for offline + installability.
- Framework reconsideration (React etc.) deferred — to discuss later if needed.

## Open items (deferred, not blocking v1)

- Microphone-based chord/strum detection.
- Larger song library.
- Possible React migration.
