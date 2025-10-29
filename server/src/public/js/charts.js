document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.charts-grid');

  async function loadLatestReadings() {
    container.textContent = 'Loading...';

    try {
      const res = await fetch('/api/readings/all-latest', {
        credentials: 'include',
        cache: 'no-store'
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.length) {
        container.textContent = 'No readings available';
        return;
      }

      container.innerHTML = data.map(r => `
        <div class="reading-card">
          <h4>Device: ${r.device_id}</h4>
          <p class="temp">🌡️ Temp: ${r.temperature ?? '--'} °C</p>
          <p class="humidity">💧 Humidity: ${r.humidity ?? '--'} %</p>
          <p class="soil">🌱 Soil: ${r.soil_moisture ?? '--'} %</p>
          <p class="light">💡 Light: ${r.light_level ?? '--'} %</p>
          <small>${new Date(r.created_at).toLocaleString()}</small>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error loading latest readings:', err);
      container.textContent = 'Failed to load readings';
    }
  }

  loadLatestReadings();
  setInterval(loadLatestReadings, 60000); // refresh every minute
});
