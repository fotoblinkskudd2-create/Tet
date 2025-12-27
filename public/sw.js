const CACHE_NAME = 'sykepriser-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/manifest.json',
    '/icon.png',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install event - cache alle nødvendige filer
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache åpnet');
                return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
            })
            .catch(err => {
                console.error('Cache install feil:', err);
            })
    );
    self.skipWaiting();
});

// Activate event - rydd opp gamle caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Sletter gammel cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve fra cache først, deretter nettverk
self.addEventListener('fetch', event => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin) &&
        !event.request.url.includes('supabase') &&
        !event.request.url.includes('jsdelivr')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - returner cached versjon
                if (response) {
                    return response;
                }

                // Klon request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(response => {
                    // Sjekk om vi fikk en gyldig response
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }

                    // Klon response
                    const responseToCache = response.clone();

                    // Cache nye requests (bare GET)
                    if (event.request.method === 'GET') {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }

                    return response;
                });
            })
            .catch(() => {
                // Hvis både cache og nettverk feiler, vis offline-side
                return new Response(
                    '<html><body><h1>Offline</h1><p>Du er offline. Prøv igjen når du har tilkobling.</p></body></html>',
                    {
                        headers: { 'Content-Type': 'text/html' }
                    }
                );
            })
    );
});
