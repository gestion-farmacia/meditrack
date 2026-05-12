// Cambiamos el nombre del caché para que coincida con MediTrack
const CACHE_NAME = 'meditrack-v1'; 

const urlsToCache = [
  './',
  './index.html',
  './registro.html',
  './css/styles.css',
  './js/app.js',
  './manifest.json'
];

// Instalar el Service Worker y guardar los archivos en el caché de MediTrack
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caché de MediTrack abierto con éxito');
        return cache.addAll(urlsToCache);
      })
  );
});

// Estrategia de respuesta: Buscar en caché primero, si no hay, ir a internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Si el archivo está en el caché, lo devolvemos; si no, lo buscamos en la red
        return response || fetch(event.request);
      })
  );
});