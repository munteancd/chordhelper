// test/songStore.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSongStore } from '../js/songStore.js';

function fakeStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
}

test('save creates a song with an id and lists it', () => {
  const s = createSongStore(fakeStorage());
  const song = s.save({ title: 'Test', text: 'C\nla', instrument: 'guitar', strummingId: 'island' });
  assert.ok(song.id);
  assert.equal(s.list().length, 1);
  assert.equal(s.get(song.id).title, 'Test');
});

test('save with existing id updates in place', () => {
  const s = createSongStore(fakeStorage());
  const song = s.save({ title: 'A', text: 'x', instrument: 'guitar', strummingId: 'island' });
  s.save({ ...song, title: 'B' });
  assert.equal(s.list().length, 1);
  assert.equal(s.get(song.id).title, 'B');
});

test('remove deletes a song', () => {
  const s = createSongStore(fakeStorage());
  const song = s.save({ title: 'A', text: 'x', instrument: 'ukulele', strummingId: 'allDown' });
  s.remove(song.id);
  assert.equal(s.list().length, 0);
});

test('persists across store instances over same storage', () => {
  const st = fakeStorage();
  createSongStore(st).save({ title: 'Keep', text: 'x', instrument: 'guitar', strummingId: 'island' });
  assert.equal(createSongStore(st).list().length, 1);
});
