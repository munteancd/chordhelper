// test/songsBuiltin.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BUILTIN_SONGS, getBuiltinSong } from '../data/songsBuiltin.js';
import { CURRICULUM } from '../data/curriculum.js';
import { getChordShape, isChordToken } from '../js/chordLib.js';
import { INSTRUMENTS } from '../data/instruments.js';

test('there is one challenge song per level', () => {
  const ids = CURRICULUM.guitar.concat(CURRICULUM.ukulele).map((lv) => lv.challenge);
  ids.forEach((id) => assert.ok(getBuiltinSong(id), id));
});

test('builtin song text contains only chord tokens and section labels (no lyrics)', () => {
  Object.values(BUILTIN_SONGS).forEach((s) => {
    s.text.split('\n').forEach((line) => {
      const t = line.trim();
      if (!t) return;
      if (/^\[.*\]$/.test(t)) return; // [Vers] / [Refren]
      t.split(/\s+/).forEach((tok) => assert.ok(isChordToken(tok), `${s.id}: "${tok}"`));
    });
  });
});

test('each song only uses chords available up to its level', () => {
  for (const inst of ['guitar', 'ukulele']) {
    const instrument = INSTRUMENTS[inst];
    const learned = new Set();
    CURRICULUM[inst].forEach((lv) => {
      lv.lessons.forEach((l) => l.chords.forEach((c) => learned.add(c)));
      const song = getBuiltinSong(lv.challenge);
      song.text.split(/\s+/).filter(isChordToken).forEach((tok) => {
        assert.ok(getChordShape(tok, instrument), `${song.id}: ${tok} resolves`);
        assert.ok(learned.has(tok), `${song.id}: ${tok} is learned by this level`);
      });
    });
  }
});
