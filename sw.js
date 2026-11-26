const CACHE="coupon-v1";
const FILES=[
  "./", "./index.html", "./manifest.webmanifest",
  "./fonts/pretendard-sub.woff2", "./fonts/tf02.woff2", "./fonts/tf07.woff2", "./fonts/tf09.woff2",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png", "./icons/favicon-32.png"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener("fetch",event=>{
  const {request}=event;
  if(request.method!=="GET"||new URL(request.url).origin!==self.location.origin)return;
  const response=fetch(request);
  event.waitUntil(response.then(result=>{
    if(result.ok){
      const copy=result.clone();
      return caches.open(CACHE).then(cache=>cache.put(request,copy));
    }
  }).catch(()=>{}));
  event.respondWith(response.catch(async error=>{
    const cache=await caches.open(CACHE);
    const cached=await cache.match(request);
    if(cached)return cached;
    throw error;
  }));
});
