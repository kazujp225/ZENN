// Service Worker for Zenn Clone PWA
const CACHE_NAME = 'zenn-clone-v2';
const STATIC_CACHE = 'zenn-static-v2';
const DYNAMIC_CACHE = 'zenn-dynamic-v2';
const API_CACHE = 'zenn-api-v2';

const urlsToCache = [
  '/',
  '/articles',
  '/books',
  '/scraps',
  '/bookmarks',
  '/manifest.json',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Chrome extension requests
  if (event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the fetched response for future use
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Only cache HTML, CSS, JS, and image files
              const url = event.request.url;
              if (url.endsWith('.html') || 
                  url.endsWith('.css') || 
                  url.endsWith('.js') || 
                  url.endsWith('.json') ||
                  url.endsWith('.png') || 
                  url.endsWith('.jpg') || 
                  url.endsWith('.jpeg') || 
                  url.endsWith('.svg') ||
                  url.endsWith('.webp') ||
                  url.includes('/_next/') ||
                  !url.includes('.')) {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(() => {
          // Offline fallback
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-articles') {
    event.waitUntil(syncArticles());
  }
});

async function syncArticles() {
  // Implement sync logic when online
  console.log('Syncing articles...');
}