// js/app.js
import { createRouter } from './router.js';
import { createCourse } from './courseEngine.js';
import { createAudioEngine } from './audioEngine.js';
import { screenHome, screenLessons, screenExercise } from './screens.js';
import { screenReference } from './reference.js';

const root = document.getElementById('app');
const course = createCourse(window.localStorage);
const audio = createAudioEngine();
const ctx = { course, audio, router: null };
const router = createRouter(render);
ctx.router = router;

function mount(node) { root.innerHTML = ''; root.appendChild(node); }

function render(route) {
  audio.stop();
  if (route.name === 'lessons') mount(screenLessons(ctx));
  else if (route.name === 'lesson') mount(screenExercise(ctx, route.param));
  else if (route.name === 'reference') mount(screenReference(ctx));
  else mount(screenHome(ctx));
}

router.start();
