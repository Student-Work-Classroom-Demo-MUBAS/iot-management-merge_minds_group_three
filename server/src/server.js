require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = require('./app');              // main Express app config
const sequelize = require('./config/db');  // Sequelize instance
const port = process.env.PORT || 3000;

// --- Middleware for cookies + EJS views ---
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // adjust if your views folder is elsewhere

// --- Routes ---
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Example: protect homepage with auth middleware
const requireAuth = require('./middleware/auth');
app.get('/', requireAuth, (req, res) => {
  res.render('index', { user: req.user }); // pass decoded JWT user to EJS
});

(async () => {
  try {
    // Test DB connection using Sequelize
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Sync models if needed (optional, careful in prod)
    // await sequelize.sync();

    // Start server once
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ DB connection failed:', error.message || error);
    process.exit(1);
  }
})();
