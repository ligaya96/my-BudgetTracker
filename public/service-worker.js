const { response } = require("express");

//TO DO  offline 
const CACHE_NAME = "static-cache-v2";
const DATA_CACHE_NAME = "data-cache-v1";
const FILES_TO_CACHE = [
    "/",
  '/index.html',
  '/styles.css',
  '/DB.js',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/index.js'
];
// Installing Service worker
self.addEventListener("install", function(evt){
    evt.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
    );
    self.skipWaiting();
});
//Activate!
self.addEventListener("activate", function(evt){
    evt.waitUntil(
        caches.keys().then(keyList =>{
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME){
                        console.log("Remove old caches", key);
                        return caches.delete(key)
                    }
                })
            );
        })
    );
    self.clients.claim();
})
//Fetch
self.addEventListener("fetch", function(evt){
    if (evt.request.url.includes("/api")){
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request).then(response => {
                  if (response.status === 200) {
                    cache.put(evt.request.url, response.clone());
                  }
          
                  return response;
                })
                .catch(err => {
                  return cache.match(evt.request);
                });
              })
            );
        return;
    }
        
 evt.respondWith(
  caches.open(CACHE_NAME).then(cache => {
    return cache.match(evt.request).then(response => {
    return response || fetch(evt.request);
        });
      })
    );
 });