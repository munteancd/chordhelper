// test/chordSheet.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseChordSheet } from '../js/chordSheet.js';

test('pairs a chord line with the following lyric line', () => {
  const text = 'C       G\nHello darkness my old friend';
  const { rows, chordsUsed } = parseChordSheet(text);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].lyrics, 'Hello darkness my old friend');
  assert.deepEqual(rows[0].chords.map((c) => c.name), ['C', 'G']);
  assert.equal(rows[0].chords[0].col, 0);
  assert.equal(rows[0].chords[1].col, 8);
  assert.deepEqual(chordsUsed, ['C', 'G']);
});

test('chord-only line (no lyric under it) yields a row with empty lyrics', () => {
  const { rows } = parseChordSheet('Am  F  C  G');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].lyrics, '');
  assert.equal(rows[0].chords.length, 4);
});

test('lyric-only line yields a row with no chords', () => {
  const { rows } = parseChordSheet('just some lyrics here');
  assert.equal(rows.length, 1);
  assert.deepEqual(rows[0].chords, []);
  assert.equal(rows[0].lyrics, 'just some lyrics here');
});

test('chordsUsed is unique and in first-seen order', () => {
  const text = 'C   G\nla\nAm   G\nlo';
  const { chordsUsed } = parseChordSheet(text);
  assert.deepEqual(chordsUsed, ['C', 'G', 'Am']);
});

test('section labels like "Verse:" are treated as lyric lines, not chords', () => {
  const { rows } = parseChordSheet('Verse:');
  assert.deepEqual(rows[0].chords, []);
  assert.equal(rows[0].lyrics, 'Verse:');
});
