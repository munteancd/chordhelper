// js/strumming.js
import { STRUMMING_PATTERNS } from '../data/strummingPatterns.js';

export const SLOTS_PER_BAR = 8;
const LABELS = ['1', '&', '2', '&', '3', '&', '4', '&'];

export function getPattern(id) {
  const p = STRUMMING_PATTERNS[id];
  if (!p) throw new Error(`Unknown strumming pattern: ${id}`);
  return p;
}

export function slotLabel(index) {
  return LABELS[index % SLOTS_PER_BAR];
}
