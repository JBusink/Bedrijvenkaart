const showMapBtn = document.getElementById('showMapBtn');
const showInfoBtn = document.getElementById('showInfoBtn');
const kaartView = document.getElementById('kaartView');
const infoView = document.getElementById('infoView');

const typeFilter = document.getElementById('typeFilter');
const onderwerpFilter = document.getElementById('onderwerpFilter');
const resetButton = document.getElementById('resetFilters');
const sidepanel = document.getElementById('sidepanel');

const map = L.map('map').setView([52.2, 5.3], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let alleBedrijven = [];
const markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);

function toonKaartView() {
  if (!kaartView || !infoView || !showMapBtn || !showInfoBtn) {
    return;
  }

  kaartView.classList.remove('hidden-view');
  infoView.classList.add('hidden-view');

  showMapBtn.classList.add('active');
  showInfoBtn.classList.remove('active');

  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}

function toonInfoView() {
  if (!kaartView || !infoView || !showMapBtn || !showInfoBtn) {
    return;
  }

  kaartView.classList.add('hidden-view');
  infoView.classList.remove('hidden-view');

  showMapBtn.classList.remove('active');
  showInfoBtn.classList.add('active');
}

function toonStandaardPanel() {
  if (!sidepanel) {
    return;
  }

  sidepanel.innerHTML = `
    <div class="sidepanel-placeholder">
      <h2>Bedrijfsinformatie</h2>
      <p>Klik op een marker om uitgebreide informatie te bekijken.</p>
    </div>
  `;
}

function toonGeenResultatenPanel() {
  if (!sidepanel) {
    return;
  }

  sidepanel.innerHTML = `
    <div class="sidepanel-placeholder">
      <h2>Geen resultaten</h2>
      <p>Er zijn geen bedrijven die voldoen aan de gekozen filters.</p>
    </div>
  `;
}

function voldoetAanFilter(bedrijf) {
  const gekozenType = typeFilter ? typeFilter.value : 'alles';
  const gekozenOnderwerp = onderwerpFilter ? onderwerpFilter.value : 'alles';

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
  const naam = bedrijf.naam || 'Onbekend bedrijf';
  const plaats = bedrijf.plaats || 'Onbekende locatie';

  return `
    <div>
      <strong>${naam}</strong><br>
      ${plaats}
    </div>
  `;
}

function toonBedrijfInPanel(bedrijf) {
  if (!sidepanel) {
    return;
  }

  const naam = bedrijf.naam || 'Onbekend bedrijf';
  const plaats = bedrijf.plaats || 'Onbekende locatie';
  const type = bedrijf.type || 'Onbekend';
  const onderwerp = bedrijf.onderwerp || 'Onbekend';
  const beschrijving = bedrijf.beschrijving || 'Geen beschrijving beschikbaar.';
  const extraInfo = bedrijf.extraInfo || '';

  const emailHtml = bedrijf.email
    ? `<a href="mailto:${bedrijf.email}">📧 E-mail</a>`
    : '';

  const websiteHtml = bedrijf.website
    ? `<a href="${bedrijf.website}" target="_blank" rel="noopener noreferrer">🌐 Website</a>`
    : '';

  const extraInfoHtml = extraInfo
    ? `
      <div class="company-section">
        <h3>Extra informatie</h3>
        <p>${extraInfo}</p>
      </div>
    `
    : '';

  sidepanel.innerHTML = `
    <div class="company-header">
      <h2>${naam}</h2>
      <div class="company-subtitle">${plaats}</div>
    </div>

    <div class="company-meta">
      <div class="company-meta-item"><strong>Type:</strong> ${type}</div>
      <div class="company-meta-item"><strong>Onderwerp:</strong> ${onderwerp}</div>
    </div>

    <div class="company-section">
      <h3>Beschrijving</h3>
      <p>${beschrijving}</p>
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
    if (
      typeof bedrijf.lat !== 'number' ||
      typeof bedrijf.lng !== 'number'
    ) {
      return;
    }

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
  }
}

function updateKaart() {
  const gefilterd = alleBedrijven.filter(voldoetAanFilter);
  tekenMarkers(gefilterd);

  if (gefilterd.length > 0) {
    toonStandaardPanel();
  } else {
    toonGeenResultatenPanel();
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
    toonGeenResultatenPanel();
  });

if (typeFilter) {
  typeFilter.addEventListener('change', updateKaart);
}

if (onderwerpFilter) {
  onderwerpFilter.addEventListener('change', updateKaart);
}

if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (typeFilter) {
      typeFilter.value = 'alles';
    }
    if (onderwerpFilter) {
      onderwerpFilter.value = 'alles';
    }
    updateKaart();
  });
}

if (showMapBtn) {
  showMapBtn.addEventListener('click', toonKaartView);
}

if (showInfoBtn) {
  showInfoBtn.addEventListener('click', toonInfoView);
}

const darkToggle = document.getElementById('darkToggle');

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
  if (darkToggle) darkToggle.textContent = '☀️';
} else if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
  if (darkToggle) darkToggle.textContent = '🌙';
}

if (darkToggle) {
  darkToggle.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');

    if (isDark) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      darkToggle.textContent = '🌙';
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      darkToggle.textContent = '☀️';
    }
  });
}