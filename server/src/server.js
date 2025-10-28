require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const app = require('./app');              // main Express app config
const sequelize = require('./config/db');  // Sequelize instance
const port = process.env.PORT || 3000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Optional: sync models
    // await sequelize.sync();

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ DB connection failed:', error.message || error);
    process.exit(1);
  }
})();
