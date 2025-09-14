document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/readings/DEVICE123'); // (To Be Replace with real device_id)
    const data = await res.json();

    const ctxTemp = document.getElementById('tempChart').getContext('2d');
    new Chart(ctxTemp, {
      type: 'line',
      data: {
        labels: [data.timestamp],
        datasets: [{
          label: 'Temperature (°C)',
          data: [data.temperature],
          borderColor: 'red',
          fill: false
        }]
      }
    });

    // Repeat for humidity, soil, light...
  } catch (err) {
    console.error('Error loading chart data:', err);
  }
});
