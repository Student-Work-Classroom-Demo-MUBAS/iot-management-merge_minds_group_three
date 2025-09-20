// JWT Authentication Middleware

const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT tokens in the Authorization header.
 * Expected header format: "Authorization: Bearer <token>"
 */
module.exports = (req, res, next) => {
  // Get the Authorization header, or empty string if missing
  const header = req.headers.authorization || '';

  // Extract token if header starts with "Bearer "
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  // If no token found, reject the request
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }

  try {
    // Verify the token using the secret from .env
    // If valid, decoded payload is attached to req.user
    req.user = jwt.verify(token, process.env.JWT_SECRET);

    // Continue to the next middleware or route handler
    next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    res.status(401).json({ error: 'Invalid token' });
  }
};
