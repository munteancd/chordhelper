// test/pitch.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { autocorrelate, freqToNote, centsOff, nearestString } from '../js/pitch.js';
import { INSTRUMENTS } from '../data/instruments.js';

function sine(freq, rate = 44100, n = 4096) {
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = Math.sin((2 * Math.PI * freq * i) / rate);
  return b;
}

test('autocorrelate finds 440 Hz within 2 Hz', () => {
  const f = autocorrelate(sine(440), 44100);
  assert.ok(Math.abs(f - 440) < 2, 'got ' + f);
});

test('autocorrelate finds 196 Hz (guitar G3) within 2 Hz', () => {
  const f = autocorrelate(sine(196), 44100);
  assert.ok(Math.abs(f - 196) < 2, 'got ' + f);
});

test('autocorrelate returns -1 on silence', () => {
  assert.equal(autocorrelate(new Float32Array(4096), 44100), -1);
});

test('freqToNote: 440 -> A4 with ~0 cents', () => {
  const r = freqToNote(440);
  assert.equal(r.name, 'A');
  assert.ok(Math.abs(r.cents) < 1);
});

test('centsOff: 440 vs A4 (midi 69) is ~0', () => {
  assert.ok(Math.abs(centsOff(440, 69)) < 1);
});

test('nearestString: 330 Hz is high E (index 5) on guitar', () => {
  assert.equal(nearestString(330, INSTRUMENTS.guitar), 5);
});

test('nearestString: 262 Hz is C string (index 1) on ukulele', () => {
  assert.equal(nearestString(262, INSTRUMENTS.ukulele), 1);
});
