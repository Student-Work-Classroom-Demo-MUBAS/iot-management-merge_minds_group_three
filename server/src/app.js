// Load environment variables early
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

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

const app = express();

// -------------------- Security, parsing, logging --------------------
app.use(helmet());

// Allow CORS from your frontend (default: localhost:3000)
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

// Body parsing
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Rate limiting
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000, // 1 minute
  max: Number(process.env.RATE_LIMIT_MAX) || 120                // 120 requests per minute
}));

// -------------------- View engine setup --------------------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/main');

// -------------------- Static assets --------------------
app.use(express.static(path.join(__dirname, 'public')));

// -------------------- API routes --------------------
app.use('/api/auth', authRoutes);
app.use('/api/devices', devicesRoutes);
app.use('/api/readings', readingsRoutes);

// -------------------- Swagger docs --------------------
swaggerSetup(app);

// -------------------- Page routes --------------------
app.get('/', (req, res) =>
  res.render('index', { title: 'Smart Greenhouse', page: 'dashboard' })
);

app.get('/devices', (req, res) =>
  res.render('devices', { title: 'Devices', page: 'devices' })
);

app.get('/charts', (req, res) =>
  res.render('charts', { title: 'Charts', page: 'charts' })
);

module.exports = app;
