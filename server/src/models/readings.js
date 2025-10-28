const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Device = require('./devices'); 

const Reading = sequelize.define('Reading', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  temperature: { type: DataTypes.FLOAT },

  humidity: { type: DataTypes.FLOAT },

  soil_moisture: { type: DataTypes.FLOAT },

  light_level: { type: DataTypes.FLOAT }
}, {
  tableName: 'readings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// -------------------- Associations --------------------
if (Device && Device.hasMany) {
  Device.hasMany(Reading, { foreignKey: 'device_id', sourceKey: 'device_id' });
  Reading.belongsTo(Device, { foreignKey: 'device_id', targetKey: 'device_id' });
}

// -------------------- Helper functions --------------------

// Insert a new reading
async function insertReading({ device_id, temperature, humidity, soil_moisture, light_level }) {
  return await Reading.create({ device_id, temperature, humidity, soil_moisture, light_level });
}

// Get the latest reading for a device
async function getLatestByDevice(device_id) {
  return await Reading.findOne({
    where: { device_id },
    order: [['created_at', 'DESC']]
  });
}

// Get recent readings (limit configurable)
async function getRecentReadings(limit = 10) {
  return await Reading.findAll({
    order: [['created_at', 'DESC']],
    limit
  });
}

// Get readings within a date range
async function getReadingsInRange(device_id, startDate, endDate) {
  return await Reading.findAll({
    where: {
      device_id,
      created_at: { [sequelize.Op.between]: [startDate, endDate] }
    },
    order: [['created_at', 'ASC']]
  });
}

// Get average readings for a device
async function getAverageReadings(device_id) {
  return await Reading.findOne({
    where: { device_id },
    attributes: [
      [sequelize.fn('AVG', sequelize.col('temperature')), 'avg_temperature'],
      [sequelize.fn('AVG', sequelize.col('humidity')), 'avg_humidity'],
      [sequelize.fn('AVG', sequelize.col('soil_moisture')), 'avg_soil_moisture'],
      [sequelize.fn('AVG', sequelize.col('light_level')), 'avg_light_level']
    ],
    raw: true
  });
}

module.exports = {
  Reading,             // export the Sequelize model
  insertReading,
  getLatestByDevice,
  getRecentReadings,
  getReadingsInRange,
  getAverageReadings
};
