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
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: API key assigned to the device
 *       - in: header
 *         name: x-device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
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
 *                 humidity: 60
 *                 soil_moisture: 45
 *                 light_level: 300
 *                 created_at: 2025-10-28T12:00:00Z
 *       400:
 *         description: Missing headers
 *       401:
 *         description: Invalid device or API key
 */
router.post('/', async (req, res) => {
  try {
    const apiKey = req.header('x-api-key');
    const deviceId = req.header('x-device-id') || req.body.deviceId;

    if (!deviceId || !apiKey) {
      return res.status(400).json({ error: 'Missing x-device-id or x-api-key headers' });
    }

    const device = await Device.findOne({ where: { device_id: deviceId, apiKey, status: 'active' } });
    if (!device) {
      return res.status(401).json({ error: 'Invalid device or API key' });
    }

    const { temperature, humidity, soil_moisture, light_level } = req.body;

    const reading = await insertReading({
      device_id: deviceId,
      temperature,
      humidity,
      soil_moisture,
      light_level
    });

    res.status(201).json({ message: 'Reading stored', reading });
  } catch (err) {
    console.error('Insert reading error:', err);
    res.status(500).json({ error: 'Failed to store reading' });
  }
});

/**
 * @swagger
 * /api/readings/all-latest:
 *   get:
 *     summary: Get the latest reading for all devices
 *     tags: [Readings]
 *     responses:
 *       200:
 *         description: Latest readings for all devices
 *         content:
 *           application/json:
 *             example:
 *               - device_id: dev-001
 *                 temperature: 25.8
 *                 humidity: 56.5
 *                 soil_moisture: 40
 *                 light_level: 70
 *                 created_at: 2025-10-28T12:05:00Z
 *               - device_id: dev-002
 *                 temperature: 22.1
 *                 humidity: 61.0
 *                 soil_moisture: 38
 *                 light_level: 65
 *                 created_at: 2025-10-28T12:06:00Z
 */
router.get('/all-latest', async (req, res) => {
  try {
    const devices = await Device.findAll({ attributes: ['device_id'], where: { status: 'active' } });
    const results = [];

    for (const d of devices) {
      const latest = await Reading.findOne({
        where: { device_id: d.device_id },
        order: [['created_at', 'DESC']]
      });
      if (latest) results.push(latest);
    }

    res.json(results);
  } catch (err) {
    console.error('Error fetching all latest readings:', err);
    res.status(500).json({ error: 'Server error' });
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
 *         example: dev-001
 *     responses:
 *       200:
 *         description: Latest reading
 *         content:
 *           application/json:
 *             example:
 *               device_id: dev-001
 *               temperature: 25.8
 *               humidity: 56.5
 *               soil_moisture: 40
 *               light_level: 70
 *               created_at: 2025-10-28T12:05:00Z
 *       404:
 *         description: No readings found
 */
router.get('/:device_id', async (req, res) => {
  try {
    const { device_id } = req.params;
    const device = await Device.findOne({ where: { device_id, status: 'active' } });
    if (!device) return res.status(404).json({ error: 'Device not found or inactive' });

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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         example: dev-002
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of recent readings to return
 *     responses:
 *       200:
 *         description: List of recent readings
 *         content:
 *           application/json:
 *             example:
 *               - device_id: dev-002
 *                 soil_moisture: 42
 *                 created_at: 2025-10-28T12:10:00Z
 *               - device_id: dev-002
 *                 soil_moisture: 40
 *                 created_at: 2025-10-28T12:05:00Z
 *       404:
 *         description: No readings found
 */
router.get('/:device_id/recent', async (req, res) => {
  try {
    const { device_id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const device = await Device.findOne({ where: { device_id, status: 'active' } });
    if (!device) return res.status(404).json({ error: 'Device not found or inactive' });

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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         example: dev-003
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2025-10-28T00:00:00Z
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         example: 2025-10-28T23:59:59Z
 *     responses:
 *       200:
 *         description: Readings in range
 *       400:
 *         description: Missing start or end
 *       404:
 *         description: No readings found
 */
router.get('/:device_id/range', async (req, res) => {
  try {
    const { device_id } = req.params;
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates are required' });
    }

    const device = await Device.findOne({ where: { device_id, status: 'active' } });
    if (!device) return res.status(404).json({ error: 'Device not found or inactive' });

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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         example: dev-001
 *     responses:
 *       200:
 *         description: Average readings
 *         content:
 *           application/json:
 *             example:
 *               avg_temperature: 23.7
 *               avg_humidity: 58.2
 *               avg_soil_moisture: 41.5
 *               avg_light_level: 320
 *       404:
 *         description: No readings found
 */
router.get('/:device_id/average', async (req, res) => {
  try {
    const { device_id } = req.params;

    const device = await Device.findOne({ where: { device_id, status: 'active' } });
    if (!device) return res.status(404).json({ error: 'Device not found or inactive' });

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
