export function registerServiceWorker(): void {
  if (!("serviceWorker" in navigator)) return;

  if (import.meta.env.PROD) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("ShramiGo PWA service worker registered:", registration.scope);
        })
        .catch((error) => {
          console.error("ShramiGo PWA service worker registration failed:", error);
        });
    });
  } else {
    // In development mode, unregister any active service worker and wipe caches
    // so Vite HMR and proxy changes take effect immediately on mobile
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });

    if ("caches" in window) {
      caches.keys().then((keys) => {
        for (const key of keys) {
          caches.delete(key);
        }
      });
    }
  }
}
