const map = L.map('map').setView([52.2, 5.3], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const typeFilter = document.getElementById('typeFilter');
const onderwerpFilter = document.getElementById('onderwerpFilter');
const resetButton = document.getElementById('resetFilters');

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

function maakPopupHtml(bedrijf) {
  const emailHtml = bedrijf.email
    ? `<a href="mailto:${bedrijf.email}">E-mail contact</a>`
    : '';

  const websiteHtml = bedrijf.website
    ? `<a href="${bedrijf.website}" target="_blank" rel="noopener noreferrer">Website</a>`
    : '';

  return `
    <div class="popup-content">
      <h3>${bedrijf.naam}</h3>
      <div class="popup-meta"><strong>Plaats:</strong> ${bedrijf.plaats}</div>
      <div class="popup-meta"><strong>Type:</strong> ${bedrijf.type}</div>
      <div class="popup-meta"><strong>Onderwerp:</strong> ${bedrijf.onderwerp}</div>
      <div class="popup-meta">${bedrijf.beschrijving}</div>
      <div class="popup-links">
        ${emailHtml}
        ${websiteHtml}
      </div>
    </div>
  `;
}

function tekenMarkers(bedrijven) {
  markerLayer.clearLayers();

  const markers = [];

  bedrijven.forEach((bedrijf) => {
    const marker = L.marker([bedrijf.lat, bedrijf.lng])
      .bindPopup(maakPopupHtml(bedrijf));

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

resetButton.addEventListener('click', () => {
  typeFilter.value = 'alles';
  onderwerpFilter.value = 'alles';
  updateKaart();
});