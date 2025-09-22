document.addEventListener('DOMContentLoaded', async () => {
  const deviceId = 'DEVICE123'; // TODO: Replace dynamically
  const limit = 20; // last 20 readings

  try {
    const res = await fetch(`/readings/${deviceId}/recent?limit=${limit}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const readings = await res.json();

    if (!readings.length) {
      console.warn('No readings available for chart.');
      return;
    }

    // Prepare chart data
    const labels = readings.map(r => new Date(r.timestamp));
    const tempData = readings.map(r => r.temperature);
    const humidityData = readings.map(r => r.humidity);
    const soilData = readings.map(r => r.soil_moisture);
    const lightData = readings.map(r => r.light_level);

    // Chart options
    const commonOptions = {
      responsive: true,
      animation: { duration: 800 },
      scales: {
        x: { type: 'time', time: { unit: 'minute' } },
        y: { beginAtZero: true }
      }
    };

    // Temperature chart
    new Chart(document.getElementById('tempChart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Temperature (°C)',
          data: tempData,
          borderColor: 'red',
          backgroundColor: 'rgba(255,0,0,0.1)',
          fill: true
        }]
      },
      options: commonOptions
    });

    // Humidity chart
    new Chart(document.getElementById('humidityChart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Humidity (%)',
          data: humidityData,
          borderColor: 'blue',
          backgroundColor: 'rgba(0,0,255,0.1)',
          fill: true
        }]
      },
      options: commonOptions
    });

    // Soil moisture chart
    new Chart(document.getElementById('soilChart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Soil Moisture (%)',
          data: soilData,
          borderColor: 'green',
          backgroundColor: 'rgba(0,255,0,0.1)',
          fill: true
        }]
      },
      options: commonOptions
    });

    // Light level chart
    new Chart(document.getElementById('lightChart').getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Light Level',
          data: lightData,
          borderColor: 'goldenrod',
          backgroundColor: 'rgba(255,215,0,0.1)',
          fill: true
        }]
      },
      options: commonOptions
    });

  } catch (err) {
    console.error('Error loading chart data:', err);
  }
});
