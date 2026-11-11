"use strict";

/* ==========================================
   MOBILEMAX - PROGRESSIVE WEB APP
   Root-scope Service Worker
   Safe caching for public pages and assets
========================================== */

const CACHE_NAME = "mobilemax-v10";

/* ==========================================
   APPLICATION SCOPE
========================================== */

const APP_SCOPE = new URL(self.registration.scope);

const HOME_URL = new URL("./", APP_SCOPE);

const MANIFEST_URL = new URL(
    "assets/js/manifest.json",
    APP_SCOPE
);

const EXCLUDED_PATHS = [
    new URL("ajax/", APP_SCOPE).pathname,
    new URL("admin/", APP_SCOPE).pathname
];

const EXCLUDED_PHP =
    /\/(?:checkout|access|cart|cart_action|login|logout|account|profile|order|orders|payment)(?:\.php)?\/?$/i;

const STATIC_ASSETS =
    /\.(?:css|js|png|jpe?g|webp|gif|svg|ico|woff2?|ttf)$/i;

/* ==========================================
   HELPERS
========================================== */

function isAppUrl(url) {
    return (
        url.origin === APP_SCOPE.origin &&
        url.pathname.startsWith(APP_SCOPE.pathname)
    );
}

function isExcluded(url) {
    if (
        EXCLUDED_PATHS.some(path =>
            url.pathname.startsWith(path)
        )
    ) {
        return true;
    }

    const relativePath =
        url.pathname.slice(APP_SCOPE.pathname.length);

    return EXCLUDED_PHP.test("/" + relativePath);
}

function isValidResponse(response) {
    return (
        response &&
        response.ok &&
        response.type === "basic" &&
        !response.redirected
    );
}

async function saveToCache(cacheName, request, response) {
    if (!isValidResponse(response)) return;

    try {
        const cache = await caches.open(cacheName);

        await cache.put(
            request,
            response.clone()
        );
    } catch (error) {
        console.warn(
            "MOBILEMAX: Cache storage failed.",
            error
        );
    }
}

/* ==========================================
   INSTALL
========================================== */

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        try {
            const response = await fetch(HOME_URL.href, {
                method: "GET",
                cache: "no-store",
                credentials: "same-origin"
            });

            const contentType =
                response.headers.get("content-type") || "";

            if (
                isValidResponse(response) &&
                contentType.includes("text/html")
            ) {
                await saveToCache(
                    CACHE_NAME,
                    HOME_URL.href,
                    response
                );
            }
        } catch (error) {
            console.warn(
                "MOBILEMAX: Initial homepage caching skipped.",
                error
            );
        }

        await self.skipWaiting();
    })());
});

/* ==========================================
   ACTIVATE
========================================== */

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const cacheKeys = await caches.keys();

        await Promise.all(
            cacheKeys
                .filter(key =>
                    key.startsWith("mobilemax-") &&
                    key !== CACHE_NAME
                )
                .map(key => caches.delete(key))
        );

        await self.clients.claim();

        console.log(
            "MOBILEMAX PWA activated:",
            CACHE_NAME,
            APP_SCOPE.href
        );
    })());
});

/* ==========================================
   FETCH
========================================== */

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    if (!isAppUrl(url)) return;

    if (isExcluded(url)) return;

    /* NAVIGATION - NETWORK FIRST */

    if (request.mode === "navigate") {
        event.respondWith((async () => {
            try {
                const response = await fetch(request);

                const isHomepage =
                    url.pathname === HOME_URL.pathname &&
                    !url.search;

                const contentType =
                    response.headers.get("content-type") || "";

                if (
                    isHomepage &&
                    contentType.includes("text/html")
                ) {
                    await saveToCache(
                        CACHE_NAME,
                        request,
                        response
                    );
                }

                return response;

            } catch (error) {
                console.warn(
                    "MOBILEMAX: Navigation network unavailable.",
                    error
                );

                const cache = await caches.open(CACHE_NAME);

                const cached = await cache.match(HOME_URL.href);

                if (cached) return cached;

                return new Response(
                    "أنت غير متصل بالإنترنت. حاول مرة أخرى عند عودة الاتصال.",
                    {
                        status: 503,
                        headers: {
                            "Content-Type":
                                "text/plain; charset=utf-8",
                            "Cache-Control": "no-store"
                        }
                    }
                );
            }
        })());

        return;
    }

    /* STATIC ASSETS - CACHE FIRST */

    const isStaticAsset =
        STATIC_ASSETS.test(url.pathname) ||
        url.pathname === MANIFEST_URL.pathname;

    if (!isStaticAsset) return;

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_NAME);

        try {
            const cached = await cache.match(request);

            if (cached) return cached;

            const response = await fetch(request);

            if (isValidResponse(response)) {
                await saveToCache(
                    CACHE_NAME,
                    request,
                    response
                );
            }

            return response;

        } catch (error) {
            console.warn(
                "MOBILEMAX: Static asset unavailable.",
                url.pathname
            );

            const cached = await cache.match(request);

            if (cached) return cached;

            return new Response(
                "الملف غير متاح دون اتصال بالإنترنت.",
                {
                    status: 503,
                    headers: {
                        "Content-Type":
                            "text/plain; charset=utf-8",
                        "Cache-Control": "no-store"
                    }
                }
            );
        }
    })());
});

console.log(
    "MOBILEMAX: Service Worker loaded.",
    APP_SCOPE.href
);
