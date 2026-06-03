// js/audioEngine.js
import { eighthDuration, isQuarter } from './scheduleMath.js';

function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

export function createAudioEngine() {
  let ctx = null;
  function ensureCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  // --- metronome ---
  let timerId = null;
  let tickIndex = 0;
  let nextTickTime = 0;
  let bpmRef = 60;
  let onTick = null;
  const LOOKAHEAD = 0.1;       // seconds scheduled ahead
  const INTERVAL = 25;          // ms timer

  function playClick(time, accent) {
    const c = ensureCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.frequency.value = accent ? 1000 : 700;
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(0.3, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    osc.connect(gain).connect(c.destination);
    osc.start(time); osc.stop(time + 0.06);
  }

  function scheduler() {
    const c = ensureCtx();
    const d = eighthDuration(bpmRef);
    while (nextTickTime < c.currentTime + LOOKAHEAD) {
      const idx = tickIndex;
      if (isQuarter(idx)) playClick(nextTickTime, idx % 8 === 0);
      const when = nextTickTime;
      // schedule UI highlight close to audio time
      const delayMs = Math.max(0, (when - c.currentTime) * 1000);
      const slot = idx % 8;
      if (onTick) setTimeout(() => { if (onTick) onTick(slot, idx); }, delayMs);
      nextTickTime += d;
      tickIndex++;
    }
  }

  return {
    start(bpm, tickCb) {
      const c = ensureCtx();
      bpmRef = bpm; onTick = tickCb; tickIndex = 0;
      nextTickTime = c.currentTime + 0.1;
      if (timerId) clearInterval(timerId);
      timerId = setInterval(scheduler, INTERVAL);
    },
    stop() {
      if (timerId) { clearInterval(timerId); timerId = null; }
      onTick = null;
    },
    setBpm(bpm) { bpmRef = bpm; },

    // --- chord reference tone ---
    playChord(chord, instrument) {
      const c = ensureCtx();
      const now = c.currentTime;
      let s = 0;
      chord.frets.forEach((fret, i) => {
        if (fret < 0) return; // muted
        const midi = instrument.openMidi[i] + fret; // real open-string pitch + fret
        const freq = midiToFreq(midi);
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        const t = now + s * 0.03; // slight strum spread
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.18, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.4);
        osc.connect(gain).connect(c.destination);
        osc.start(t); osc.stop(t + 1.5);
        s++;
      });
    },

    resume() { ensureCtx(); },
  };
}
