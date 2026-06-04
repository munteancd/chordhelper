// test/transpose.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transposeChord } from '../js/transpose.js';

test('up two semitones: C -> D', () => assert.equal(transposeChord('C', 2), 'D'));
test('wraps at B: B +1 -> C', () => assert.equal(transposeChord('B', 1), 'C'));
test('down one: C -1 -> B', () => assert.equal(transposeChord('C', -1), 'B'));
test('keeps quality: Am +3 -> Cm', () => assert.equal(transposeChord('Am', 3), 'Cm'));
test('keeps 7th: G7 +2 -> A7', () => assert.equal(transposeChord('G7', 2), 'A7'));
test('flat root resolves: Bb +1 -> B', () => assert.equal(transposeChord('Bb', 1), 'B'));
test('slash bass transposes too: D/F# +2 -> E/G#', () => assert.equal(transposeChord('D/F#', 2), 'E/G#'));
test('full octave is identity: C +12 -> C', () => assert.equal(transposeChord('C', 12), 'C'));
test('non-chord token returned unchanged', () => assert.equal(transposeChord('Verse', 2), 'Verse'));
