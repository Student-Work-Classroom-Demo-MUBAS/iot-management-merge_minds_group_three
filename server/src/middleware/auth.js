// JWT Authentication Middleware
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Check Authorization header OR cookie
  const header = req.headers.authorization || '';
  const token =
    (header.startsWith('Bearer ') ? header.slice(7) : null) ||
    req.cookies?.token;

  // If no token found
  if (!token) {
    if (req.accepts('html')) {
      // Browser/EJS flow → redirect to login
      return res.redirect('/login');
    }
    // API client → JSON error
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded payload to request

    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);

    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
