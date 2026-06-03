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
