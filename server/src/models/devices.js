const { pool } = require('../config/db');

/**
 * Create a new device record
 */
async function createDevice({ device_id, device_name, project_tag = 'greenhouse', location, api_key_hash, created_by }) {
  const query = `
    INSERT INTO devices (device_id, device_name, project_tag, location, api_key_hash, created_by)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, device_id, device_name, project_tag, location, active, created_at
  `;
  try {
    const { rows } = await pool.query(query, [device_id, device_name, project_tag, location, api_key_hash, created_by]);
    return rows[0];
  } catch (err) {
    console.error('Error creating device:', err);
    throw err;
  }
}

/**
 * List all devices
 */
async function listDevices() {
  const query = `
    SELECT id, device_id, device_name, project_tag, location, active, created_at
    FROM devices
    ORDER BY created_at DESC
  `;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error('Error listing devices:', err);
    throw err;
  }
}

/**
 * Get a single device by its ID
 */
async function getDeviceById(device_id) {
  const query = `SELECT * FROM devices WHERE device_id = $1`;
  try {
    const { rows } = await pool.query(query, [device_id]);
    return rows[0];
  } catch (err) {
    console.error('Error fetching device:', err);
    throw err;
  }
}

/**
 * Soft delete: deactivate device instead of removing
 */
async function deactivateDevice(device_id) {
  const query = `UPDATE devices SET active = false WHERE device_id = $1`;
  try {
    await pool.query(query, [device_id]);
  } catch (err) {
    console.error('Error deactivating device:', err);
    throw err;
  }
}

/**
 * Update device details
 */
async function updateDevice(device_id, updates) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  const query = `UPDATE devices SET ${fields.join(', ')} WHERE device_id = $${i} RETURNING *`;
  values.push(device_id);

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error('Error updating device:', err);
    throw err;
  }
}

module.exports = {
  createDevice,
  listDevices,
  getDeviceById,
  deactivateDevice,
  updateDevice
};
