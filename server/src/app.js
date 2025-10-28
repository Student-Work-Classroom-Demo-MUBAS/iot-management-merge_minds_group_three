// Load environment variables early
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');

// Route imports
const authRoutes = require('./routes/auth.routes');
const devicesRoutes = require('./routes/devices.routes');
const readingsRoutes = require('./routes/readings.routes');
const swaggerSetup = require('./config/swagger');
const requireAuth = require('./middleware/auth');
const Device = require('./models/devices');

const app = express();

// -------------------- Security, parsing, logging --------------------
app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}));

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max: Number(process.env.RATE_LIMIT_MAX) || 120
}));
app.use(cookieParser());

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
app.get('/login', (req, res) =>
  res.render('login', { title: 'Login', page: 'login', error: null })
);

app.get('/signup', (req, res) =>
  res.render('signup', { title: 'Sign Up', page: 'signup', error: null })
);

app.get('/', requireAuth, (req, res) =>
  res.render('index', { title: 'Smart Greenhouse', page: 'dashboard', user: req.user })
);

app.get('/devices', requireAuth, async (req, res) => {
  try {
    const devices = await Device.findAll();
    res.render('devices', {
      title: 'Devices',
      page: 'devices',
      user: req.user,
      devices
    });
  } catch (err) {
    console.error('❌ Failed to load devices:', err);
    res.render('devices', {
      title: 'Devices',
      page: 'devices',
      user: req.user,
      devices: [],
      error: 'Failed to load devices'
    });
  }
});

app.get('/charts', requireAuth, (req, res) =>
  res.render('charts', { title: 'Charts', page: 'charts', user: req.user })
);

module.exports = app;   // ✅ only export app, no listen here
