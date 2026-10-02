// Offline support: app files cached on install (network first, so updates arrive); voice clips cached when first played.
const VERSION = 'soile-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'css/style.css', 'js/text.js', 'js/data.js', 'js/app.js', 'audio/manifest.js', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'soile-audio').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  if (url.pathname.endsWith('.mp3')) {
    e.respondWith(caches.open('soile-audio').then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
