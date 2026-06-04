// js/reference.js
import { INSTRUMENTS } from '../data/instruments.js';
import { renderChordSVG } from './chordRenderer.js';
import { getChordShape, listRoots, listQualities } from './chordLib.js';

const QUALITY_LABEL = {
  '': 'major', m: 'minor', 7: '7', m7: 'm7', maj7: 'maj7', 6: '6', m6: 'm6',
  9: '9', m9: 'm9', sus2: 'sus2', sus4: 'sus4', dim: 'dim', aug: 'aug', add9: 'add9',
};

export function screenReference(ctx) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Acorduri — ${instrument.name}</h2>
    <input id="search" class="song-input" placeholder="Scrie un acord (ex. Bbm7)">
    <div class="root-row chip-row"></div>
    <div class="type-row chip-row"></div>
    <div class="ref-view">
      <div class="chord-name"></div>
      <div class="chord-holder"></div>
      <button id="play">🔊 Ascultă</button>
    </div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');

  const rootRow = el.querySelector('.root-row');
  const typeRow = el.querySelector('.type-row');
  const nameEl = el.querySelector('.chord-name');
  const holder = el.querySelector('.chord-holder');
  let root = listRoots(instrument)[0] || 'C';
  let quality = '';

  function render() {
    const name = root + quality;
    const shape = getChordShape(name, instrument);
    nameEl.textContent = name;
    holder.innerHTML = shape ? renderChordSVG(shape, instrument) : '<p class="subtitle">diagramă indisponibilă</p>';
    rootRow.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b.dataset.r === root));
    typeRow.querySelectorAll('.chip').forEach((b) => b.classList.toggle('on', b.dataset.q === quality));
  }

  function buildTypes() {
    const qs = listQualities(root, instrument);
    typeRow.innerHTML = qs.map((q) => `<button class="chip" data-q="${q}">${QUALITY_LABEL[q] || q}</button>`).join('');
    if (!qs.includes(quality)) quality = qs.includes('') ? '' : (qs[0] || '');
    typeRow.querySelectorAll('.chip').forEach((b) => { b.onclick = () => { quality = b.dataset.q; render(); }; });
  }

  rootRow.innerHTML = listRoots(instrument).map((r) => `<button class="chip" data-r="${r}">${r}</button>`).join('');
  rootRow.querySelectorAll('.chip').forEach((b) => { b.onclick = () => { root = b.dataset.r; buildTypes(); render(); }; });

  el.querySelector('#play').onclick = () => {
    const s = getChordShape(root + quality, instrument);
    if (s) ctx.audio.playChord(s, instrument);
  };

  el.querySelector('#search').oninput = (e) => {
    const v = e.target.value.trim();
    if (!v) return;
    const s = getChordShape(v, instrument);
    nameEl.textContent = v;
    holder.innerHTML = s ? renderChordSVG(s, instrument) : '<p class="subtitle">diagramă indisponibilă</p>';
  };

  buildTypes();
  render();
  return el;
}
