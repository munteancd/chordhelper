// test/curriculum.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CURRICULUM } from '../data/curriculum.js';
import { getChordShape } from '../js/chordLib.js';
import { INSTRUMENTS } from '../data/instruments.js';

test('both instruments have 4 ordered levels', () => {
  for (const inst of ['guitar', 'ukulele']) {
    assert.equal(CURRICULUM[inst].length, 4, inst);
    CURRICULUM[inst].forEach((lv, i) => {
      assert.ok(lv.id && lv.title && Array.isArray(lv.lessons) && lv.lessons.length > 0, `${inst} L${i}`);
    });
  }
});

test('every lesson id is unique per instrument', () => {
  for (const inst of ['guitar', 'ukulele']) {
    const ids = CURRICULUM[inst].flatMap((lv) => lv.lessons.map((l) => l.id));
    assert.equal(new Set(ids).size, ids.length, inst);
  }
});

test('every chord referenced by a lesson resolves in the library', () => {
  for (const inst of ['guitar', 'ukulele']) {
    const instrument = INSTRUMENTS[inst];
    CURRICULUM[inst].forEach((lv) => lv.lessons.forEach((l) => {
      l.chords.forEach((c) => assert.ok(getChordShape(c, instrument), `${inst} ${l.id} ${c}`));
    }));
  }
});

test('level 1 preserves the original first lesson ids', () => {
  assert.equal(CURRICULUM.guitar[0].lessons[0].id, 'g1');
  assert.equal(CURRICULUM.ukulele[0].lessons[0].id, 'u1');
});
