async function fetchReadings(deviceId) {
  const loadingEl = document.getElementById('loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    const res = await fetch(`/readings/${deviceId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    document.getElementById('temp').textContent = `${data.temperature} °C`;
    document.getElementById('humidity').textContent = `${data.humidity} %`;
    document.getElementById('soil').textContent = `${data.soil_moisture} %`;
    document.getElementById('light').textContent = data.light_level;

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
  const deviceId = 'DEVICE123'; // TODO: Replace dynamically
  fetchReadings(deviceId);
  setInterval(() => fetchReadings(deviceId), 60000); // refresh every minute
});
