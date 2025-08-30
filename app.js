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

// ... (остальной код такой же как в предыдущем сообщении, включая всю бизнес-логику)
// Здесь опущен для краткости, но в реальном файле будет полный код из предыдущего шага.

// init
loadAll();
