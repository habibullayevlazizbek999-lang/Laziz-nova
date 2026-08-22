const CACHE_NAME = "nova-mobile-v2"; // versiya oshirildi — eski keshni avtomatik tozalaydi
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting(); // yangi Service Worker darhol faollashadi
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // ochiq turgan sahifalarni ham darhol yangi versiyaga o'tkazadi
});

self.addEventListener("fetch", (event) => {
  // Faqat GET so'rovlarni keshlaymiz, Firebase/Telegram API so'rovlariga tegmaymiz
  if (event.request.method !== "GET") return;
  if (event.request.url.includes("firebaseio.com")) return;
  if (event.request.url.includes("api.telegram.org")) return;

  // TARMOQ-BIRINCHI: har doim internetdan eng yangi holatni olishga harakat qiladi.
  // Faqat internet ishlamasa (masalan offline), keshdagi eski nusxani ko'rsatadi.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
