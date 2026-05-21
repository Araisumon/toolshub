// Buzz Image Compressor – Service Worker
const CACHE_NAME = 'buzz-compress-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/manifest.json',
  // CDN dependencies (cached on first use)
  'https://cdn.jsdelivr.net/npm/compressorjs@1.2.1/dist/compressor.min.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
];

// Install – precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precaching failed for some assets, continuing...', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate – clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch – stale-while-revalidate for performance
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Don't cache blob: URLs
  if (event.request.url.startsWith('blob:')) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Offline – return cached version
          return cached || new Response('Offline', { status: 503 });
        });
        return cached || fetchPromise;
      });
    })
  );
});