// require('dotenv').config(); // ✅ Load environment variables
// require('dotenv').config({ path: '../.env' });
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


console.log('DB config:', {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});


const express = require('express');
const app = express();
const readingsRoutes = require('./routes/readings.routes');

app.use(express.json());
app.use('/readings', readingsRoutes);

// Optional: root route
app.get('/', (req, res) => {
  res.send('IoT Management API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
