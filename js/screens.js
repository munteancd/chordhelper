// js/screens.js
import { INSTRUMENTS } from '../data/instruments.js';
import { getChordShape } from './chordLib.js';
import { renderChordSVG } from './chordRenderer.js';
import { getPattern } from './strumming.js';
import { renderStrumming } from './strummingView.js';

export function screenHome(ctx) {
  const inst = ctx.course.getInstrument();
  const el = document.createElement('div');
  el.innerHTML = `
    <h1>ChordHelper</h1>
    <p class="subtitle">Învață chitară și ukulele, pas cu pas.</p>
    <div class="inst-switch">
      <button data-i="guitar" class="${inst==='guitar'?'on':''}">Chitară</button>
      <button data-i="ukulele" class="${inst==='ukulele'?'on':''}">Ukulele</button>
    </div>
    <div class="home-actions">
      <button class="primary" id="go-lessons">Lecții</button>
      <button id="go-songs">Piese</button>
      <button id="go-ref">Caută un acord</button>
    </div>`;
  el.querySelectorAll('.inst-switch button').forEach((b) =>
    b.onclick = () => { ctx.course.setInstrument(b.dataset.i); ctx.router.start(); });
  el.querySelector('#go-lessons').onclick = () => ctx.router.go('/lessons');
  el.querySelector('#go-ref').onclick = () => ctx.router.go('/reference');
  el.querySelector('#go-songs').onclick = () => ctx.router.go('/songs');
  return el;
}

export function screenLessons(ctx) {
  const inst = ctx.course.getInstrument();
  const levels = ctx.course.getLevels(inst);
  const completed = ctx.course.getCompleted(inst);
  const el = document.createElement('div');
  el.innerHTML = `<button class="back" id="back">‹ Acasă</button>
    <h2>Lecții — ${INSTRUMENTS[inst].name}</h2><div class="level-list"></div>`;
  el.querySelector('#back').onclick = () => ctx.router.go('/');
  const list = el.querySelector('.level-list');
  let flatIndex = 0;
  levels.forEach((lv, li) => {
    const prevComplete = li === 0 || ctx.course.isLevelComplete(inst, levels[li - 1].id);
    const doneCount = lv.lessons.filter((l) => completed.includes(l.id)).length;
    const section = document.createElement('div');
    section.className = 'level' + (prevComplete ? '' : ' locked');
    section.innerHTML = `<div class="level-head">
      <b>${lv.title}</b>
      <span class="progress"><span style="width:${Math.round(100 * doneCount / lv.lessons.length)}%"></span></span>
      <small>${doneCount}/${lv.lessons.length}</small></div>`;
    lv.lessons.forEach((lesson) => {
      const idx = flatIndex++;
      const unlocked = ctx.course.isUnlocked(inst, idx);
      const done = completed.includes(lesson.id);
      const card = document.createElement('button');
      card.className = 'lesson-card' + (unlocked ? '' : ' locked') + (done ? ' done' : '');
      card.disabled = !unlocked;
      card.innerHTML = `<span class="meta"><b>${lesson.title}</b><small>${lesson.goal}</small></span>
        <span class="state">${done ? '✓' : unlocked ? '' : '🔒'}</span>`;
      card.onclick = () => ctx.router.go('/lesson/' + lesson.id);
      section.appendChild(card);
    });
    if (ctx.course.isChallengeUnlocked(inst, lv.id) && lv.challenge) {
      const ch = document.createElement('button');
      ch.className = 'challenge-card';
      ch.textContent = '🎵 Cântă o piesă cu ce ai învățat';
      ch.onclick = () => ctx.router.go('/song/builtin:' + lv.challenge);
      section.appendChild(ch);
    }
    list.appendChild(section);
  });
  return el;
}

export function screenExercise(ctx, lessonId) {
  const inst = ctx.course.getInstrument();
  const instrument = INSTRUMENTS[inst];
  const lessons = ctx.course.getLessons(inst);
  const idx = lessons.findIndex((l) => l.id === lessonId);
  const lesson = lessons[idx];
  const el = document.createElement('div');
  if (!lesson) { el.textContent = 'Lecție inexistentă'; return el; }

  const patternId = lesson.strumming;
  el.innerHTML = `
    <button class="back" id="back">‹ Lecții</button>
    <div class="stepbar"><b>${lesson.title}</b><span>${idx + 1}/${lessons.length}</span></div>
    <div class="exercise">
      <div class="ex-left">
        <div class="panel-label">Unde ții degetele</div>
        <div class="chord-switch"></div>
        <div class="chord-name"></div>
        <div class="chord-holder"></div>
      </div>
      <div class="ex-right">
        ${patternId ? '<div class="panel-label">Strumming</div><div class="strum-holder"></div>' : ''}
        <div class="panel-label" style="margin-top:14px">Metronom</div>
        <div class="bpm"><button id="bpm-down">−</button><span id="bpm-val">${lesson.practice.bpm}</span><span> BPM</span><button id="bpm-up">+</button></div>
        <button class="primary" id="toggle">▶ Start</button>
        <button id="play-chord">🔊 Ascultă acordul</button>
      </div>
    </div>
    <ol class="steps">${lesson.steps.map((s) => `<li>${s}</li>`).join('')}</ol>
    <button class="primary done-btn" id="done">Am terminat lecția ✓</button>`;

  el.querySelector('#back').onclick = () => { ctx.audio.stop(); ctx.router.go('/lessons'); };

  // chord selector (if lesson uses multiple chords)
  let current = lesson.chords[0];
  const nameEl = el.querySelector('.chord-name');
  const holder = el.querySelector('.chord-holder');
  const switchEl = el.querySelector('.chord-switch');
  function drawChord() {
    const ch = getChordShape(current, instrument);
    nameEl.textContent = current;
    holder.innerHTML = ch ? renderChordSVG(ch, instrument) : '<p class="subtitle">diagramă indisponibilă</p>';
  }
  lesson.chords.forEach((cn) => {
    const b = document.createElement('button');
    b.textContent = cn; b.className = 'chip' + (cn === current ? ' on' : '');
    b.onclick = () => { current = cn; switchEl.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x.textContent === cn)); drawChord(); };
    switchEl.appendChild(b);
  });
  drawChord();

  // strumming
  let strum = null;
  if (patternId) strum = renderStrumming(el.querySelector('.strum-holder'), getPattern(patternId));

  // bpm
  let bpm = lesson.practice.bpm;
  const bpmVal = el.querySelector('#bpm-val');
  el.querySelector('#bpm-down').onclick = () => { bpm = Math.max(40, bpm - 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };
  el.querySelector('#bpm-up').onclick = () => { bpm = Math.min(160, bpm + 5); bpmVal.textContent = bpm; ctx.audio.setBpm(bpm); };

  // transport
  let playing = false;
  const toggle = el.querySelector('#toggle');
  toggle.onclick = () => {
    playing = !playing;
    if (playing) {
      toggle.textContent = '■ Stop';
      ctx.audio.start(bpm, (slot) => { if (strum) strum.highlight(slot); });
    } else {
      toggle.textContent = '▶ Start';
      ctx.audio.stop(); if (strum) strum.clear();
    }
  };

  el.querySelector('#play-chord').onclick = () => {
    const ch = getChordShape(current, instrument);
    if (ch) ctx.audio.playChord(ch, instrument);
  };
  el.querySelector('#done').onclick = () => { ctx.audio.stop(); ctx.course.markComplete(inst, lesson.id); ctx.router.go('/lessons'); };
  return el;
}
