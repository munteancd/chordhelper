// js/strummingView.js
import { slotLabel } from './strumming.js';

export function renderStrumming(container, pattern) {
  container.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'strum-row';
  pattern.slots.forEach((s, i) => {
    const cell = document.createElement('div');
    cell.className = 'strum-cell';
    cell.dataset.slot = String(i);
    const arrow = document.createElement('div');
    arrow.className = 'strum-arrow ' + (s === 'D' ? 'down' : s === 'U' ? 'up' : 'rest');
    arrow.textContent = s === 'D' ? '↓' : s === 'U' ? '↑' : '·';
    const lbl = document.createElement('div');
    lbl.className = 'strum-label';
    lbl.textContent = slotLabel(i);
    cell.append(arrow, lbl);
    row.appendChild(cell);
  });
  container.appendChild(row);
  return {
    highlight(slot) {
      row.querySelectorAll('.strum-cell').forEach((c) =>
        c.classList.toggle('active', Number(c.dataset.slot) === slot));
    },
    clear() {
      row.querySelectorAll('.strum-cell').forEach((c) => c.classList.remove('active'));
    },
  };
}
