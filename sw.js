// Service worker: network-first + แคชไว้เปิดออฟไลน์ (ข้ามการเชื่อมต่อ Firestore/Firebase เพื่อไม่รบกวนการซิงก์สด)
const CACHE = 'itc2-parking-v12';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const h = new URL(e.request.url).hostname;
  if (h === 'firestore.googleapis.com' || h.endsWith('.firebaseio.com') || h.endsWith('.firebaseapp.com')) return;   // ปล่อยให้ Firebase จัดการเอง
  e.respondWith(
    fetch(e.request).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
