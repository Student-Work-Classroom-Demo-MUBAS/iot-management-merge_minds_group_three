//Core Dependencies 
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
const swaggerSetup = require('./config/swagger'); // Swagger setup
const app = express();

// Security, parsing, logging
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, // default 1 min
  max: Number(process.env.RATE_LIMIT_MAX) || 120
}));

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
app.get('/', (req, res) => res.render('index', { title: 'Smart Greenhouse' }));
app.get('/devices', (req, res) => res.render('devices', { title: 'Devices' }));
app.get('/charts', (req, res) => res.render('charts', { title: 'Charts' }));

module.exports = app;