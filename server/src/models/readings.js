const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/db');
const Device = require('./devices'); 

const Reading = sequelize.define('Reading', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  device_id: {
    type: DataTypes.STRING,
    allowNull: false
  },

  temperature: { type: DataTypes.FLOAT, allowNull: true },
  humidity: { type: DataTypes.FLOAT, allowNull: true },
  soil_moisture: { type: DataTypes.FLOAT, allowNull: true },
  light_level: { type: DataTypes.FLOAT, allowNull: true }
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
async function insertReading({ device_id, temperature, humidity, soil_moisture, light_level }) {
  return await Reading.create({ device_id, temperature, humidity, soil_moisture, light_level });
}

async function getLatestByDevice(device_id) {
  return await Reading.findOne({
    where: { device_id },
    order: [['created_at', 'DESC']]
  });
}

async function getRecentReadings(device_id, limit = 10) {
  return await Reading.findAll({
    where: { device_id },
    order: [['created_at', 'DESC']],
    limit
  });
}

async function getReadingsInRange(device_id, startDate, endDate) {
  return await Reading.findAll({
    where: {
      device_id,
      created_at: { [Op.between]: [startDate, endDate] }
    },
    order: [['created_at', 'ASC']]
  });
}

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
  Reading,
  insertReading,
  getLatestByDevice,
  getRecentReadings,
  getReadingsInRange,
  getAverageReadings
};
