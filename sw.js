/* Sitzplaner – Offline-Unterstützung für die App auf dem Home-Bildschirm.
   Es wird nur das Programm selbst zwischengespeichert, niemals Schülerdaten
   (die liegen im Speicher des Browsers auf dem Gerät). */
const CACHE = "sitzplaner-v6";
const DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(DATEIEN)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
// Erst aus dem Netz (damit Updates ankommen), ohne Netz aus dem Zwischenspeicher
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  if(e.request.method!=="GET" || url.origin!==location.origin) return;   // Texterkennung usw. nicht anfassen
  e.respondWith(
    fetch(e.request).then(antwort=>{
      const kopie = antwort.clone();
      caches.open(CACHE).then(c=>c.put(e.request, kopie));
      return antwort;
    }).catch(()=>caches.match(e.request).then(r=>r || caches.match("index.html")))
  );
});
