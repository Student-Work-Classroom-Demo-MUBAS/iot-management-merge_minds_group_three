const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Reading } = require('../models/readings');   

/**
 * @swagger
 * tags:
 *   name: Readings
 *   description: Endpoints for accessing sensor readings
 */

/**
 * @swagger
 * /api/readings/{device_id}:
 *   get:
 *     summary: Get the latest reading for a device
 *     tags: [Readings]
 */
router.get('/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const reading = await Reading.findOne({
      where: { device_id },
      order: [['created_at', 'DESC']]
    });

    if (!reading) return res.status(404).json({ error: 'No readings found' });

    res.json(reading);
  } catch (err) {
    console.error('Error fetching latest reading:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/readings/{device_id}/recent:
 *   get:
 *     summary: Get recent readings for a device (for charts)
 *     tags: [Readings]
 */
router.get('/:device_id/recent', async (req, res) => {
  try {
    const { device_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const readings = await Reading.findAll({
      where: { device_id },
      order: [['created_at', 'DESC']],
      limit
    });

    if (!readings.length) return res.status(404).json({ error: 'No readings found' });

    res.json(readings);
  } catch (err) {
    console.error('Error fetching recent readings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/readings/{device_id}/range:
 *   get:
 *     summary: Get readings for a device within a date range
 *     tags: [Readings]
 */
router.get('/:device_id/range', async (req, res) => {
  try {
    const { device_id } = req.params;
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const readings = await Reading.findAll({
      where: {
        device_id,
        created_at: { [Op.between]: [new Date(start), new Date(end)] }
      },
      order: [['created_at', 'ASC']]
    });

    if (!readings.length) return res.status(404).json({ error: 'No readings found in this range' });

    res.json(readings);
  } catch (err) {
    console.error('Error fetching readings in range:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * @swagger
 * /api/readings/{device_id}/average:
 *   get:
 *     summary: Get average readings for a device
 *     tags: [Readings]
 */
router.get('/:device_id/average', async (req, res) => {
  try {
    const { device_id } = req.params;

    const averages = await Reading.findOne({
      where: { device_id },
      attributes: [
        [Reading.sequelize.fn('AVG', Reading.sequelize.col('temperature')), 'avg_temperature'],
        [Reading.sequelize.fn('AVG', Reading.sequelize.col('humidity')), 'avg_humidity'],
        [Reading.sequelize.fn('AVG', Reading.sequelize.col('soil_moisture')), 'avg_soil_moisture'],
        [Reading.sequelize.fn('AVG', Reading.sequelize.col('light_level')), 'avg_light_level']
      ],
      raw: true
    });

    if (!averages || Object.values(averages).every(v => v === null)) {
      return res.status(404).json({ error: 'No readings found' });
    }

    res.json(averages);
  } catch (err) {
    console.error('Error fetching average readings:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
