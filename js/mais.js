const map = L.map('map').setView([52.2, 5.3], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

fetch('data/bedrijven.json')
  .then(res => {
    if (!res.ok) {
      throw new Error('JSON niet gevonden');
    }
    return res.json();
  })
  .then(bedrijven => {

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
    }
  })
  .catch(err => {
    console.error('Fout:', err);
  });