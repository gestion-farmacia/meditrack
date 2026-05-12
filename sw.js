const CACHE_NAME = 'censo-v1';
const assets = [
  '/',
  '/index.html',
  '/registro.html',
  '/css/styles.css',
  '/js/auth.js',
  '/js/app.js',
  '/manifest.json'
];

// Instalar el Service Worker y guardar los archivos en la memoria del cel
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

// Responder cuando no hay internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});