const CACHE_NAME='polski-pilkarz-classic-1.45';
const APP_SHELL=[
  './index.html','./pilkarz.webmanifest','./polska-kariera.css','./04-nss-turnieje-ui.css',
  './01-nss-dane-reprezentacji.js','./01a-nss-szanse-reprezentacji.js','./02-nss-silnik-meczowy.js','./03-nss-turnieje.js',
  './06-nss-kontroler-ui.js','./07-adapter-polska-kariera.js','./08-polska-kariera-dane-klubow.js',
  './08a-club-country-colours.js','./09a-polska-kariera-imiona-zawodnikow.js',
  './09-polska-kariera-decyzje.js','./09b-polska-kariera-naturalizacja.js','./10-polska-kariera-core.js',
  './pilkarz-icons/icon-192.png','./pilkarz-icons/icon-512.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('polski-pilkarz-classic-')&&key!==CACHE_NAME).map(key=>caches.delete(key))
  )));
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const requestUrl=new URL(event.request.url);
  if(event.request.method!=='GET'||requestUrl.origin!==self.location.origin) return;
  if(requestUrl.searchParams.has('pps-update-check')||requestUrl.searchParams.has('pps-update')){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(response&&response.ok){
      const copy=response.clone();
      caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
    }
    return response;
  }).catch(()=>event.request.mode==='navigate'?caches.match('./index.html'):undefined)));
});
