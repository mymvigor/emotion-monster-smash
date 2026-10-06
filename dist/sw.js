const CACHE = "monster-smash-v2-20261006-3";
const ASSETS = ["./","./index.html","./styles-v2.css?v=2.0.3","./app-v2.js?v=2.0.3","./monster-brain-v2.js","./db.js","./manifest.webmanifest","./icons/icon.svg","./icons/icon-192.png","./icons/icon-512.png","./icons/apple-touch-icon.png"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch", event => {
  if(event.request.method!=="GET")return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok && new URL(event.request.url).origin===location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
    return response;
  }).catch(()=>caches.match("./index.html"))));
});
