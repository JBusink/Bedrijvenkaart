const showMapBtn = document.getElementById('showMapBtn');
const showInfoBtn = document.getElementById('showInfoBtn');
const kaartView = document.getElementById('kaartView');
const infoView = document.getElementById('infoView');

const typeFilter = document.getElementById('typeFilter');
const tagFilter = document.getElementById('tagFilter');
const resetButton = document.getElementById('resetFilters');
const sidepanel = document.getElementById('sidepanel');
const darkToggle = document.getElementById('darkToggle');

const map = L.map('map').setView([52.2, 5.3], 7);

/* =========================
   KAARTLAGEN LIGHT / DARK
   ========================= */

const lightTiles = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }
);

const darkTiles = L.tileLayer(
  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  {
    maxZoom: 19,
    subdomains: 'abcd',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  }
);

lightTiles.addTo(map);

/* =========================
   DATA / MARKERS
   ========================= */

let alleBedrijven = [];
const markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);

/* =========================
   HELPERS
   ========================= */

function asArray(value) {
  if (Array.isArray(value)) {
    return value;
  }
  if (value === null || value === undefined || value === '') {
    return [];
  }
  return [value];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/* =========================
   VIEW LOGICA
   ========================= */

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

/* =========================
   SIDEPANEL
   ========================= */

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

function toonBedrijfInPanel(bedrijf) {
  if (!sidepanel) {
    return;
  }

  const naam = escapeHtml(bedrijf.naam || 'Onbekende organisatie');
  const plaats = escapeHtml(bedrijf.plaats || 'Onbekende locatie');
  const types = asArray(bedrijf.type);
  const tags = asArray(bedrijf.tags);

  const typeTekst = types.length > 0
    ? types.map(escapeHtml).join(', ')
    : 'Onbekend';

  const tagsTekst = tags.length > 0
    ? tags.map(escapeHtml).join(', ')
    : 'Geen tags';

  const beschrijving = escapeHtml(
    bedrijf.beschrijving || 'Geen beschrijving beschikbaar.'
  );

  const extraInfo = bedrijf.extraInfo
    ? escapeHtml(bedrijf.extraInfo)
    : '';

  const emailHtml = bedrijf.email
    ? `<a href="mailto:${bedrijf.email}">📧 E-mail</a>`
    : '';

  const websiteHtml = bedrijf.website
    ? `<a href="${escapeHtml(bedrijf.website)}" target="_blank" rel="noopener noreferrer">🌐 Website</a>`
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
      <div class="company-meta-item"><strong>Type:</strong> ${typeTekst}</div>
      <div class="company-meta-item"><strong>Tags:</strong> ${tagsTekst}</div>
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

/* =========================
   FILTERS / CATEGORIEËN
   ========================= */

function voldoetAanFilter(bedrijf) {
  const gekozenType = typeFilter ? typeFilter.value : 'alles';
  const actieveTags = geselecteerdeTags();

  const types = asArray(bedrijf.type);
  const tags = asArray(bedrijf.tags);

  const typeOk = gekozenType === 'alles' || types.includes(gekozenType);

  const tagsOk =
    actieveTags.length === 0 ||
    actieveTags.some((tag) => tags.includes(tag));

  return typeOk && tagsOk;
}

function kleurVoorCategorie() {
  return '#475569';
}

function borderVoorMarker() { return document.body.classList.contains('dark-mode') ? '#0f172a' : '#ffffff'; }

function iconVoorBedrijf(bedrijf) {
  const isDark = document.body.classList.contains('dark-mode');

  const kleur = isDark ? '#e5e7eb' : '#0f172a';   // licht in dark, zwart in light
  const borderKleur = isDark ? '#020617' : '#ffffff';

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: ${kleur};
        border: 3px solid ${borderKleur};
        box-shadow: 0 2px 8px rgba(0,0,0,0.28);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

/* =========================
   FILTEROPTIES OPBOUWEN
   ========================= */

function vulTypeFilterOpties(bedrijven) {
  if (!typeFilter) {
    return;
  }

  const huidigeWaarde = typeFilter.value || 'alles';

  const uniekeTypes = [...new Set(
    bedrijven.flatMap((bedrijf) => asArray(bedrijf.type))
  )]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'nl'));

  typeFilter.innerHTML = '<option value="alles">Alle types</option>';

  uniekeTypes.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    typeFilter.appendChild(option);
  });

  if ([...typeFilter.options].some((opt) => opt.value === huidigeWaarde)) {
    typeFilter.value = huidigeWaarde;
  } else {
    typeFilter.value = 'alles';
  }
}

function vulTagFilterOpties(bedrijven) {
  if (!tagFilter) {
    return;
  }

  const uniekeTags = [...new Set(
    bedrijven.flatMap((bedrijf) => asArray(bedrijf.tags))
  )]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'nl'));

  tagFilter.innerHTML = uniekeTags.map((tag, index) => `
    <label class="tag-filter-option" for="tag-${index}">
      <input
        type="checkbox"
        id="tag-${index}"
        value="${escapeHtml(tag)}"
      >
      <span>${escapeHtml(tag)}</span>
    </label>
  `).join('');

  tagFilter
    .querySelectorAll('input[type="checkbox"]')
    .forEach((checkbox) => {
      checkbox.addEventListener('change', updateKaart);
    });
}

/* =========================
   POPUP / MARKERS
   ========================= */

function maakPopupHtml(bedrijf) {
  const naam = escapeHtml(bedrijf.naam || 'Onbekende organisatie');
  const plaats = escapeHtml(bedrijf.plaats || 'Onbekende locatie');
  const types = asArray(bedrijf.type);
  const typeTekst = types.length > 0 ? escapeHtml(types.join(', ')) : 'Onbekend';

  return `
    <div>
      <strong>${naam}</strong><br>
      ${plaats}<br>
      <small>${typeTekst}</small>
    </div>
  `;
}

function tekenMarkers(bedrijven) {
  markerCluster.clearLayers();

  const markers = [];

  bedrijven.forEach((bedrijf) => {
    if (typeof bedrijf.lat !== 'number' || typeof bedrijf.lng !== 'number') {
      return;
    }

    const marker = L.marker(
      [bedrijf.lat, bedrijf.lng],
      { icon: iconVoorBedrijf(bedrijf) }
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

function geselecteerdeTags() {
  if (!tagFilter) {
    return [];
  }

  return [...tagFilter.querySelectorAll('input[type="checkbox"]:checked')]
    .map((checkbox) => checkbox.value);
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

/* =========================
   DARK MODE MAP THEME
   ========================= */

function updateMapTheme() {
  const isDark = document.body.classList.contains('dark-mode');

  if (isDark) {
    if (map.hasLayer(lightTiles)) {
      map.removeLayer(lightTiles);
    }
    if (!map.hasLayer(darkTiles)) {
      darkTiles.addTo(map);
    }
  } else {
    if (map.hasLayer(darkTiles)) {
      map.removeLayer(darkTiles);
    }
    if (!map.hasLayer(lightTiles)) {
      lightTiles.addTo(map);
    }
  }

  if (alleBedrijven.length > 0) {
    const gefilterd = alleBedrijven.filter(voldoetAanFilter);
    tekenMarkers(gefilterd);
  }
}

/* =========================
   DATA LADEN
   ========================= */

fetch('data/bedrijven.json')
  .then((res) => {
    if (!res.ok) {
      throw new Error(`Kon bedrijven.json niet laden: ${res.status}`);
    }
    return res.json();
  })
  .then((bedrijven) => {
    alleBedrijven = bedrijven;

    vulTypeFilterOpties(alleBedrijven);
    vulTagFilterOpties(alleBedrijven);

    updateKaart();
    updateMapTheme();
  })
  .catch((err) => {
    console.error('Fout bij laden van bedrijven:', err);
    toonGeenResultatenPanel();
  });

/* =========================
   EVENT LISTENERS FILTERS
   ========================= */

if (typeFilter) {
  typeFilter.addEventListener('change', updateKaart);
}

if (tagFilter) {
  tagFilter.addEventListener('change', updateKaart);
}

if (resetButton) {
  resetButton.addEventListener('click', () => {
    if (typeFilter) {
      typeFilter.value = 'alles';
    }

    if (tagFilter) {
      tagFilter
        .querySelectorAll('input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
    }

    updateKaart();
  });
}

/* =========================
   EVENT LISTENERS VIEW
   ========================= */

if (showMapBtn) {
  showMapBtn.addEventListener('click', toonKaartView);
}

if (showInfoBtn) {
  showInfoBtn.addEventListener('click', toonInfoView);
}

/* =========================
   DARK MODE TOGGLE
   ========================= */

if (localStorage.getItem('theme') === 'dark') {
  document.body.classList.add('dark-mode');
  document.body.classList.remove('light-mode');
  if (darkToggle) {
    darkToggle.textContent = '☀️';
  }
} else if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
  document.body.classList.remove('dark-mode');
  if (darkToggle) {
    darkToggle.textContent = '🌙';
  }
}

updateMapTheme();

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

    updateMapTheme();
  });
}