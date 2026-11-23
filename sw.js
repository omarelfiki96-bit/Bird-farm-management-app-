

const CACHE = 'bird-farm-v1-9';

const CORE_FILES = [
  './index.html',
  './manifest.webmanifest'
];

const OPTIONAL_FILES = [
  './',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);

    // الملفات الأساسية لازم تتحفظ بنجاح
    await cache.addAll(CORE_FILES);

    // الملفات الإضافية لا تمنع التثبيت لو فشل أحدها
    await Promise.all(
      OPTIONAL_FILES.map(file =>
        cache.add(file).catch(() => {})
      )
    );

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();

    await Promise.all(
      keys
        .filter(key => key.startsWith('bird-farm-') && key !== CACHE)
        .map(key => caches.delete(key))
    );

    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(event.request);

    if (cached) return cached;

    try {
      return await fetch(event.request);
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const offlinePage = await caches.match('./index.html');

        if (offlinePage) return offlinePage;
      }

      throw error;
    }
  })());
});
  

