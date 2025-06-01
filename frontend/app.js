const map = L.map('map').setView([20.5937, 78.9629], 4);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

async function loadPlaces(era = '') {
  const res = await fetch(`http://localhost:5000/places${era ? `?era=${era}` : ''}`);
  const data = await res.json();

  // Clear existing markers
  map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer); });

  data.forEach(place => {
    const marker = L.marker([place.location.coordinates[1], place.location.coordinates[0]]).addTo(map);
    const imageTag = place.images[0]?.filename
      ? `<img src="http://localhost:5000/images/${place.images[0].filename}" width="100">`
      : 'No image available';
    marker.bindPopup(`<b>${place.name}</b><br>${place.description}<br>${imageTag}`);
  });
}

// Search places by name
async function searchPlacesByName(name) {
  const res = await fetch(`http://localhost:5000/places/search?name=${encodeURIComponent(name)}`);
  const data = await res.json();

  // Clear existing markers
  map.eachLayer((layer) => { if (layer instanceof L.Marker) map.removeLayer(layer); });

  data.forEach(place => {
    const marker = L.marker([place.location.coordinates[1], place.location.coordinates[0]]).addTo(map);
    const imageTag = place.images[0]?.filename
      ? `<img src="http://localhost:5000/images/${place.images[0].filename}" width="100">`
      : 'No image available';
    marker.bindPopup(`<b>${place.name}</b><br>${place.description}<br>${imageTag}`);
  });
}

document.getElementById('eraFilter').addEventListener('change', (e) => {
  loadPlaces(e.target.value);
});

document.getElementById('searchBtn').addEventListener('click', () => {
  const name = document.getElementById('searchBox').value.trim();
  if (name) {
    searchPlacesByName(name);
  }
});

// Initial load with no filter
loadPlaces();
