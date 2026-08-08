/* Service worker — offline app shell for 15 Minutes Later.
 * Bump CACHE on every deploy so a new version replaces the cached shell. */
const CACHE = "fml-2026-08-08c";
const CORE = [
  "./",
  "./index.html",
  "./app.js",
  "./concepts.js",
  "./styles.css",
  "./og.png",
  "./icon-192.png",
  "./icon-512.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((hit) => {
      if (hit) return hit;
      return fetch(request)
        .then((response) => {
          const url = new URL(request.url);
          const cacheable =
            url.origin === self.location.origin || url.host.indexOf("fonts.g") !== -1;
          if (cacheable && (response.ok || response.type === "opaque")) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match("./index.html", { ignoreSearch: true }));
    }),
  );
});
