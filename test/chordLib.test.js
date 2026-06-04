// test/chordLib.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getChordShape, isChordToken, listRoots, listQualities } from '../js/chordLib.js';
import { INSTRUMENTS } from '../data/instruments.js';

test('looks up a plain major chord', () => {
  const s = getChordShape('C', INSTRUMENTS.guitar);
  assert.ok(s && s.name === 'C');
});

test('Bb resolves (enharmonic, present as Bb in lib)', () => {
  assert.ok(getChordShape('Bb', INSTRUMENTS.guitar));
});

test('A# maps to Bb shape via enharmonic normalization', () => {
  const a = getChordShape('A#', INSTRUMENTS.guitar);
  const bb = getChordShape('Bb', INSTRUMENTS.guitar);
  assert.deepEqual(a && a.frets, bb && bb.frets);
});

test('slash chord C/G looks up C', () => {
  const s = getChordShape('C/G', INSTRUMENTS.guitar);
  assert.ok(s && s.name === 'C');
});

test('min alias: Amin == Am', () => {
  const a = getChordShape('Amin', INSTRUMENTS.guitar);
  assert.ok(a && a.name === 'Am');
});

test('unknown chord returns null', () => {
  assert.equal(getChordShape('Gx7b13', INSTRUMENTS.guitar), null);
});

test('isChordToken accepts chords, rejects words', () => {
  for (const t of ['C', 'Am', 'F#m', 'G7', 'Bb', 'Csus4', 'D/F#']) assert.ok(isChordToken(t), t);
  for (const t of ['the', 'Verse:', 'Chorus', 'and', 'la-la', '']) assert.equal(isChordToken(t), false, t);
});

test('listRoots returns the 12 chromatic roots', () => {
  const roots = listRoots(INSTRUMENTS.guitar);
  assert.equal(roots.length, 12);
  assert.ok(roots.includes('C') && roots.includes('F#'));
});

test('listQualities for C includes major (empty), m and 7', () => {
  const q = listQualities('C', INSTRUMENTS.guitar);
  assert.ok(q.includes('') && q.includes('m') && q.includes('7'));
});

test('listQualities entries all resolve to a shape', () => {
  for (const q of listQualities('G', INSTRUMENTS.guitar)) {
    assert.ok(getChordShape('G' + q, INSTRUMENTS.guitar), 'G' + q);
  }
});

test('listQualities accepts a flat root spelling (Bb -> A# keys)', () => {
  assert.ok(listQualities('Bb', INSTRUMENTS.guitar).length > 0);
});
