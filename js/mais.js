// Kaart initialiseren (Nederland)
const map = L.map('map').setView([52.2, 5.3], 7);

// Kaartlaag (OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

// Test marker
L.marker([52.37, 4.90])
  .addTo(map)
  .bindPopup("Amsterdam")
  .openPopup();