const showMapBtn = document.getElementById('showMapBtn');
const showInfoBtn = document.getElementById('showInfoBtn');
const kaartView = document.getElementById('kaartView');
const infoView = document.getElementById('infoView');

const map = L.map('map').setView([52.2, 5.3], 7);

function toonKaartView() {
  kaartView.classList.remove('hidden-view');
  infoView.classList.add('hidden-view');

  showMapBtn.classList.add('active');
  showInfoBtn.classList.remove('active');

  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

function toonInfoView() {
  kaartView.classList.add('hidden-view');
  infoView.classList.remove('hidden-view');

  showMapBtn.classList.remove('active');
  showInfoBtn.classList.add('active');
}

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const typeFilter = document.getElementById('typeFilter');
const onderwerpFilter = document.getElementById('onderwerpFilter');
const resetButton = document.getElementById('resetFilters');
const sidepanel = document.getElementById('sidepanel');

let alleBedrijven = [];
let markerCluster = L.markerClusterGroup();

map.addLayer(markerCluster);

function voldoetAanFilter(bedrijf) {
  const gekozenType = typeFilter.value;
  const gekozenOnderwerp = onderwerpFilter.value;

  const typeOk = gekozenType === 'alles' || bedrijf.type === gekozenType;
  const onderwerpOk =
    gekozenOnderwerp === 'alles' || bedrijf.onderwerp === gekozenOnderwerp;

  return typeOk && onderwerpOk;
}

function kleurVoorOnderwerp(onderwerp) {
  const kleuren = {
    'high-tech systemen': '#1d4ed8',
    'mechatronica': '#7c3aed',
    'optica/fotonica': '#0f766e',
    'materialen': '#b45309',
    'energie': '#16a34a',
    'medische technologie': '#dc2626',
    'data/modelleren': '#0891b2',
    'metingen en sensoren': '#ea580c'
  };

  return kleuren[onderwerp] || '#475569';
}

function iconVoorOnderwerp(onderwerp) {
  const kleur = kleurVoorOnderwerp(onderwerp);

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: ${kleur};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.28);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function maakPopupHtml(bedrijf) {
  return `
    <div>
      <strong>${bedrijf.naam}</strong><br>
      ${bedrijf.plaats}
    </div>
  `;
}

function toonBedrijfInPanel(bedrijf) {
  const emailHtml = bedrijf.email
    ? `<a href="mailto:${bedrijf.email}">📧 E-mail</a>`
    : '';

  const websiteHtml = bedrijf.website
    ? `<a href="${bedrijf.website}" target="_blank" rel="noopener noreferrer">🌐 Website</a>`
    : '';

  const extraInfoHtml = bedrijf.extraInfo
    ? `
      <div class="company-section">
        <h3>Extra informatie</h3>
        <p>${bedrijf.extraInfo}</p>
      </div>
    `
    : '';

  sidepanel.innerHTML = `
    <div class="company-header">
      <h2>${bedrijf.naam}</h2>
      <div class="company-subtitle">${bedrijf.plaats}</div>
    </div>

    <div class="company-meta">
      <div class="company-meta-item"><strong>Type:</strong> ${bedrijf.type}</div>
      <div class="company-meta-item"><strong>Onderwerp:</strong> ${bedrijf.onderwerp}</div>
    </div>

    <div class="company-section">
      <h3>Beschrijving</h3>
      <p>${bedrijf.beschrijving || 'Geen beschrijving beschikbaar.'}</p>
    </div>

    ${extraInfoHtml}

    <div class="company-section">
      <h3>Links en contact</h3>
      <div class="company-links">
        ${emailHtml}
        ${websiteHtml}
      </div>
    </div>
  `;
}

function tekenMarkers(bedrijven) {
  markerCluster.clearLayers();

  const markers = [];

  bedrijven.forEach((bedrijf) => {
    const marker = L.marker(
      [bedrijf.lat, bedrijf.lng],
      { icon: iconVoorOnderwerp(bedrijf.onderwerp) }
    )
      .bindPopup(maakPopupHtml(bedrijf))
      .on('click', () => {
        toonBedrijfInPanel(bedrijf);
      });

    markers.push(marker);
    markerCluster.addLayer(marker);
  });

  if (markers.length > 0) {
    const groep = L.featureGroup(markers);
    map.fitBounds(groep.getBounds().pad(0.2));
  } else {
    map.setView([52.2, 5.3], 7);
    sidepanel.innerHTML = `
      <div class="sidepanel-placeholder">
        <h2>Geen resultaten</h2>
        <p>Er zijn geen bedrijven die voldoen aan de gekozen filters.</p>
      </div>
    `;
  }
}

function updateKaart() {
  const gefilterd = alleBedrijven.filter(voldoetAanFilter);
  tekenMarkers(gefilterd);

  if (gefilterd.length > 0) {
    sidepanel.innerHTML = `
      <div class="sidepanel-placeholder">
        <h2>Bedrijfsinformatie</h2>
        <p>Klik op een marker om uitgebreide informatie te bekijken.</p>
      </div>
    `;
  }
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

showMapBtn.addEventListener('click', toonKaartView);
showInfoBtn.addEventListener('click', toonInfoView);