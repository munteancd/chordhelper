// js/scheduleMath.js
// Pure timing math for the metronome (eighth-note grid).
export function eighthDuration(bpm) {
  return 60 / bpm / 2;
}

export function tickTimes(startTime, bpm, numTicks) {
  const d = eighthDuration(bpm);
  const out = [];
  for (let i = 0; i < numTicks; i++) out.push(startTime + i * d);
  return out;
}

export function isQuarter(tickIndex) {
  return tickIndex % 2 === 0;
}
