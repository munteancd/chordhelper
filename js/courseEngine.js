// js/courseEngine.js
import { LESSONS } from '../data/lessons.js';

const KEY = 'chordhelper.progress.v1';

function defaultProgress() {
  return { instrument: 'guitar', completed: { guitar: [], ukulele: [] } };
}

function load(storage) {
  try {
    const raw = storage.getItem(KEY);
    if (!raw) return defaultProgress();
    const p = JSON.parse(raw);
    return {
      instrument: p.instrument === 'ukulele' ? 'ukulele' : 'guitar',
      completed: {
        guitar: Array.isArray(p.completed?.guitar) ? p.completed.guitar : [],
        ukulele: Array.isArray(p.completed?.ukulele) ? p.completed.ukulele : [],
      },
    };
  } catch {
    return defaultProgress();
  }
}

export function createCourse(storage) {
  let state = load(storage);
  const save = () => { try { storage.setItem(KEY, JSON.stringify(state)); } catch {} };

  return {
    getInstrument: () => state.instrument,
    setInstrument(id) { state.instrument = id === 'ukulele' ? 'ukulele' : 'guitar'; save(); },
    getCompleted: (instrument) => [...state.completed[instrument]],
    getLessons: (instrument) => LESSONS[instrument],
    isUnlocked(instrument, index) {
      if (index <= 0) return true;
      const prev = LESSONS[instrument][index - 1];
      return state.completed[instrument].includes(prev.id);
    },
    markComplete(instrument, lessonId) {
      if (!state.completed[instrument].includes(lessonId)) {
        state.completed[instrument].push(lessonId);
        save();
      }
    },
  };
}
