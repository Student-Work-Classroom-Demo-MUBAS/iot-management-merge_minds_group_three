// load environmental variables
require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Test DB connection
    await pool.query('SELECT 1');
    console.log('Database connection successful');

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('DB connection failed:', error.message || error);
    process.exit(1);
  }
})();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
