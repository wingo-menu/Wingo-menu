// sw.js — безопасное обновление без «залипания» на старой версии
const CACHE_STATIC = 'wingo-static-v1';
const CACHE_DYNAMIC = 'wingo-dynamic-v1';
const OFFLINE_URL = 'index.html';

self.addEventListener('install', (event) => {
  // Не предкешируем index/app/menu — чтобы не раздавать устаревшее
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = new Set([CACHE_STATIC, CACHE_DYNAMIC]);
    const names = await caches.keys();
    await Promise.all(names.filter(n => !keep.has(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

function isHTML(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}
function isJSON(url) {
  return /\.json($|\?)/.test(url.pathname);
}
function isStatic(url) {
  return /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2)($|\?)/.test(url.pathname);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // HTML / навигации — network-first
  if (isHTML(req)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        const c = await caches.open(CACHE_DYNAMIC);
        c.put(req, net.clone()).catch(() => {});
        return net;
      } catch (err) {
        const c = await caches.open(CACHE_DYNAMIC);
        const cached = await c.match(req);
        return cached || caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // JSON — network-first (меню/конфиг всегда свежие)
  if (isJSON(url)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-store' });
        const c = await caches.open(CACHE_DYNAMIC);
        c.put(req, net.clone()).catch(() => {});
        return net;
      } catch (err) {
        const c = await caches.open(CACHE_DYNAMIC);
        const cached = await c.match(req);
        return cached || new Response("{}", { headers: { "Content-Type": "application/json" } });
      }
    })());
    return;
  }

  // Версионированная статика — cache-first + тихое обновление
  if (isStatic(url)) {
    event.respondWith((async () => {
      const c = await caches.open(CACHE_STATIC);
      const cached = await c.match(req);
      const fetchAndUpdate = fetch(req).then(res => {
        c.put(req, res.clone()).catch(() => {});
        return res;
      }).catch(() => cached);
      return cached || fetchAndUpdate;
    })());
    return;
  }

  // Остальное — сеть, затем кэш
  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      const c = await caches.open(CACHE_DYNAMIC);
      c.put(req, net.clone()).catch(() => {});
      return net;
    } catch (err) {
      const c = await caches.open(CACHE_DYNAMIC);
      const cached = await c.match(req);
      return cached || Response.error();
    }
  })());
});
