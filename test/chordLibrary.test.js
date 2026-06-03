// test/chordLibrary.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHORD_LIBRARY } from '../data/chordLibrary.js';
import { INSTRUMENTS } from '../data/instruments.js';

for (const instId of ['guitar', 'ukulele']) {
  const lib = CHORD_LIBRARY[instId];
  const n = INSTRUMENTS[instId].strings;

  test(`${instId}: library is non-empty`, () => {
    assert.ok(Object.keys(lib).length >= 15, `${instId} should have >=15 chords`);
  });

  test(`${instId}: every shape has correct array lengths and finger consistency`, () => {
    for (const [name, ch] of Object.entries(lib)) {
      assert.equal(ch.frets.length, n, `${name} frets length`);
      assert.equal(ch.fingers.length, n, `${name} fingers length`);
      assert.equal(ch.name, name, `${name} self-consistent name`);
      for (let i = 0; i < n; i++) {
        if (ch.frets[i] <= 0) assert.equal(ch.fingers[i], 0, `${name} string ${i}: no finger on open/muted`);
      }
    }
  });

  test(`${instId}: includes the common roots as major chords`, () => {
    for (const root of ['C', 'D', 'E', 'F', 'G', 'A']) {
      assert.ok(lib[root], `${instId} missing major chord ${root}`);
    }
  });
}
