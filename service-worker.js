const CACHE_NAME = "nippo-app-v2";

const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json"
];


// ==============================
// インストール
// ==============================

self.addEventListener("install", (event) => {

    event.waitUntil(

        caches.open(CACHE_NAME)
        .then((cache) => {

            return cache.addAll(urlsToCache);

        })

    );

    // 新しいService Workerをすぐ有効化
    self.skipWaiting();

});


// ==============================
// 古いキャッシュ削除
// ==============================

self.addEventListener("activate", (event) => {

    event.waitUntil(

        caches.keys()
        .then((cacheNames) => {

            return Promise.all(

                cacheNames
                .filter((cacheName) => {

                    return cacheName !== CACHE_NAME;

                })
                .map((cacheName) => {

                    return caches.delete(cacheName);

                })

            );

        })

    );

    // 開いているページにもすぐ適用
    self.clients.claim();

});


// ==============================
// ファイル読み込み
// ==============================

self.addEventListener("fetch", (event) => {

    event.respondWith(

        fetch(event.request)
        .then((response) => {

            return response;

        })
        .catch(() => {

            return caches.match(event.request);

        })

    );

});