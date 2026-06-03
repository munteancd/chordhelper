// js/songStore.js
const KEY = 'chordhelper.songs.v1';

function load(storage) {
  try {
    const raw = storage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function createSongStore(storage) {
  let songs = load(storage);
  const persist = () => { try { storage.setItem(KEY, JSON.stringify(songs)); } catch {} };

  return {
    list: () => songs.map((s) => ({ ...s })),
    get: (id) => { const s = songs.find((x) => x.id === id); return s ? { ...s } : null; },
    save(song) {
      if (song.id) {
        const i = songs.findIndex((x) => x.id === song.id);
        if (i >= 0) songs[i] = { ...song };
        else songs.push({ ...song });
        persist();
        return { ...song };
      }
      const created = { ...song, id: 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6) };
      songs.push(created);
      persist();
      return { ...created };
    },
    remove(id) { songs = songs.filter((x) => x.id !== id); persist(); },
  };
}
