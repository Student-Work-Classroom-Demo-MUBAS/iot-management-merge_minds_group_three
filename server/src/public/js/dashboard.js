async function fetchReadings(deviceId) {
  try {
    const res = await fetch(`/readings/${deviceId}`);
    const data = await res.json();

    document.getElementById('temp').textContent = data.temperature + ' °C';
    document.getElementById('humidity').textContent = data.humidity + ' %';
    document.getElementById('soil').textContent = data.soil_moisture + ' %';
    document.getElementById('light').textContent = data.light_level;
  } catch (err) {
    console.error('Error fetching readings:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  fetchReadings('DEVICE123');
  setInterval(() => fetchReadings('DEVICE123'), 60000); // refresh every minute
});
