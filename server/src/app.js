// const readingsRoutes = require('./routes/readings.routes');
// app.use('/readings', readingsRoutes);

const express = require('express');
const app = express();
const readingsRoutes = require('./routes/readings.routes');

app.use(express.json()); // Middleware to parse JSON
app.use('/readings', readingsRoutes);

// Optional: root route
app.get('/', (req, res) => {
  res.send('IoT Management API is running');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
