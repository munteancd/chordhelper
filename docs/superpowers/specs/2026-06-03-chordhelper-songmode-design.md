# ChordHelper v2 — Song Mode + Full Chord Dictionary — Design Doc

**Date:** 2026-06-03
**Status:** Approved (brainstorming complete)
**Builds on:** `2026-06-03-chordhelper-design.md` (v1: course + reference, shipped)

## Summary

Add a **Song Mode** to ChordHelper so the user can take *any* song, paste its
chord sheet (chords written above lyrics, the common Ultimate-Guitar style), and the
app renders the lyrics with chord diagrams above the right words, plays each chord,
suggests a strumming pattern with the metronome, and saves the song locally.

To make this work for real songs, the app ships a **comprehensive chord dictionary**
(all 12 roots × common qualities, for guitar and ukulele), sourced from a verified
open dataset rather than hand-authored.

Everything stays a static, no-build, offline PWA. Songs are stored in `localStorage`
on the device (no account, no sync).

## Goals

- Paste a chords-above-lyrics sheet for any song → see it rendered with chord
  diagrams positioned above the lyrics, click any chord to view its diagram + hear it.
- Know essentially every chord a normal pop/rock song uses (comprehensive dictionary).
- Suggest a default strumming pattern per song (user can change it) with the metronome.
- Save pasted songs locally; they persist across sessions and work offline.

## Non-Goals (v2)

- No automatic fetching/scraping from online chord services (ToS + fragility).
- No audio-based strumming detection.
- No cloud sync / accounts (songs are local to the device — explicitly deferred).
- No automatic key transposition (could be a later feature).
- No storage of lyrics on any server (lyrics live only in the user's pasted text,
  in their own browser).

## User Decisions (from brainstorming)

| Topic | Decision |
|-------|----------|
| Input format | Chords-above-lyrics (Ultimate-Guitar style); parser detects chord lines |
| Strumming | Auto-suggest a default pattern per song; user can change it |
| Chord coverage | Comprehensive dictionary (all 12 roots × common qualities), both instruments |
| Unknown chord | Show the name with a "diagramă indisponibilă" fallback (rare safety net) |
| Persistence | Local only (`localStorage`), for now |
| Dictionary source | Vendor a verified open dataset (e.g. MIT `chords-db`), transform to our format — not hand-authored |

## Architecture

Extends the v1 data-driven, pure-modules-plus-thin-UI structure. New pure modules are
unit-tested; new UI is thin and reuses v1 components (`chordRenderer`, `audioEngine`,
`strummingView`).

### Data

- **`data/chordLibrary.js`** — the comprehensive dictionary, per instrument, keyed by
  canonical chord name. Same shape as v1 chords: `{ name, frets[], fingers[], baseFret }`,
  arrays ordered low-string-first (`-1` muted, `0` open, `>=1` fret). Produced by
  transforming a vendored open dataset (`data/vendor/` holds the raw source + a note on
  origin/license). Covers all 12 roots for at least: major, minor, 7, m7, maj7, sus2,
  sus4, dim — wherever the source provides a standard shape.
  - v1's `data/chords.js` (the small lesson set) stays as-is for lessons; `chordLibrary`
    is the superset used by Song Mode and Reference. (Lesson chords also exist in the
    library; the small file remains the lessons' source of truth to avoid churn.)

### New pure modules (unit-tested)

- **`js/chordLib.js`** — `getChordShape(name, instrument)`:
  - Normalizes a chord name: enharmonic roots (`Bb`↔`A#`, `Db`↔`C#`, etc.), quality
    aliases (`min`→`m`, `maj`→`maj`, `Δ`→`maj7`, etc.), and strips a bass note
    (`C/G` → look up `C`, remember `/G` for display).
  - Returns the shape from `chordLibrary` or `null` if not found.
  - `isChordToken(token)` — true if a string looks like a chord name (used by the parser).

- **`js/chordSheet.js`** — `parseChordSheet(text)`:
  - Splits into lines; classifies each line as a **chord line** (most whitespace-
    separated tokens pass `isChordToken`) or a **text/lyric line**.
  - Pairs a chord line with the following lyric line, preserving each chord's **column
    position** so the UI can place it above the right character. A chord line with no
    lyric line under it renders alone (e.g. an intro).
  - Returns `{ rows: [...], chordsUsed: [uniqueNamesInOrder] }` where each row is
    `{ chords: [{name, col}], lyrics: string }` (lyrics may be empty).

### New UI modules

- **`js/songStore.js`** — local persistence (over injected storage, like `courseEngine`):
  `listSongs()`, `getSong(id)`, `saveSong({id?, title, text, instrument, strummingId})`,
  `deleteSong(id)`. Stored under one `localStorage` key as a JSON array.

- **`js/songMode.js`** (screen render functions):
  - **Songs list** (`#/songs`): saved songs + a "Piesă nouă" button.
  - **Song editor/new** : title field + a textarea to paste the sheet + "Salvează".
  - **Song view** (`#/song/:id`): renders parsed rows (chords above lyrics); a top strip
    of unique chords (small diagrams via `chordRenderer`, `null` shapes show name +
    "diagramă indisponibilă"); clicking a chord shows an enlarged diagram and plays it
    (`audioEngine.playChord`); a suggested strumming pattern (default `island` =
    "D DU UDU") shown with `strummingView` + metronome Start/Stop + BPM control, with a
    selector to change the pattern (persisted per song).

### Router / shell changes

- **`js/router.js`** — add routes `songs`, `song` (param = id), `song-new`.
- **`js/screens.js`** (Home) — add a **"Piese"** button → `#/songs`.
- **`js/app.js`** — wire the new routes to `songMode` screens.
- **`service-worker.js`** — add the new files (and vendored data) to the cache list;
  bump cache version.

## Data flow (Song Mode)

```
User taps "Piese" -> songs list (from songStore)
  -> "Piesă nouă" -> paste sheet text + title -> Salvează (songStore.saveSong)
  -> open a song (#/song/:id):
       parseChordSheet(text) -> rows + chordsUsed
       for each unique chord: getChordShape(name, instrument) -> renderChordSVG | fallback
       render rows: chords positioned above lyrics by column
       suggested strumming (saved or default) -> strummingView + audioEngine metronome
       click a chord -> enlarge diagram + audioEngine.playChord
       change strumming pattern -> persisted via songStore.saveSong
```

## Error handling & edge cases

- **Unknown/garbled chord token:** `getChordShape` returns `null`; UI shows the name with
  "diagramă indisponibilă" instead of crashing. The parser still treats it as a chord if
  it matches the token pattern.
- **Sheet with no detectable chord lines:** show the pasted text as plain lyrics plus a
  hint ("n-am găsit linii de acorduri — verifică formatul"). No crash.
- **Chord line wider than lyric line / trailing chords:** chords beyond the lyric length
  render at the end of the line.
- **Empty/whitespace paste:** "Salvează" disabled until there's text and a title.
- **No `localStorage`:** songs work in-memory for the session (same graceful fallback as
  v1 `courseEngine`).

## Testing strategy

- **Unit tests (node:test):**
  - `chordLib`: enharmonic normalization (`Bb`==`A#`), quality aliases, bass-note
    stripping, `isChordToken` accepts real chords / rejects words like "the", "Verse:".
  - `chordSheet`: classifies chord vs lyric lines; pairs them; preserves columns;
    extracts unique chords in order; handles chord-only lines and no-chord input.
  - `songStore`: save/list/get/delete round-trips over a fake storage; persistence.
  - A data-integrity test over `chordLibrary`: every entry's `frets`/`fingers` length
    equals the instrument's string count; finger 0 wherever fret <= 0.
- **Manual verification:** pasting a real song sheet; chord positioning above lyrics;
  click-to-hear; strumming + metronome; save/reload persistence; offline.

## Tech decisions

- **Vendor a verified open chord dataset** (e.g. MIT-licensed `chords-db`, which has both
  guitar and ukulele) and transform it into our shape format at build-authoring time,
  committing the result as `data/chordLibrary.js`. Keep the raw source + license under
  `data/vendor/`. Rationale: hand-authoring ~100 shapes per instrument is error-prone;
  a verified dataset is correct and saves time. The implementer confirms license
  compatibility (must be permissive) before vendoring; if the chosen dataset is
  unsuitable, fall back to a smaller hand-authored set covering the common roots and
  qualities, each verified.
- **Pure parser/resolver**, thin UI — consistent with v1, keeps logic testable.
- **Local-only persistence** via `localStorage`; cloud sync explicitly deferred.

## Open items (deferred)

- Cloud sync / accounts (multi-device songs).
- Key transposition / capo support.
- Auto-suggesting strumming from song metadata.
- Algorithmic movable/barre shape generation for any exotic chord not in the dataset.
