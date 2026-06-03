export const INSTRUMENTS = {
  guitar: {
    id: 'guitar',
    name: 'Chitară',
    strings: 6,
    tuning: ['E', 'A', 'D', 'G', 'B', 'E'], // low E -> high E
    // Actual MIDI pitch of each open string (E2 A2 D3 G3 B3 E4), low -> high.
    openMidi: [40, 45, 50, 55, 59, 64],
  },
  ukulele: {
    id: 'ukulele',
    name: 'Ukulele',
    strings: 4,
    tuning: ['G', 'C', 'E', 'A'],
    // Standard reentrant soprano tuning (g4 C4 E4 A4).
    openMidi: [67, 60, 64, 69],
  },
};

export const INSTRUMENT_IDS = ['guitar', 'ukulele'];
