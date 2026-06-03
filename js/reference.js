// js/reference.js
import { INSTRUMENTS } from '../data/instruments.js';
import { CHORDS } from '../data/chords.js';
import { renderChordSVG } from './chordRenderer.js';

export function screenReference(ctx) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const chords = CHORDS[inst];
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Acorduri — ${instrument.name}</h2>
    <div class="chip-row">${Object.keys(chords).map((k) => `<button class="chip" data-c="${k}">${k}</button>`).join('')}</div>
    <div class="ref-view"><div class="chord-name"></div><div class="chord-holder"></div></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  const nameEl = el.querySelector('.chord-name');
  const holder = el.querySelector('.chord-holder');
  function show(k) {
    const ch = chords[k];
    nameEl.textContent = ch.name + ' · ' + ch.displayName;
    holder.innerHTML = renderChordSVG(ch, instrument);
    el.querySelectorAll('.chip-row .chip').forEach((b) => b.classList.toggle('on', b.dataset.c === k));
  }
  el.querySelectorAll('.chip-row .chip').forEach((b) => {
    b.onclick = () => show(b.dataset.c);
    b.addEventListener('dblclick', () => ctx.audio.playChord(chords[b.dataset.c], instrument));
  });
  show(Object.keys(chords)[0]);
  return el;
}
