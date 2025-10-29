// Fetch latest readings for all devices
async function fetchAllReadings() {
  const container = document.getElementById('recent-readings');
  container.textContent = 'Loading...';

  try {
    const res = await fetch('/api/readings/all-latest', { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.length) {
      container.textContent = 'No readings available';
      return;
    }

    // Render each device’s latest reading
    container.innerHTML = data.map(r => `
      <div class="reading-card">
        <h4>Device: ${r.device_id}</h4>
        <p> Temp: ${r.temperature ?? '--'} °C</p>
        <p> Humidity: ${r.humidity ?? '--'} %</p>
        <p> Soil: ${r.soil_moisture ?? '--'} %</p>
        <p> Light: ${r.light_level ?? '--'} %</p>
        <small>${new Date(r.created_at).toLocaleString()}</small>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error fetching all readings:', err);
    container.textContent = 'Failed to load readings';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchAllReadings();
  setInterval(fetchAllReadings, 60000); // refresh every minute
});
