const C='cal-v3',A=['./','index.html','style.css','app.js','manifest.json','icons/icon-192.png','icons/icon-512.png',...'january february march april may june july august september october november december'.split(' ').map(m=>'img/'+m+'.webp')];
self.onInstall=0;addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C).map(x=>caches.delete(x))))));
addEventListener('fetch',e=>{if(e.request.method=='GET')e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))});
