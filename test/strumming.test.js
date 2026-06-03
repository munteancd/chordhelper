// test/strumming.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPattern, slotLabel, SLOTS_PER_BAR } from '../js/strumming.js';

test('SLOTS_PER_BAR is 8', () => {
  assert.equal(SLOTS_PER_BAR, 8);
});

test('getPattern returns island pattern with 8 slots', () => {
  const p = getPattern('island');
  assert.equal(p.slots.length, 8);
  assert.equal(p.label, 'D DU UDU');
});

test('slotLabel maps quarter beats and offbeats', () => {
  assert.deepEqual([0,1,2,3,4,5,6,7].map(slotLabel), ['1','&','2','&','3','&','4','&']);
});

test('getPattern throws on unknown id', () => {
  assert.throws(() => getPattern('nope'));
});
