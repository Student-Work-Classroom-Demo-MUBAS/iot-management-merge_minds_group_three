const db = require('../config/db');

async function insertReading(data) {
  const { device_id, temperature, humidity, soil_moisture, light_level } = data;
  await db.query(
    `INSERT INTO readings (device_id, temperature, humidity, soil_moisture, light_level)
     VALUES ($1, $2, $3, $4, $5)`,
    [device_id, temperature, humidity, soil_moisture, light_level]
  );
}

module.exports = { insertReading };
