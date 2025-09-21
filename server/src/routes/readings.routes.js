const express = require('express');
const router = express.Router();
const Readings = require('../models/readings');

/**
 * GET latest reading for a device
 * Example: GET /readings/DEVICE123
 */
router.get('/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const reading = await Readings.getLatestByDevice(device_id);

    if (!reading) {
      return res.status(404).json({ error: 'No readings found' });
    }

    res.json(reading);
  } catch (err) {
    console.error('Error fetching latest reading:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET recent readings for a device (for charts)
 * Example: GET /readings/:device_id/recent?limit=20
 */
router.get('/:device_id/recent', async (req, res) => {
  try {
    const { device_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const readings = await Readings.getRecentReadings(device_id, limit);

    if (!readings.length) {
      return res.status(404).json({ error: 'No readings found' });
    }

    res.json(readings);
  } catch (err) {
    console.error('Error fetching recent readings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET readings in a date range
 * Example: GET /readings/:device_id/range?start=2025-09-01&end=2025-09-21
 */
router.get('/:device_id/range', async (req, res) => {
  try {
    const { device_id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const readings = await Readings.getReadingsInRange(device_id, start, end);

    if (!readings.length) {
      return res.status(404).json({ error: 'No readings found in this range' });
    }

    res.json(readings);
  } catch (err) {
    console.error('Error fetching readings in range:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET average readings for a device
 * Example: GET /readings/:device_id/average
 */
router.get('/:device_id/average', async (req, res) => {
  try {
    const { device_id } = req.params;
    const averages = await Readings.getAverageReadings(device_id);

    if (!averages) {
      return res.status(404).json({ error: 'No readings found' });
    }

    res.json(averages);
  } catch (err) {
    console.error('Error fetching average readings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
