// Scripts/home/apimaps.js
(() => {
    const $ = (sel) => document.querySelector(sel);

    // Cache de geocoding en localStorage para no repetir consultas
    const CACHE_KEY = "geoCache";
    const loadCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; } };
    const saveCache = (c) => localStorage.setItem(CACHE_KEY, JSON.stringify(c));

    async function geocode(place) {
        if (!place) return null;
        const key = place.trim();
        const cache = loadCache();
        if (cache[key]) return cache[key];

        // Nominatim OSM – libre, ideal para el proyecto
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(key + ", Costa Rica")}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            if (Array.isArray(data) && data.length) {
                const pt = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                cache[key] = pt;
                saveCache(cache);
                return pt;
            }
        } catch (e) {
            console.warn("Geocode error:", e);
        }
        return null;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const mapEl = $("#map");
        const fromSel = $("#from");
        const toSel = $("#to");
        const form = document.querySelector(".filter-form");
        if (!mapEl) return;

        // Mapa base
        const map = L.map(mapEl);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "&copy; OpenStreetMap"
        }).addTo(map);

        let fromMarker = null, toMarker = null, linkLine = null;
        function clearShapes() {
            if (fromMarker) { map.removeLayer(fromMarker); fromMarker = null; }
            if (toMarker) { map.removeLayer(toMarker); toMarker = null; }
            if (linkLine) { map.removeLayer(linkLine); linkLine = null; }
        }

        async function drawForPlaces(fromName, toName) {
            if (!fromName || !toName) return;
            const [from, to] = await Promise.all([geocode(fromName), geocode(toName)]);
            if (!from || !to) return;

            clearShapes();
            fromMarker = L.marker([from.lat, from.lng]).addTo(map).bindPopup("From: " + fromName);
            toMarker = L.marker([to.lat, to.lng]).addTo(map).bindPopup("To: " + toName);

            const group = L.featureGroup([fromMarker, toMarker]);
            map.fitBounds(group.getBounds().pad(0.25));

            linkLine = L.polyline([[from.lat, from.lng], [to.lat, to.lng]], { weight: 3, opacity: 0.6 }).addTo(map);
        }

        async function updateFromSelects() {
            if (!fromSel || !toSel) return;
            await drawForPlaces(fromSel.value, toSel.value);
        }

        // Inicializa con selects actuales
        updateFromSelects().then(() => setTimeout(() => map.invalidateSize(), 200));

        // Eventos UI
        if (fromSel) fromSel.addEventListener("change", updateFromSelects);
        if (toSel) toSel.addEventListener("change", updateFromSelects);
        if (form) form.addEventListener("submit", (e) => { e.preventDefault(); updateFromSelects(); });

        // 🔥 Escucha clicks de filas (evento desde rides-table.js)
        document.addEventListener("draw-line", async (ev) => {
            const { fromName, toName } = ev.detail || {};
            await drawForPlaces(fromName, toName);

            // (Opcional) sincroniza selects si tienen esas opciones
            if (fromSel) fromSel.value = fromName;
            if (toSel) toSel.value = toName;
        });
    });
})();
