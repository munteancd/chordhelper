// js/transpose.js
// Transpose a chord name by a number of semitones, preserving quality and
// slash bass. Output roots use sharp spelling. Non-chord tokens pass through.
const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const PC = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};

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
