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

test('getLevels returns 4 levels with lessons and challenge', () => {
  const c = createCourse(fakeStorage());
  const levels = c.getLevels('guitar');
  assert.equal(levels.length, 4);
  assert.ok(levels[0].lessons.length > 0 && levels[0].challenge);
});

test('level is incomplete until all its lessons are done; challenge locked', () => {
  const c = createCourse(fakeStorage());
  const lv = c.getLevels('guitar')[0];
  assert.equal(c.isLevelComplete('guitar', lv.id), false);
  assert.equal(c.isChallengeUnlocked('guitar', lv.id), false);
});

test('completing all lessons in a level completes it and unlocks the challenge', () => {
  const c = createCourse(fakeStorage());
  const lv = c.getLevels('guitar')[0];
  lv.lessons.forEach((l) => c.markComplete('guitar', l.id));
  assert.equal(c.isLevelComplete('guitar', lv.id), true);
  assert.equal(c.isChallengeUnlocked('guitar', lv.id), true);
});

test('level 2 lessons are locked until level 1 is complete', () => {
  const c = createCourse(fakeStorage());
  const firstL2Index = c.getLevels('guitar')[0].lessons.length; // first lesson of L2
  assert.equal(c.isUnlocked('guitar', firstL2Index), false);
});
