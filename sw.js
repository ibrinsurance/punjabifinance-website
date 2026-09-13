// Punjabi Finance PWA Service Worker
const CACHE_NAME = 'pf-v1';

// Pages to cache for offline use
const STATIC_ASSETS = [
  '/index.html',
  '/watchlist.html',
  '/weekly-portfolio.html',
  '/philosophy.html',
  '/webinars.html',
  '/community.html',
  '/calculators.html',
  '/links.html',
  '/newsletter.html',
  '/mediakit.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fall back to cache
self.addEventListener('fetch', event => {
  // Skip non-GET and external requests (Google Fonts, Apps Script, Analytics)
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache fresh HTML pages
        if (response.ok && event.request.url.endsWith('.html')) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
