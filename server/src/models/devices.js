const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { User } = require('./users');   

const Device = sequelize.define('Device', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  device_id: { type: DataTypes.STRING(50), allowNull: false, unique: true },

  device_name: { type: DataTypes.STRING(100), allowNull: false },

  project_tag: { type: DataTypes.STRING(50) },

  location: { type: DataTypes.STRING(100) },

  status: { type: DataTypes.STRING(20), defaultValue: 'offline' },

  api_key: { type: DataTypes.STRING, allowNull: false }
}, {
  tableName: 'devices',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Associations
if (User && User.hasMany) {
  User.hasMany(Device, { foreignKey: 'user_id' });
  Device.belongsTo(User, { foreignKey: 'user_id' });
}

module.exports = Device;
