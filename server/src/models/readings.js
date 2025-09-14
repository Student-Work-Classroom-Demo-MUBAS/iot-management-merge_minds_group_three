const db = require('../config/db');

async function getLatestByDevice(device_id) {
  const result = await db.query(
    'SELECT * FROM readings WHERE device_id = $1 ORDER BY timestamp DESC LIMIT 1',
    [device_id]
  );
  return result.rows[0];
}

module.exports = { getLatestByDevice };
