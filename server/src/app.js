<<<<<<< HEAD
// Load environment variables early
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
=======
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

>>>>>>> louiser-backend-ingestion-setup

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');

// Route imports
const authRoutes = require('./routes/auth.routes');
const devicesRoutes = require('./routes/devices.routes');
const readingsRoutes = require('./routes/readings.routes');
const swaggerSetup = require('./config/swagger');

<<<<<<< HEAD
const app = express();
=======
app.use(express.json());
app.use('/readings', readingsRoutes);
>>>>>>> louiser-backend-ingestion-setup

// Security, parsing, logging
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 120
}));

<<<<<<< HEAD
// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// Static assets
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/readings', readingsRoutes);

// Swagger docs
swaggerSetup(app);

// Page routes
app.get('/', (req, res) => res.render('index', { title: 'Smart Greenhouse', page: 'dashboard' }));
app.get('/devices', (req, res) => res.render('devices', { title: 'Devices', page: 'devices' }));
app.get('/charts', (req, res) => res.render('charts', { title: 'Charts', page: 'charts' }));

module.exports = app;
=======
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
>>>>>>> louiser-backend-ingestion-setup
