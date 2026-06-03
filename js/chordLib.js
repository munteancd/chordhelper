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
