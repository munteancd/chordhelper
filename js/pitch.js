// js/pitch.js
// Pure pitch-detection helpers for the tuner. No DOM/audio dependencies.
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiToFreq(m) { return 440 * Math.pow(2, (m - 69) / 12); }

// Autocorrelation pitch detection (after cwilso/PitchDetect). Returns frequency
// in Hz, or -1 if no clear pitch. Skips the zero-lag descent before taking the
// global correlation peak, so it doesn't lock onto harmonics/sub-periods.
export function autocorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // too quiet

  // Trim quiet edges to clean leading/trailing partial cycles.
  let r1 = 0, r2 = SIZE - 1;
  const thres = 0.2;
  for (let i = 0; i < SIZE / 2; i++) { if (Math.abs(buf[i]) < thres) { r1 = i; break; } }
  for (let i = 1; i < SIZE / 2; i++) { if (Math.abs(buf[SIZE - i]) < thres) { r2 = SIZE - i; break; } }
  const b = buf.slice(r1, r2);
  SIZE = b.length;
  if (SIZE < 2) return -1;

  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) for (let j = 0; j < SIZE - i; j++) c[i] += b[j] * b[j + i];

  let d = 0;
  while (d < SIZE - 1 && c[d] > c[d + 1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) { if (c[i] > maxval) { maxval = c[i]; maxpos = i; } }
  let T0 = maxpos;
  if (T0 <= 0) return -1;

  // Parabolic interpolation around the peak for sub-sample accuracy.
  if (T0 > 0 && T0 < SIZE - 1) {
    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2, bb = (x3 - x1) / 2;
    if (a) T0 = T0 - bb / (2 * a);
  }
  return sampleRate / T0;
}

export function freqToNote(freq) {
  const midi = Math.round(69 + 12 * Math.log2(freq / 440));
  const cents = 1200 * Math.log2(freq / midiToFreq(midi));
  return { name: NOTES[((midi % 12) + 12) % 12], midi, cents };
}

export function centsOff(freq, targetMidi) {
  return 1200 * Math.log2(freq / midiToFreq(targetMidi));
}

export function nearestString(freq, instrument) {
  let best = 0, bestAbs = Infinity;
  instrument.openMidi.forEach((m, i) => {
    const c = Math.abs(centsOff(freq, m));
    if (c < bestAbs) { bestAbs = c; best = i; }
  });
  return best;
}
