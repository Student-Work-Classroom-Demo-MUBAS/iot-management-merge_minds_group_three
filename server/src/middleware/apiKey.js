const { verifyApiKey } = require('../models/devices');

async function apiKeyMiddleware(req, res, next) {
  const { device_id, api_key } = req.body;
  if (!device_id || !api_key) {
    return res.status(400).json({ error: 'Missing device_id or api_key' });
  }

  const device = await verifyApiKey(device_id, api_key);
  if (!device) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  next();
}

module.exports = apiKeyMiddleware;
