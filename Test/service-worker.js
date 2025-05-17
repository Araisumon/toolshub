// service-worker.js
const CACHE_NAME = 'favicon-generator-v1';
const urlsToCache = [
    '/', // Or your specific HTML file name if not index.html
    // Add paths to CSS, JS, and any critical images (like your own site's favicons)
    // e.g., '/style.css', '/script.js', '/favicon.ico'
    // For this single-file example, '/' might be enough if the HTML itself is cached.
    // However, if the HTML file has a specific name:
    // '/favicon-generator.html' (replace with your actual HTML file name)
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response; // Serve from cache
                }
                return fetch(event.request); // Fetch from network
            })
    );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
