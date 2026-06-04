// data/songsBuiltin.js
// Built-in challenge songs, one per curriculum level.
// COPYRIGHT GUARDRAIL: real song title + artist (factual) and the chord
// PROGRESSION only. Chord sequences are not copyrightable. NO lyric text here.
// Each song uses only chords taught up to and including its level.
// Shape mirrors the user song store so Song Mode can render it directly:
//   { id, title, artist, instrument, strummingId, text }

export const BUILTIN_SONGS = {
  // ── Guitar ────────────────────────────────────────────────────────────────
  // L1: D A G
  'song-g1': {
    id: 'song-g1', title: 'Bad Moon Rising', artist: 'Creedence Clearwater Revival',
    instrument: 'guitar', strummingId: 'downUp',
    text: [
      '[Vers]',
      'D        A    G    D',
      'D        A    G    D',
      '[Refren]',
      'G             D',
      'A             D',
    ].join('\n'),
  },
  // L2: G D Am C
  'song-g2': {
    id: 'song-g2', title: "Knockin' on Heaven's Door", artist: 'Bob Dylan',
    instrument: 'guitar', strummingId: 'downUp',
    text: [
      '[Vers]',
      'G        D        Am',
      'G        D        C',
      'G        D        Am',
      'G        D        C',
    ].join('\n'),
  },
  // L3: A7 D7 E7 (12-bar blues in A)
  'song-g3': {
    id: 'song-g3', title: 'Johnny B. Goode', artist: 'Chuck Berry',
    instrument: 'guitar', strummingId: 'downUp',
    text: [
      '[Blues în La — 12 bări]',
      'A7       A7       A7       A7',
      'D7       D7       A7       A7',
      'E7       D7       A7       E7',
    ].join('\n'),
  },
  // L4: C G Am F Dm  (features the L4 chord F)
  'song-g4': {
    id: 'song-g4', title: 'Let It Be', artist: 'The Beatles',
    instrument: 'guitar', strummingId: 'allDown',
    text: [
      '[Vers]',
      'C        G        Am       F',
      'C        G        F        C',
      '[Refren]',
      'Am       G        F        C',
      'C        G        F        C',
    ].join('\n'),
  },

  // ── Ukulele ───────────────────────────────────────────────────────────────
  // L1: C Am F G
  'song-u1': {
    id: 'song-u1', title: 'Stand By Me', artist: 'Ben E. King',
    instrument: 'ukulele', strummingId: 'island',
    text: [
      '[Vers]',
      'C        C',
      'Am       Am',
      'F        G        C        C',
    ].join('\n'),
  },
  // L2: G Em D C  (features L2 chords D, Em)
  'song-u2': {
    id: 'song-u2', title: 'Take Me Home, Country Roads', artist: 'John Denver',
    instrument: 'ukulele', strummingId: 'island',
    text: [
      '[Vers]',
      'G        Em',
      'D        C        G',
      '[Refren]',
      'G        D        Em        C',
      'G        D        C         G',
    ].join('\n'),
  },
  // L3: A7 D7 G7 C  (features the L3 seventh chords)
  'song-u3': {
    id: 'song-u3', title: 'Sweet Georgia Brown', artist: 'Ben Bernie & Maceo Pinkard',
    instrument: 'ukulele', strummingId: 'island',
    text: [
      '[Temă]',
      'A7       A7       A7       A7',
      'D7       D7       D7       D7',
      'G7       G7       C        C',
    ].join('\n'),
  },
  // L4: F Bb C  (features the L4 chord Bb)
  'song-u4': {
    id: 'song-u4', title: 'La Bamba (în Fa)', artist: 'Ritchie Valens',
    instrument: 'ukulele', strummingId: 'island',
    text: [
      '[Vers]',
      'F        Bb       C        F',
      'F        Bb       C        F',
      '[Refren]',
      'Bb       C        F        F',
    ].join('\n'),
  },
};

export function getBuiltinSong(id) { return BUILTIN_SONGS[id] || null; }
