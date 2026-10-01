// Offline support for the website version (not used inside the Windows / iOS shells).
// App files are cached on install; voice clips are cached the first time they play.
const VERSION = 'kq-v1';
const SHELL = [
  './', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/base.css', 'css/app.css',
  'js/data.js', 'js/native.js', 'js/app.js', 'audio/manifest.js',
  'fonts/nunito-cyrillic-ext.woff2', 'fonts/nunito-cyrillic.woff2', 'fonts/nunito-latin-ext.woff2', 'fonts/nunito-latin.woff2', 'fonts/flags.woff2',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== 'kq-audio').map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // voice clips never change for a given file name → cache first
  if (url.pathname.endsWith('.mp3')) {
    e.respondWith(caches.open('kq-audio').then(async c => {
      const hit = await c.match(e.request);
      if (hit) return hit;
      const res = await fetch(e.request);
      if (res.ok) c.put(e.request, res.clone());
      return res;
    }));
    return;
  }
  // app files: network first so updates arrive, cache when offline
  e.respondWith(fetch(e.request).then(res => {
    if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
