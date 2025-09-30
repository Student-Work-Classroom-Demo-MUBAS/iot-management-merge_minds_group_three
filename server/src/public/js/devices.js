// Load all devices into the table
async function loadDevices() {
  const tbody = document.getElementById('device-table');
  tbody.innerHTML = `<tr><td colspan="4" class="loading-cell">Loading devices...</td></tr>`;

  try {
    const res = await fetch('/api/devices', {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    });

    if (!res.ok) throw new Error('Failed to fetch devices');

    const devices = await res.json();
    renderDevices(devices);
  } catch (err) {
    console.error('Error loading devices:', err);
    tbody.innerHTML = `<tr><td colspan="4">⚠️ Failed to load devices</td></tr>`;
  }
}

// Render devices with optional search/filter
function renderDevices(devices) {
  const tbody = document.getElementById('device-table');
  tbody.innerHTML = '';

  const search = document.getElementById('device-search').value.toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;

  const filtered = devices.filter(d =>
    (d.device_name.toLowerCase().includes(search) || d.device_id.toLowerCase().includes(search)) &&
    (!statusFilter || d.status === statusFilter)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">No devices found</td></tr>`;
    return;
  }

  filtered.forEach(d => {
    const row = `
      <tr>
        <td>${d.device_name}</td>
        <td>${d.device_id}</td>
        <td>${d.location}</td>
        <td>${d.status}</td>
      </tr>`;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}

// Handle device registration form
document.getElementById('add-device-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target);
  const body = Object.fromEntries(formData.entries());

  try {
    const res = await fetch('/api/devices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify(body)
    });

    if (res.status === 201) {
      const data = await res.json();
      alert(`✅ Device registered successfully.\nAPI Key: ${data.apiKey}\n⚠️ Save this key securely, it will not be shown again.`);
      e.target.reset();
      loadDevices();
    } else {
      const errData = await res.json();
      alert('Error: ' + (errData.error || 'Failed to register device'));
    }
  } catch (err) {
    console.error('Error registering device:', err);
    alert('⚠️ Failed to register device');
  }
});

// Search & filter logic
document.getElementById('device-search').addEventListener('input', loadDevices);
document.getElementById('status-filter').addEventListener('change', loadDevices);

// Load devices on page load
document.addEventListener('DOMContentLoaded', loadDevices);
