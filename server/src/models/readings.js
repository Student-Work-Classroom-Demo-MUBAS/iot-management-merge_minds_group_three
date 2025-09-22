const db = require('../config/db');
const Sequelize = require('sequelize');
const QueryTypes = Sequelize.QueryTypes;

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

module.exports = {
  getLatestByDevice,
  getRecentReadings,
  getReadingsInRange,
  getAverageReadings
};
