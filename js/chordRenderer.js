// js/chordRenderer.js
// Renders a chord shape to an SVG string. Pure: no DOM access.
const FRETS_SHOWN = 4;

export function renderChordSVG(chord, instrument) {
  const n = instrument.strings;
  const W = 200, H = 230;
  const padX = 26, padTop = 40, padBottom = 24;
  const boardW = W - padX * 2;
  const boardH = H - padTop - padBottom;
  const colGap = boardW / (n - 1);
  const rowGap = boardH / FRETS_SHOWN;
  const x = (i) => padX + i * colGap;

  const parts = [];
  parts.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" class="chord-svg">`);

  // nut
  parts.push(`<rect class="nut" x="${padX}" y="${padTop}" width="${boardW}" height="5" rx="2"/>`);
  // fret rows
  for (let f = 1; f <= FRETS_SHOWN; f++) {
    const y = padTop + f * rowGap;
    parts.push(`<line class="fret-line" x1="${padX}" y1="${y}" x2="${padX + boardW}" y2="${y}"/>`);
  }
  // strings + markers
  for (let i = 0; i < n; i++) {
    const sx = x(i);
    parts.push(`<line class="string-line" x1="${sx}" y1="${padTop}" x2="${sx}" y2="${padTop + boardH}"/>`);
    const fret = chord.frets[i];
    const finger = chord.fingers[i];
    if (fret === -1) {
      parts.push(`<text class="muted-marker" x="${sx}" y="${padTop - 12}" text-anchor="middle">×</text>`);
    } else if (fret === 0) {
      parts.push(`<text class="open-marker" x="${sx}" y="${padTop - 12}" text-anchor="middle">○</text>`);
    } else {
      const cy = padTop + (fret - 0.5) * rowGap;
      parts.push(`<circle class="finger-dot" cx="${sx}" cy="${cy}" r="11"/>`);
      if (finger > 0) {
        parts.push(`<text class="finger-num" x="${sx}" y="${cy + 4}" text-anchor="middle">${finger}</text>`);
      }
    }
  }
  parts.push(`</svg>`);
  return parts.join('');
}
