// helpers
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const money = v => '₸' + Math.round(v || 0).toLocaleString('ru-RU');

// Версия берём из src текущего скрипта (?v=...), чтобы index.html не трогать
const BUILD_VERSION = (() => {
  try {
    const currentScript = document.currentScript || [...document.getElementsByTagName('script')].pop();
    const u = new URL(currentScript.src, location.href);
    return u.searchParams.get('v') || '21';
  } catch (e) {
    return '21';
  }
})();

// геодистанция
const hav = (a, b) => {
  const R = 6371, toRad = x => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lng - a.lng);
  const s = (Math.sin(dLat/2) ** 2) + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * (Math.sin(dLon/2) ** 2);
  return 2 * R * Math.asin(Math.sqrt(s));
};

// ... полный код app.js с правками (как в последней версии) ...
