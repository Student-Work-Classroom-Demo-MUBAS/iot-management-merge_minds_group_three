// server/src/config/db.js
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD, 'value:', process.env.DB_PASSWORD);

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;
