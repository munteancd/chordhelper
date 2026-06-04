// js/songMode.js
import { INSTRUMENTS } from '../data/instruments.js';
import { renderChordSVG } from './chordRenderer.js';
import { getChordShape } from './chordLib.js';
import { parseChordSheet } from './chordSheet.js';
import { getPattern } from './strumming.js';
import { renderStrumming } from './strummingView.js';
import { STRUMMING_PATTERNS } from '../data/strummingPatterns.js';
import { getBuiltinSong } from '../data/songsBuiltin.js';
import { transposeChord } from './transpose.js';

const DEFAULT_PATTERN = 'island';

export function screenSongs(ctx) {
  const el = document.createElement('div');
  const songs = ctx.songs.list();
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Piesele mele</h2>
    <button class="primary" id="new">+ Piesă nouă</button>
    <div class="song-list"></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  el.querySelector('#new').onclick = () => ctx.router.go('/song-new');
  const list = el.querySelector('.song-list');
  if (songs.length === 0) {
    const p = document.createElement('p');
    p.className = 'subtitle';
    p.textContent = 'Nicio piesă încă. Lipește o foaie de acorduri ca să începi.';
    list.appendChild(p);
  }
  songs.forEach((s) => {
    const card = document.createElement('button');
    card.className = 'song-card';
    card.innerHTML = `<span class="meta"><b>${escapeHtml(s.title)}</b><small>${INSTRUMENTS[s.instrument].name}</small></span><span>›</span>`;
    card.onclick = () => ctx.router.go('/song/' + s.id);
    list.appendChild(card);
  });
  return el;
}

export function screenSongNew(ctx) {
  const el = document.createElement('div');
  const inst = ctx.course.getInstrument();
  el.innerHTML = `<button class="back" id="back">‹ Piese</button>
    <h2>Piesă nouă</h2>
    <input id="title" class="song-input" placeholder="Titlu (ex. Wonderwall)">
    <p class="subtitle">Lipește foaia de acorduri (acorduri deasupra versurilor):</p>
    <textarea id="sheet" class="song-textarea" rows="12" placeholder="C        G        Am       F
Versul tău aici..."></textarea>
    <div class="song-meta">Instrument: <b>${INSTRUMENTS[inst].name}</b> (se schimbă de pe Acasă)</div>
    <button class="primary" id="save" disabled>Salvează</button>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/songs');
  const title = el.querySelector('#title');
  const sheet = el.querySelector('#sheet');
  const save = el.querySelector('#save');
  const refresh = () => { save.disabled = !(title.value.trim() && sheet.value.trim()); };
  title.oninput = refresh; sheet.oninput = refresh;
  save.onclick = () => {
    const song = ctx.songs.save({
      title: title.value.trim(), text: sheet.value, instrument: inst, strummingId: DEFAULT_PATTERN,
    });
    ctx.router.go('/song/' + song.id);
  };
  return el;
}

export function screenSong(ctx, id) {
  const el = document.createElement('div');
  let song, readOnly = false;
  if (id && id.startsWith('builtin:')) {
    song = getBuiltinSong(id.slice('builtin:'.length));
    readOnly = true;
  } else {
    song = ctx.songs.get(id);
  }
  if (!song) { el.innerHTML = '<button class="back" id="back">‹ Piese</button><p>Piesă inexistentă.</p>'; el.querySelector('#back').onclick = () => ctx.router.go('/songs'); return el; }
  const instrument = INSTRUMENTS[song.instrument];
  const { rows, chordsUsed } = parseChordSheet(song.text);
  const backTo = readOnly ? '/lessons' : '/songs';

  el.innerHTML = `<button class="back" id="back">‹ ${readOnly ? 'Lecții' : 'Piese'}</button>
    <div class="stepbar"><b>${escapeHtml(song.title)}</b><span>${song.artist ? escapeHtml(song.artist) + ' · ' : ''}${instrument.name}</span></div>
    <div class="transpose"><span>Ton</span>
      <button id="tr-down">−</button><span id="tr-val">0</span><button id="tr-up">+</button></div>
    <div class="chord-strip"></div>
    <div class="song-strum">
      <div class="panel-label">Strumming sugerat</div>
      <select id="pattern" class="song-input"></select>
      <div class="strum-holder"></div>
      <div class="bpm"><button id="bpm-down">−</button><span id="bpm-val">70</span><span> BPM</span><button id="bpm-up">+</button></div>
      <button class="primary" id="toggle">▶ Start</button>
    </div>
    <div class="song-body"></div>
    <div class="chord-detail"></div>
    ${readOnly ? '' : '<button class="danger" id="del">Șterge piesa</button>'}`;

  el.querySelector('#back').onclick = () => { ctx.audio.stop(); ctx.router.go(backTo); };
  if (!readOnly) el.querySelector('#del').onclick = () => { ctx.audio.stop(); ctx.songs.remove(id); ctx.router.go('/songs'); };

  // chord strip (unique chords)
  const strip = el.querySelector('.chord-strip');
  const detail = el.querySelector('.chord-detail');
  function showDetail(name, play = true) {
    const shape = getChordShape(name, instrument);
    if (!shape) { detail.innerHTML = `<div class="chord-name">${escapeHtml(name)}</div><p class="subtitle">diagramă indisponibilă</p>`; return; }
    detail.innerHTML = `<div class="chord-name">${escapeHtml(name)}</div>` + renderChordSVG(shape, instrument);
    if (play) ctx.audio.playChord(shape, instrument);
  }
  const body = el.querySelector('.song-body');
  let transpose = 0;
  const disp = (name) => transposeChord(name, transpose);

  function redraw() {
    // chord strip (unique chords, transposed)
    strip.innerHTML = '';
    chordsUsed.forEach((name) => {
      const shown = disp(name);
      const shape = getChordShape(shown, instrument);
      const b = document.createElement('button');
      b.className = 'chord-mini' + (shape ? '' : ' unknown');
      b.innerHTML = `<span class="cm-name">${escapeHtml(shown)}</span>` + (shape ? renderChordSVG(shape, instrument) : '<span class="cm-na">?</span>');
      b.onclick = () => showDetail(shown);
      strip.appendChild(b);
    });
    // song body (chords above lyrics, transposed)
    body.innerHTML = '';
    rows.forEach((row) => {
      const rEl = document.createElement('div');
      rEl.className = 'song-row';
      const cLine = document.createElement('pre');
      cLine.className = 'chord-line';
      cLine.textContent = chordLineText(row.chords.map((c) => ({ name: disp(c.name), col: c.col })));
      const lLine = document.createElement('pre');
      lLine.className = 'lyric-line';
      lLine.textContent = row.lyrics;
      rEl.append(cLine, lLine);
      body.appendChild(rEl);
    });
    if (chordsUsed.length) showDetail(disp(chordsUsed[0]), false);
  }

  // strumming + metronome
  const sel = el.querySelector('#pattern');
  Object.values(STRUMMING_PATTERNS).forEach((p) => {
    const o = document.createElement('option'); o.value = p.id; o.textContent = p.label; sel.appendChild(o);
  });
  sel.value = song.strummingId || DEFAULT_PATTERN;
  let strum = renderStrumming(el.querySelector('.strum-holder'), getPattern(sel.value));
  sel.onchange = () => {
    strum = renderStrumming(el.querySelector('.strum-holder'), getPattern(sel.value));
    if (!readOnly) ctx.songs.save({ ...song, strummingId: sel.value });
  };

  let bpm = 70;
  const bpmVal = el.querySelector('#bpm-val');
  el.querySelector('#bpm-down').onclick = () => { bpm = Math.max(40, bpm - 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };
  el.querySelector('#bpm-up').onclick = () => { bpm = Math.min(160, bpm + 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };

  let playing = false;
  const toggle = el.querySelector('#toggle');
  toggle.onclick = () => {
    playing = !playing;
    if (playing) { toggle.textContent = '■ Stop'; ctx.audio.start(bpm, (slot) => strum.highlight(slot)); }
    else { toggle.textContent = '▶ Start'; ctx.audio.stop(); strum.clear(); }
  };

  const trVal = el.querySelector('#tr-val');
  const setTr = (d) => {
    transpose = Math.max(-11, Math.min(11, transpose + d));
    trVal.textContent = transpose > 0 ? '+' + transpose : '' + transpose;
    redraw();
  };
  el.querySelector('#tr-down').onclick = () => setTr(-1);
  el.querySelector('#tr-up').onclick = () => setTr(1);

  redraw();
  return el;
}

function chordLineText(chords) {
  let line = '';
  chords.forEach((c) => { if (c.col > line.length) line += ' '.repeat(c.col - line.length); line += c.name; });
  return line;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
