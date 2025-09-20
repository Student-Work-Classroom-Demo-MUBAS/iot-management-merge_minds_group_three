const express = require('express');
const router = express.Router();
const { insertReading } = require('../models/readings');
const apiKeyMiddleware = require('../middleware/apiKey');

router.post('/ingest', apiKeyMiddleware, async (req, res) => {
  try {
    await insertReading(req.body);
    res.status(201).json({ message: 'Reading stored successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to store reading' });
  }
});

module.exports = router;
