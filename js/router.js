// js/router.js — minimal hash router. Routes: #/, #/lessons, #/lesson/:id, #/reference
export function createRouter(onRoute) {
  function parse() {
    const hash = location.hash.replace(/^#/, '') || '/';
    const parts = hash.split('/').filter(Boolean); // [] | ['lessons'] | ['lesson','g1'] | ['reference']
    return { name: parts[0] || 'home', param: parts[1] || null };
  }
  function fire() { onRoute(parse()); }
  window.addEventListener('hashchange', fire);
  return { start: fire, go: (path) => { location.hash = path; } };
}
