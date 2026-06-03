// service-worker.js
const CACHE = 'chordhelper-v2';
const ASSETS = [
  './', './index.html', './manifest.json', './icon.svg',
  './css/styles.css',
  './js/app.js', './js/router.js', './js/screens.js', './js/reference.js',
  './js/chordRenderer.js', './js/strumming.js', './js/strummingView.js',
  './js/audioEngine.js', './js/scheduleMath.js', './js/courseEngine.js',
  './data/instruments.js', './data/chords.js', './data/strummingPatterns.js', './data/lessons.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
