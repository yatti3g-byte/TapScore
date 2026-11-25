// TapScore：一度開いたら、電波がなくてもアプリを開き直せるようにする（サーバー不要・GitHub Pagesのまま）
// ページは「まず通信、だめなら保存してある控え」。通信できるときは常に最新版が出る。
const CACHE='tapscore-v1';
const FILES=['./','./index.html','./help.html'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
// 同じ github.io を使うほかのアプリ（FormNoteなど）のキャッシュは消さない。TapScoreの古いものだけ
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('tapscore-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(
    fetch(req).then(res=>{
      if(res&&res.ok&&res.type==='basic'){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req,{ignoreSearch:true}).then(r=>r||caches.match('./index.html')))
  );
});
