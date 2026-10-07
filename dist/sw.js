const CACHE="monster-smash-v41-20261007-1";
const CORE=[
  "./","./index.html","./styles-v41.css?v=4.1.0","./styles-v4.css?v=4.0.0","./styles-v2.css?v=3.0.2","./app-v4.js?v=4.1.0",
  "./monster-brain-v3.js","./audio-manager.js","./pixel-fx.js","./db.js",
  "./v4/utils.js","./v4/semantic-matcher.js","./v4/mutation-engine.js","./v4/arena-generator.js",
  "./v4/story-director.js","./v4/local-director.js","./v4/ai-director-adapter.js","./v4/monster-library.js",
  "./v4/encounter-director.js","./v4/combat-engine.js","./v4/dialogue-director.js","./v4/monster-renderer.js","./v4/attract-mode.js","./v4/weapon-director.js","./v4/camera-director.js",
  "./manifest.webmanifest","./icons/icon.svg","./icons/icon-192.png",
  "./icons/icon-512.png","./icons/apple-touch-icon.png"
];
const numbered=(folder,prefix,count)=>Array.from({length:count},(_,i)=>`./assets/audio/${folder}/${prefix}_${String(i+1).padStart(2,"0")}.wav`);
const AUDIO=[
  ...numbered("music","menu",2),...numbered("music","battle",2),
  ...numbered("music","boss",2),"./assets/audio/music/victory_01.wav",
  ...numbered("ui","ui",2),...numbered("hits","light",5),
  ...numbered("heavy_hits","heavy",4),...numbered("slaps","slap",4),
  ...numbered("launch","launch",3),...numbered("impact","wall",3),
  ...numbered("combo","combo",3),...numbered("critical","critical",3),
  ...numbered("finishers","finish",6),...numbered("monster","monster",4),
  ...numbered("ambient","ambient",2)
];
self.addEventListener("install",event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll([...CORE,...AUDIO])).then(()=>self.skipWaiting())
));
self.addEventListener("activate",event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  if(event.request.mode==="navigate"){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok)caches.open(CACHE).then(cache=>cache.put("./index.html",response.clone()));return response}).catch(()=>caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response.ok&&new URL(event.request.url).origin===location.origin)caches.open(CACHE).then(cache=>cache.put(event.request,response.clone()));
    return response;
  }).catch(()=>Response.error())));
});
