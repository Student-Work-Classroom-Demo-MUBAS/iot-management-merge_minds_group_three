const db = require('../config/db');

async function getDeviceById(device_id) {
  const result = await db.query('SELECT * FROM devices WHERE device_id = $1', [device_id]);
  return result.rows[0];
}

async function verifyApiKey(device_id, api_key) {
  const result = await db.query(
    'SELECT * FROM devices WHERE device_id = $1 AND api_key = $2',
    [device_id, api_key]
  );
  return result.rows[0];
}

module.exports = { getDeviceById, verifyApiKey };
