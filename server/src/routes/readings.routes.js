const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { Reading, insertReading } = require('../models/readings');
const Device = require('../models/devices');

/**
 * @swagger
 * tags:
 *   name: Readings
 *   description: Endpoints for accessing and submitting sensor readings
 */

/**
 * @swagger
 * /api/readings:
 *   post:
 *     summary: Submit a new sensor reading
 *     tags: [Readings]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_id
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: dev-001
 *               temperature:
 *                 type: number
 *                 example: 24.5
 *               humidity:
 *                 type: number
 *                 example: 60
 *               soil_moisture:
 *                 type: number
 *                 example: 45
 *               light_level:
 *                 type: number
 *                 example: 300
 *     responses:
 *       201:
 *         description: Reading stored successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Reading stored
 *               reading:
 *                 id: 1
 *                 device_id: dev-001
 *                 temperature: 24.5
 *                 created_at: 2025-10-28T12:00:00Z
 *       401:
 *         description: Invalid device or API key
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid device or API key
 */
router.post('/', async (req, res) => {
  try {
    const apiKey = req.header('x-api-key');
    const { device_id, temperature, humidity, soil_moisture, light_level } = req.body;

    // Validate device + apiKey
    const device = await Device.findOne({ where: { device_id, api_key: apiKey } });
    if (!device) {
      return res.status(401).json({ error: 'Invalid device or API key' });
    }

    const reading = await insertReading({ device_id, temperature, humidity, soil_moisture, light_level });
    res.status(201).json({ message: 'Reading stored', reading });
  } catch (err) {
    console.error('Insert reading error:', err);
    res.status(500).json({ error: 'Failed to store reading' });
  }
});

/**
 * @swagger
 * /api/readings/{device_id}:
 *   get:
 *     summary: Get the latest reading for a device
 *     tags: [Readings]
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Latest reading
 *       404:
 *         description: No readings found
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
