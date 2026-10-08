// Service Worker do App do Entregador — OS-PREMIUM
// Mantém o app instalável e o shell funcionando offline.
// IMPORTANTE: dados ao vivo (Firebase, mapa, geocoding) NUNCA passam por cache.

const CACHE = 'os-entregador-v1';
const SHELL = ['./', './index.html', './manifest.json', './icon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Tudo que NÃO é do nosso domínio (Firebase, OpenStreetMap, Nominatim):
  // sempre rede, sem cache — posição de GPS não pode ser cacheada.
  if (url.origin !== location.origin) return;

  // Navegação (abrir o app): rede primeiro; se offline, usa o shell em cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const copia = r.clone();
          caches.open(CACHE).then(c => c.put('./index.html', copia));
          return r;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Arquivos do shell (manifest, ícone): cache primeiro, rede como reserva.
  e.respondWith(
    caches.match(e.request).then(hit =>
      hit || fetch(e.request).then(r => {
        const copia = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia));
        return r;
      })
    )
  );
});
