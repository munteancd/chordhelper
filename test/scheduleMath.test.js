// test/scheduleMath.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { eighthDuration, tickTimes, isQuarter } from '../js/scheduleMath.js';

test('eighthDuration at 60 BPM is 0.5s', () => {
  assert.equal(eighthDuration(60), 0.5);
});

test('tickTimes produces evenly spaced times', () => {
  const times = tickTimes(10, 120, 4); // 120bpm -> eighth = 0.25s
  assert.deepEqual(times, [10, 10.25, 10.5, 10.75]);
});

test('isQuarter true on even ticks only', () => {
  assert.equal(isQuarter(0), true);
  assert.equal(isQuarter(1), false);
  assert.equal(isQuarter(2), true);
});
