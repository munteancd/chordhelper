// test/courseEngine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCourse } from '../js/courseEngine.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

test('default progress: guitar selected, nothing completed', () => {
  const c = createCourse(fakeStorage());
  assert.equal(c.getInstrument(), 'guitar');
  assert.deepEqual(c.getCompleted('guitar'), []);
});

test('first lesson unlocked, second locked initially', () => {
  const c = createCourse(fakeStorage());
  assert.equal(c.isUnlocked('guitar', 0), true);
  assert.equal(c.isUnlocked('guitar', 1), false);
});

test('completing first lesson unlocks the second', () => {
  const c = createCourse(fakeStorage());
  c.markComplete('guitar', 'g1');
  assert.equal(c.isUnlocked('guitar', 1), true);
  assert.deepEqual(c.getCompleted('guitar'), ['g1']);
});

test('progress persists via storage', () => {
  const s = fakeStorage();
  createCourse(s).markComplete('ukulele', 'u1');
  const c2 = createCourse(s);
  assert.deepEqual(c2.getCompleted('ukulele'), ['u1']);
});

test('setInstrument changes and persists current instrument', () => {
  const s = fakeStorage();
  const c = createCourse(s);
  c.setInstrument('ukulele');
  assert.equal(createCourse(s).getInstrument(), 'ukulele');
});

test('markComplete is idempotent (no duplicates)', () => {
  const c = createCourse(fakeStorage());
  c.markComplete('guitar', 'g1');
  c.markComplete('guitar', 'g1');
  assert.deepEqual(c.getCompleted('guitar'), ['g1']);
});
