# Vendored chord dataset

## Source
- **Package:** [`@tombatossals/chords-db`](https://www.npmjs.com/package/@tombatossals/chords-db)
- **Version:** 0.5.1
- **Author:** David Rubert
- **License:** MIT (see `LICENSE-chords-db`)
- **Obtained via:** `npm pack @tombatossals/chords-db` (2026-06-03)

## Files
- `chords-db-guitar.json` — raw guitar chord positions from the package's `lib/guitar.json`.
- `chords-db-ukulele.json` — raw ukulele chord positions from the package's `lib/ukulele.json`.
- `LICENSE-chords-db` — the upstream MIT license.
- `transform.cjs` — the script that converts the raw JSON into `../chordLibrary.js`.

## Format compatibility
The upstream format already matches ChordHelper's conventions:
- `frets` arrays are low-string-first (guitar `E A D G B e`, ukulele `G C E A`),
  `-1` = muted, `0` = open, `>=1` = fret pressed (relative to `baseFret`).
- `fingers`: `0` = none, `1-4`.

## Transform
`transform.cjs` (run from this directory: `node transform.cjs`):
1. Maps a curated subset of upstream suffixes to ChordHelper quality strings
   (`major` -> ``, `minor`/`m` -> `m`, `7`, `maj7`, `m7`, `6`, `9`, `sus2`, `sus4`,
   `dim`, `aug`, `add9`, `m6`, `m9`).
2. Uses each chord's `key` field for the proper root spelling (`C#`, `F#`, `Bb`, ...).
3. Picks the first chord position whose open/muted strings carry no finger
   (so it satisfies ChordHelper's data-integrity rule), preferring the low-fret voicing.
4. Emits `../chordLibrary.js` (168 chords per instrument).

The generated `data/chordLibrary.js` is the file the app imports; this directory is the
provenance trail. Common open shapes were spot-checked against standard references and
are musically correct.
