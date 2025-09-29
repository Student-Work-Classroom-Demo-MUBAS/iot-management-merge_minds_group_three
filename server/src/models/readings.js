const db = require('../config/db');
const Sequelize = require('sequelize');
const QueryTypes = Sequelize.QueryTypes;

/**
 * Insert a new reading into the database
 */
async function insertReading(data) {
  const { device_id, temperature, humidity, soil_moisture, light_level } = data;

  await db.query(
    `INSERT INTO readings (device_id, temperature, humidity, soil_moisture, light_level)
     VALUES (:device_id, :temperature, :humidity, :soil_moisture, :light_level)`,
    {
      replacements: { device_id, temperature, humidity, soil_moisture, light_level },
      type: QueryTypes.INSERT
    }
  );
}

/**
 * Get the latest reading for a specific device
 */
async function getLatestByDevice(deviceId) {
  const [result] = await db.query(
    `SELECT * FROM readings 
     WHERE device_id = :device_id 
     ORDER BY created_at DESC 
     LIMIT 1`,
    {
      replacements: { device_id: deviceId },
      type: QueryTypes.SELECT
    }
  );
  return result;
}

/**
 * Get recent readings (limit configurable)
 */
async function getRecentReadings(limit = 10) {
  return await db.query(
    `SELECT * FROM readings 
     ORDER BY created_at DESC 
     LIMIT :limit`,
    {
      replacements: { limit },
      type: QueryTypes.SELECT
    }
  );
}

/**
 * Get readings within a date range
 */
async function getReadingsInRange(deviceId, startDate, endDate) {
  return await db.query(
    `SELECT * FROM readings 
     WHERE device_id = :device_id 
       AND created_at BETWEEN :start_date AND :end_date
     ORDER BY created_at ASC`,
    {
      replacements: { device_id: deviceId, start_date: startDate, end_date: endDate },
      type: QueryTypes.SELECT
    }
  );
}

/**
 * Get average readings for a device
 */
async function getAverageReadings(deviceId) {
  const [result] = await db.query(
    `SELECT 
       AVG(temperature) AS avg_temperature,
       AVG(humidity) AS avg_humidity,
       AVG(soil_moisture) AS avg_soil_moisture,
       AVG(light_level) AS avg_light_level
     FROM readings
     WHERE device_id = :device_id`,
    {
      replacements: { device_id: deviceId },
      type: QueryTypes.SELECT
    }
  );
  return result;
}

module.exports = {
  insertReading,
  getLatestByDevice,
  getRecentReadings,
  getReadingsInRange,
  getAverageReadings
};
