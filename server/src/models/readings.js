const db = require('../config/db');

/**
 * Get the latest reading for a specific device
 */
async function getLatestByDevice(device_id) {
  const query = `
    SELECT *
    FROM readings
    WHERE device_id = $1
    ORDER BY timestamp DESC
    LIMIT 1
  `;
  try {
    const { rows } = await db.query(query, [device_id]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error fetching latest reading:', err);
    throw err;
  }
}

/**
 * Get multiple recent readings for a device (for charts)
 */
async function getRecentReadings(device_id, limit = 20) {
  const query = `
    SELECT *
    FROM readings
    WHERE device_id = $1
    ORDER BY timestamp DESC
    LIMIT $2
  `;
  try {
    const { rows } = await db.query(query, [device_id, limit]);
    return rows;
  } catch (err) {
    console.error('Error fetching recent readings:', err);
    throw err;
  }
}

/**
 * Get readings within a specific date range
 */
async function getReadingsInRange(device_id, startDate, endDate) {
  const query = `
    SELECT *
    FROM readings
    WHERE device_id = $1
      AND timestamp BETWEEN $2 AND $3
    ORDER BY timestamp ASC
  `;
  try {
    const { rows } = await db.query(query, [device_id, startDate, endDate]);
    return rows;
  } catch (err) {
    console.error('Error fetching readings in range:', err);
    throw err;
  }
}

/**
 * Get average readings for a device (useful for summaries)
 */
async function getAverageReadings(device_id) {
  const query = `
    SELECT
      AVG(temperature) AS avg_temperature,
      AVG(humidity) AS avg_humidity,
      AVG(soil_moisture) AS avg_soil_moisture,
      AVG(light_level) AS avg_light_level
    FROM readings
    WHERE device_id = $1
  `;
  try {
    const { rows } = await db.query(query, [device_id]);
    return rows[0];
  } catch (err) {
    console.error('Error fetching average readings:', err);
    throw err;
  }
}

module.exports = {
  getLatestByDevice,
  getRecentReadings,
  getReadingsInRange,
  getAverageReadings
};
