// js/tuner.js
import { INSTRUMENTS } from '../data/instruments.js';
import { autocorrelate, freqToNote, centsOff, nearestString } from './pitch.js';

export function screenTuner(ctx) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Acordează — ${instrument.name}</h2>
    <p class="subtitle">Corzi: ${instrument.tuning.join(' ')}</p>
    <div class="tuner-note">—</div>
    <div class="tuner-string"></div>
    <div class="tuner-meter"><div class="needle"></div></div>
    <div class="tuner-hint"></div>
    <button class="primary" id="start">🎤 Pornește microfonul</button>`;

  const noteEl = el.querySelector('.tuner-note');
  const stringEl = el.querySelector('.tuner-string');
  const needle = el.querySelector('.needle');
  const hint = el.querySelector('.tuner-hint');
  let audioCtx = null, analyser = null, raf = null, stream = null, buf = null;

  function stop() {
    if (raf) cancelAnimationFrame(raf);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    raf = null; stream = null; audioCtx = null;
  }

  function loop() {
    analyser.getFloatTimeDomainData(buf);
    const f = autocorrelate(buf, audioCtx.sampleRate);
    if (f > 0) {
      const note = freqToNote(f);
      const si = nearestString(f, instrument);
      const cents = centsOff(f, instrument.openMidi[si]);
      noteEl.textContent = note.name;
      stringEl.textContent = `Coarda ${si + 1}: ${instrument.tuning[si]}`;
      needle.style.transform = `translateX(${Math.max(-50, Math.min(50, cents))}px)`;
      hint.textContent = Math.abs(cents) < 5 ? '✓ corect' : cents < 0 ? 'prea jos — strânge' : 'prea sus — slăbește';
      hint.className = 'tuner-hint ' + (Math.abs(cents) < 5 ? 'ok' : 'off');
    }
    raf = requestAnimationFrame(loop);
  }

  el.querySelector('#start').onclick = async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      buf = new Float32Array(analyser.fftSize);
      src.connect(analyser);
      el.querySelector('#start').textContent = '🎤 Ascult...';
      loop();
    } catch (e) {
      hint.textContent = 'Microfon indisponibil sau refuzat.';
    }
  };

  el.querySelector('#back').onclick = () => { stop(); ctx.router.go('/'); };
  el.addEventListener('screen:leave', stop);
  return el;
}
