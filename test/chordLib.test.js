// test/chordLib.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getChordShape, isChordToken } from '../js/chordLib.js';
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
