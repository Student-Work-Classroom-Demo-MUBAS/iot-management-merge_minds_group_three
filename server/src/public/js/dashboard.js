// Fetch readings for a given device
async function fetchReadings(deviceId) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    // ✅ Use the correct API path and include cookies
    const res = await fetch(`/api/readings/${deviceId}`, {
      credentials: 'include'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Update dashboard values
    document.getElementById('temp').textContent = `${data.temperature} °C`;
    document.getElementById('humidity').textContent = `${data.humidity} %`;
    document.getElementById('soil').textContent = `${data.soil_moisture} %`;
    document.getElementById('light').textContent = `${data.light_level} %`;

    // Optional: color‑code values
    document.getElementById('temp').style.color = data.temperature > 30 ? 'red' : 'green';
    document.getElementById('humidity').style.color = data.humidity < 40 ? 'orange' : 'blue';
  } catch (err) {
    console.error('Error fetching readings:', err);
    document.getElementById('temp').textContent = '--';
    document.getElementById('humidity').textContent = '--';
    document.getElementById('soil').textContent = '--';
    document.getElementById('light').textContent = '--';
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // TODO: Replace with the actual selected device ID dynamically
  const deviceId = 'DEVICE123';
  fetchReadings(deviceId);
  setInterval(() => fetchReadings(deviceId), 60000); // refresh every minute
});
