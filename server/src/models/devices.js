const db = require('../config/db');
const Sequelize = require('sequelize');
const QueryTypes = Sequelize.QueryTypes;

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

module.exports = { verifyApiKey };
