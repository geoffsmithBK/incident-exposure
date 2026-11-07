// Offline support for the Incident Exposure Matrix.
// Bump VERSION whenever the precache list changes, to drop the old caches.
var VERSION = 'v1.2';
var CACHE = 'incident-exposure-' + VERSION;

var PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './img/icons/apple-touch-icon.png',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@1.70.0/dist/umd/lucide.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
];

// Cross-origin hosts whose responses are cached as they're used
// (Google Fonts CSS points at font files on fonts.gstatic.com).
var RUNTIME_HOSTS = ['cdn.tailwindcss.com', 'unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(PRECACHE.map(function (url) {
        // Fetch each one on its own so one failing CDN doesn't block install.
        return fetch(url, { mode: 'cors', credentials: 'omit' })
          .then(function (res) { if (res.ok) return cache.put(url, res); })
          .catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
        if (key.indexOf('incident-exposure-') === 0 && key !== CACHE) return caches.delete(key);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

function cacheable(res) {
  return res && (res.ok || res.type === 'opaque');
}

// Stale-while-revalidate: answer from cache right away (fast on set, works
// with no signal), then refresh the cache in the background so updates
// show up on the next launch.
self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin && RUNTIME_HOSTS.indexOf(url.hostname) === -1) return;

  // All navigations within scope are the one page.
  var key = req.mode === 'navigate' ? './index.html' : req;

  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(key, { ignoreSearch: req.mode === 'navigate' }).then(function (cached) {
        var network = fetch(req).then(function (res) {
          if (cacheable(res)) cache.put(key, res.clone());
          return res;
        }).catch(function () { return cached; });

        if (cached) {
          event.waitUntil(network);
          return cached;
        }
        return network;
      });
    })
  );
});
