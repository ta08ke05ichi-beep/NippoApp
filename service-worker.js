const CACHE_NAME = "nippo-app-v1";


const urlsToCache = [

    "./",

    "./index.html",

    "./manifest.json"

];



// インストール

self.addEventListener(
"install",
(event)=>{

    event.waitUntil(

        caches.open(CACHE_NAME)

        .then((cache)=>{

            return cache.addAll(urlsToCache);

        })

    );

});



// 起動時の読み込み

self.addEventListener(
"fetch",
(event)=>{

    event.respondWith(

        caches.match(event.request)

        .then((response)=>{

            return response || fetch(event.request);

        })

    );

});