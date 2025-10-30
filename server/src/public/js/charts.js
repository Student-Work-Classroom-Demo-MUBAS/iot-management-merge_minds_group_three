document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.charts-grid');

  // Fetch the last 20 readings for a given device
  async function loadRecentReadings(deviceId) {
    const res = await fetch(`/api/readings/${deviceId}/recent?limit=20`, {
      credentials: 'include',
      cache: 'no-store'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function renderDeviceCards() {
    container.textContent = 'Loading...';

    try {
      // Step 1: get all devices
      const devicesRes = await fetch('/api/devices', { credentials: 'include' });
      const devices = await devicesRes.json();

      container.innerHTML = '';

      // Step 2: for each device, fetch its last 20 readings
      for (const device of devices) {
        const readings = await loadRecentReadings(device.device_id);

        // Step 3: render a card with those readings
          const card = document.createElement('div');
          card.className = 'reading-card';
          card.innerHTML = `
            <h4>Device: ${device.device_id}</h4>
            <div class="readings-list">
              ${readings.map(r => `
                <div class="reading-row">
                  <p class="temp">🌡️ Temp: <span>${r.temperature ?? '--'} °C</span></p>
                  <p class="humidity">💧 Humidity: <span>${r.humidity ?? '--'} %</span></p>
                  <p class="soil">🌱 Soil: <span>${r.soil_moisture ?? '--'} %</span></p>
                  <p class="light">💡 Light: <span>${r.light_level ?? '--'} %</span></p>
                  <small class="timestamp"> ${new Date(r.created_at).toLocaleString()}</small>
                </div>
              `).join('')}
            </div>
          `;
          container.appendChild(card);

      }
    } catch (err) {
      console.error('Error loading readings:', err);
      container.textContent = 'Failed to load readings';
    }
  }

  renderDeviceCards();
  setInterval(renderDeviceCards, 60000); // refresh every minute
});
