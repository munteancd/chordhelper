// frets: -1 muted, 0 open, >=1 fret. fingers: 0 none, 1..4 finger. Index 0 = lowest string.
export const CHORDS = {
  guitar: {
    Em: { name: 'Em', displayName: 'Mi minor', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0] },
    A:  { name: 'A',  displayName: 'La',        frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0] },
    D:  { name: 'D',  displayName: 'Re',        frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2] },
    G:  { name: 'G',  displayName: 'Sol',       frets: [3, 2, 0, 0, 0, 3],  fingers: [2, 1, 0, 0, 0, 3] },
    C:  { name: 'C',  displayName: 'Do',        frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0] },
  },
  ukulele: {
    C:  { name: 'C',  displayName: 'Do',  frets: [0, 0, 0, 3], fingers: [0, 0, 0, 3] },
    Am: { name: 'Am', displayName: 'La minor', frets: [2, 0, 0, 0], fingers: [2, 0, 0, 0] },
    F:  { name: 'F',  displayName: 'Fa',  frets: [2, 0, 1, 0], fingers: [2, 0, 1, 0] },
    G:  { name: 'G',  displayName: 'Sol', frets: [0, 2, 3, 2], fingers: [0, 1, 3, 2] },
  },
};
