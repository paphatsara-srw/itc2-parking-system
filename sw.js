// Service worker: โหลดจากเน็ตก่อน แล้วเก็บสำเนาไว้เปิดตอนออฟไลน์ (ไม่แตะการเชื่อมต่อ Firebase/ล็อกอิน)
const CACHE = 'parking-v2';
const CORE = ['./', './index.html', './styles.css', './app.js', './manifest.webmanifest', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
const SKIP = h => h.endsWith('googleapis.com') && !h.startsWith('fonts.') || h.endsWith('firebaseapp.com') || h.endsWith('firebaseio.com') || h === 'accounts.google.com' || h === 'apis.google.com';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const u = new URL(e.request.url);
  if (SKIP(u.hostname) || u.pathname.startsWith('/__/')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
