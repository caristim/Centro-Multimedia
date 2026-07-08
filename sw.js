const CACHE_NAME = 'streaming-launcher-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/radio.html',
  '/tvbrasil.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
  '/css/style.css',
  '/css/radio.css',
  '/css/tvbrasil.css',
  '/js/services.js',
  '/js/main.js',
  '/js/stations.js',
  '/js/radio.js',
  '/js/tvbrasil.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('/'))
  );
});
