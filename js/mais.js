console.log("main.js geladen");

const map = L.map('map').setView([52.2, 5.3], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

fetch('data/bedrijven.json')
  .then(res => {
    console.log("fetch response:", res.status, res.url);
    if (!res.ok) {
      throw new Error(`Kon bedrijven.json niet laden: ${res.status}`);
    }
    return res.json();
  })
  .then(bedrijven => {
    console.log("bedrijven geladen:", bedrijven);

    const markers = [];

    bedrijven.forEach(bedrijf => {
      const marker = L.marker([bedrijf.lat, bedrijf.lng])
        .addTo(map)
        .bindPopup(`
          <b>${bedrijf.naam}</b><br>
          ${bedrijf.plaats}<br>
          ${bedrijf.beschrijving}
        `);

      markers.push(marker);
    });

    if (markers.length > 0) {
      const groep = L.featureGroup(markers);
      map.fitBounds(groep.getBounds().pad(0.2));
    } else {
      console.warn("Geen markers gevonden in bedrijven.json");
    }
  })
  .catch(err => {
    console.error("Fout in main.js:", err);
  });