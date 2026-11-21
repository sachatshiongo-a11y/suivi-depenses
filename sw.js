// Rend l'application utilisable sans connexion.
const CACHE = 'depenses-v1';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png'])));
  self.skipWaiting();
});
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const enCache = await c.match(e.request, { ignoreSearch: true });
    const reseau = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; });
    // La page elle-même : la version en ligne d'abord, pour voir les mises à jour tout de suite.
    // Si le réseau ne répond pas en 3 secondes, on ouvre la copie de l'appareil.
    if (e.request.mode === 'navigate' && enCache) return Promise.race([reseau, new Promise(r => setTimeout(() => r(enCache), 3000))]).catch(() => enCache);
    return enCache || reseau;
  }));
});
