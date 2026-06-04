// js/app.js
import { createRouter } from './router.js';
import { createCourse } from './courseEngine.js';
import { createAudioEngine } from './audioEngine.js';
import { createSongStore } from './songStore.js';
import { screenHome, screenLessons, screenExercise } from './screens.js';
import { screenReference } from './reference.js';
import { screenSongs, screenSongNew, screenSong } from './songMode.js';
import { screenTuner } from './tuner.js';

const root = document.getElementById('app');
const course = createCourse(window.localStorage);
const audio = createAudioEngine();
const songs = createSongStore(window.localStorage);
const ctx = { course, audio, songs, router: null };
const router = createRouter(render);
ctx.router = router;

function mount(node) {
  const prev = root.firstElementChild;
  if (prev) prev.dispatchEvent(new Event('screen:leave'));
  root.innerHTML = '';
  root.appendChild(node);
}

function render(route) {
  audio.stop();
  if (route.name === 'lessons') mount(screenLessons(ctx));
  else if (route.name === 'lesson') mount(screenExercise(ctx, route.param));
  else if (route.name === 'reference') mount(screenReference(ctx));
  else if (route.name === 'songs') mount(screenSongs(ctx));
  else if (route.name === 'song-new') mount(screenSongNew(ctx));
  else if (route.name === 'song') mount(screenSong(ctx, route.param));
  else if (route.name === 'tuner') mount(screenTuner(ctx));
  else mount(screenHome(ctx));
}

router.start();
