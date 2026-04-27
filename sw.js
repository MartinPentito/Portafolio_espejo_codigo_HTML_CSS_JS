// ─── Service Worker — Portfolio PWA ────────────────────────────────────────
const CACHE_NAME = 'mp-portfolio-v1';

const PRECACHE_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/script.js',
    './data/data.json',
    './assets/ThisJipi_img.png',
    './assets/ThisJipi_img_backgroundoff.png',
    './assets/Pentito Martín.pdf',
    './assets/Certificados.pdf',
    './manifest.json'
];

// ── Instalación: precachear activos del shell ──
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
    );
    self.skipWaiting();
});

// ── Activación: eliminar cachés obsoletas ──
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

// ── Fetch: estrategia por tipo de recurso ──
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // GitHub API → network-first con fallback al último response cacheado
    if (url.hostname === 'api.github.com') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open('mp-api-v1').then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // CDN externo (Boxicons) → siempre red, sin cachear
    if (url.origin !== self.location.origin) {
        event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
        return;
    }

    // data.json → network-first: siempre intenta actualizar, cae a caché si sin conexión
    if (url.pathname.endsWith('data.json')) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Activos locales (HTML, CSS, JS, imágenes) → cache-first
    event.respondWith(
        caches.match(event.request).then(
            (cached) => cached || fetch(event.request).then((response) => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
        )
    );
});
