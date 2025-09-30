const db = require('../config/db');
const Sequelize = require('sequelize');
const QueryTypes = Sequelize.QueryTypes;

<<<<<<< HEAD
// Verify API key for a device
=======
>>>>>>> louiser-backend-ingestion-setup
async function verifyApiKey(device_id, api_key) {
  const result = await db.query(
    'SELECT * FROM devices WHERE device_id = :device_id AND api_key = :api_key',
    {
      replacements: { device_id, api_key },
      type: QueryTypes.SELECT
    }
  );
  return result[0];
}

<<<<<<< HEAD
// List all devices
async function listDevices() {
  return await db.query(
    'SELECT device_id, device_name, project_tag, location, status, created_by, created_at FROM devices ORDER BY device_name ASC',
    { type: QueryTypes.SELECT }
  );
}

// Get a single device by ID
async function getDeviceById(device_id) {
  const result = await db.query(
    'SELECT * FROM devices WHERE device_id = :device_id',
    {
      replacements: { device_id },
      type: QueryTypes.SELECT
    }
  );
  return result[0];
}

// Create a new device
async function createDevice({ device_id, device_name, project_tag, location, status, api_key_hash, created_by }) {
  return await db.query(
    `INSERT INTO devices (device_id, device_name, project_tag, location, status, api_key, created_by, created_at)
     VALUES (:device_id, :device_name, :project_tag, :location, :status, :api_key_hash, :created_by, NOW())`,
    {
      replacements: { device_id, device_name, project_tag, location, status, api_key_hash, created_by },
      type: QueryTypes.INSERT
    }
  );
}

// Remove a device
async function removeDevice(device_id) {
  return await db.query(
    'DELETE FROM devices WHERE device_id = :device_id',
    {
      replacements: { device_id },
      type: QueryTypes.DELETE
    }
  );
}

module.exports = {
  verifyApiKey,
  listDevices,
  getDeviceById,
  createDevice,
  removeDevice
};
=======
module.exports = { verifyApiKey };
>>>>>>> louiser-backend-ingestion-setup
