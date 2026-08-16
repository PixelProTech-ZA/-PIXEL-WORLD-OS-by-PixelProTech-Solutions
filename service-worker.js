const CACHE_NAME = 'pixel-world-os-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './catalogue.json',
  './categories.json',
  './families.json',
  './drivers.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// JSON data files: network-first, falling back to cache only when offline.
// This is the catalogue/categories/families/drivers data — it changes as the
// catalogue grows, so a stale cached copy must never silently win over a
// working network response.
//
// Everything else in CORE_ASSETS (shell HTML/CSS/JS/icons): cache-first,
// since those only change on a deploy, and cache-first keeps the app instant
// and usable offline.
//
// External links (OS websites, driver pages) are never cached — this app
// never claims live external links work offline.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // let external requests pass through untouched

  const isDataFile = /\/(catalogue|categories|families|drivers)\.json$/.test(url.pathname);

  if (isDataFile) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => cached);
    })
  );
});
