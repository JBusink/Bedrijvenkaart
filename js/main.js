const map = L.map('map').setView([52.2, 5.3], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const typeFilter = document.getElementById('typeFilter');
const onderwerpFilter = document.getElementById('onderwerpFilter');

let alleBedrijven = [];
let markerLayer = L.layerGroup().addTo(map);

function voldoetAanFilter(bedrijf) {
  const gekozenType = typeFilter.value;
  const gekozenOnderwerp = onderwerpFilter.value;

  const typeOk = gekozenType === 'alles' || bedrijf.type === gekozenType;
  const onderwerpOk =
    gekozenOnderwerp === 'alles' || bedrijf.onderwerp === gekozenOnderwerp;

  return typeOk && onderwerpOk;
}

function tekenMarkers(bedrijven) {
  markerLayer.clearLayers();

  const markers = [];

  bedrijven.forEach((bedrijf) => {
    const marker = L.marker([bedrijf.lat, bedrijf.lng]).bindPopup(`
      <b>${bedrijf.naam}</b><br>
      ${bedrijf.plaats}<br>
      <b>Type:</b> ${bedrijf.type}<br>
      <b>Onderwerp:</b> ${bedrijf.onderwerp}<br>
      ${bedrijf.beschrijving}
    `);

    marker.addTo(markerLayer);
    markers.push(marker);
  });

  if (markers.length > 0) {
    const groep = L.featureGroup(markers);
    map.fitBounds(groep.getBounds().pad(0.2));
  } else {
    map.setView([52.2, 5.3], 7);
  }
}

function updateKaart() {
  const gefilterd = alleBedrijven.filter(voldoetAanFilter);
  tekenMarkers(gefilterd);
}

fetch('data/bedrijven.json')
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Kon bedrijven.json niet laden: ${res.status}`);
    }
    return res.json();
  })
  .then((bedrijven) => {
    alleBedrijven = bedrijven;
    updateKaart();
  })
  .catch((err) => {
    console.error('Fout bij laden van bedrijven:', err);
  });

typeFilter.addEventListener('change', updateKaart);
onderwerpFilter.addEventListener('change', updateKaart);