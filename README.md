# ChordHelper

A small, no-build PWA that teaches absolute beginners to play **guitar** and **ukulele**,
step by step: a from-zero lesson course plus a free chord reference. Shows finger
placement on the left, strumming + metronome on the right.

## Run locally
Service workers need http, so serve the folder:
```
npx http-server -p 8080 .
```
Then open http://localhost:8080

(For quick UI tinkering without the service worker, you can also just open `index.html`.)

## Tests
```
npm test
```
Unit tests cover the pure modules: chord renderer, strumming model, metronome
scheduling math, and the course/progress engine.

## Structure
- `js/` — app code (pure modules + thin DOM/audio layers)
- `data/` — instruments, chords, strumming patterns, lessons
- `test/` — node:test unit tests
