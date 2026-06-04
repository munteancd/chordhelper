// test/chordRenderer.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderChordSVG } from '../js/chordRenderer.js';
import { INSTRUMENTS } from '../data/instruments.js';
import { getChordShape } from '../js/chordLib.js';

const count = (s, sub) => s.split(sub).length - 1;
const shape = (name, inst) => getChordShape(name, INSTRUMENTS[inst]);

test('guitar Em renders 6 string lines', () => {
  const svg = renderChordSVG(shape('Em', 'guitar'), INSTRUMENTS.guitar);
  assert.equal(count(svg, 'class="string-line"'), 6);
});

test('guitar Em has 2 pressed dots, 4 open markers, 0 muted', () => {
  const svg = renderChordSVG(shape('Em', 'guitar'), INSTRUMENTS.guitar);
  assert.equal(count(svg, 'class="finger-dot"'), 2);
  assert.equal(count(svg, 'class="open-marker"'), 4);
  assert.equal(count(svg, 'class="muted-marker"'), 0);
});

test('guitar C has 1 muted marker (low E)', () => {
  const svg = renderChordSVG(shape('C', 'guitar'), INSTRUMENTS.guitar);
  assert.equal(count(svg, 'class="muted-marker"'), 1);
});

test('ukulele C renders 4 string lines and 1 dot', () => {
  const svg = renderChordSVG(shape('C', 'ukulele'), INSTRUMENTS.ukulele);
  assert.equal(count(svg, 'class="string-line"'), 4);
  assert.equal(count(svg, 'class="finger-dot"'), 1);
});

test('returns a string starting with <svg', () => {
  const svg = renderChordSVG(shape('C', 'ukulele'), INSTRUMENTS.ukulele);
  assert.ok(svg.trim().startsWith('<svg'));
});
