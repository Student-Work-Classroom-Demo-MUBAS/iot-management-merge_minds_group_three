const express = require('express');
const router = express.Router();
const Readings = require('../models/readings');

// GET /readings/:device_id
router.get('/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const reading = await Readings.getLatestByDevice(device_id);
    if (!reading) {
      return res.status(404).json({ error: 'No readings found' });
    }
    res.json(reading);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
