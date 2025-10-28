require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');              // main Express app config
const sequelize = require('./config/db');  // Sequelize instance

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Optional: sync models
    // await sequelize.sync();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      // or if you want to show the LAN IP for ESP32 connections:
      // console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
    });

  } catch (error) {
    console.error('❌ DB connection failed:', error.message || error);
    process.exit(1);
  }
})();
