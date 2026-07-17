self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((cacheNames) =>
          Promise.all(
            cacheNames
              .filter((cacheName) => cacheName.startsWith("ling-shell-"))
              .map((cacheName) => caches.delete(cacheName)),
          ),
        ),
      self.registration.unregister(),
    ]),
  );
});
