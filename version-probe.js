// version-probe.js — автообновление GitHub Pages при выходе новой версии
(function(){
  try {
    // Текущая версия — из src app.js?v=<build>
    var cur = (function(){
      var s = document.querySelector('script[src*="app.js"]');
      if(!s) return null;
      var m = (s.getAttribute('src')||'').match(/[?&]v=(\d+)/);
      return m ? m[1] : null;
    })();

    // Берём свежую версию, обходя кэш (уникальный ts)
    fetch('VERSION.txt?ts=' + Date.now(), { cache: 'no-store' })
      .then(function(r){ return r.text(); })
      .then(function(t){
        var m = String(t||'').match(/BUILD_VERSION=(\d+)/);
        var latest = m ? m[1] : null;
        if (latest && cur && latest !== cur) {
          // Жестко перезагружаем с параметром, чтобы получить новый index.html
          var url = window.location.pathname.split('?')[0] + '?v=' + latest;
          window.location.replace(url);
        }
      })
      .catch(function(){ /* молча игнорируем */ });
  } catch(_) {}
})();