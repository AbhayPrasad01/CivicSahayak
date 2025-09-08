// Service Worker
const CACHE_NAME = 'civicsahayak-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/nav.css',
    '/css/components.css',
    '/css/animations.css',
    '/css/modernComponents.css',
    '/js/app.js',
    '/js/nav.js',
    '/assets/logo.svg',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
    'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event Strategy: Cache First, then Network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }

                // Clone the request since it can only be used once
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if response is valid
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone response since it can only be used once
                    const responseToCache = response.clone();

                    // Add new response to cache
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Background Sync for Offline Reports
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reports') {
        event.waitUntil(syncReports());
    }
});

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data.text(),
        icon: '/assets/icon-192x192.png',
        badge: '/assets/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Details',
                icon: '/assets/checkmark.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/xmark.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('CivicSahayak Update', options)
    );
});

// Handle Notification Click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/reports')
        );
    }
});
