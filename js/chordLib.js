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

// Pitch class per root spelling — the chord-db dataset mixes sharps and flats,
// and guitar vs ukulele use different spellings, so we match by pitch class.
const PITCH_CLASS = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6,
  G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11,
};
const ROOT_RE = /^([A-G][#b]?)(.*)$/;

// The 12 chromatic roots in this instrument's own spelling, ordered C..B.
export function listRoots(instrument) {
  const lib = CHORD_LIBRARY[instrument.id];
  if (!lib) return [];
  const byPc = {};
  for (const key of Object.keys(lib)) {
    const m = key.match(ROOT_RE);
    if (m && PITCH_CLASS[m[1]] !== undefined && byPc[PITCH_CLASS[m[1]]] === undefined) {
      byPc[PITCH_CLASS[m[1]]] = m[1];
    }
  }
  return Object.keys(byPc).map(Number).sort((a, b) => a - b).map((pc) => byPc[pc]);
}

// Quality suffixes available for a given root (matched by pitch class, so any
// enharmonic spelling of the root works).
export function listQualities(root, instrument) {
  const lib = CHORD_LIBRARY[instrument.id];
  if (!lib) return [];
  const targetPc = PITCH_CLASS[root];
  if (targetPc === undefined) return [];
  const out = [];
  for (const key of Object.keys(lib)) {
    const m = key.match(ROOT_RE);
    if (m && PITCH_CLASS[m[1]] === targetPc) out.push(m[2]);
  }
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
