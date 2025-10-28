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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique device_id of the device
 *     responses:
 *       200:
 *         description: Latest reading
 *         content:
 *           application/json:
 *             example:
 *               device_id: dev_001
 *               temperature: 24.5
 *               humidity: 60
 *               soil_moisture: 45
 *               light_level: 300
 *               created_at: 2025-10-28T12:00:00Z
 *       404:
 *         description: No readings found
 *         content:
 *           application/json:
 *             example:
 *               error: No readings found
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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of recent readings to return
 *     responses:
 *       200:
 *         description: Recent readings
 *         content:
 *           application/json:
 *             example:
 *               - device_id: dev_001
 *                 temperature: 25.1
 *                 humidity: 58
 *                 soil_moisture: 47
 *                 light_level: 310
 *                 created_at: 2025-10-28T12:10:00Z
 *               - device_id: dev_001
 *                 temperature: 24.8
 *                 humidity: 59
 *                 soil_moisture: 46
 *                 light_level: 305
 *                 created_at: 2025-10-28T12:05:00Z
 *       404:
 *         description: No readings found
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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date (ISO format)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date (ISO format)
 *     responses:
 *       200:
 *         description: Readings in the given range
 *         content:
 *           application/json:
 *             example:
 *               - device_id: dev_001
 *                 temperature: 24.2
 *                 humidity: 61
 *                 soil_moisture: 44
 *                 light_level: 290
 *                 created_at: 2025-10-28T11:00:00Z
 *       400:
 *         description: Missing start or end date
 *         content:
 *           application/json:
 *             example:
 *               error: Start and end dates are required
 *       404:
 *         description: No readings found in this range
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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Average readings
 *         content:
 *           application/json:
 *             example:
 *               avg_temperature: 24.7
 *               avg_humidity: 59.3
 *               avg_soil_moisture: 45.2
 *               avg_light_level: 302.5
 *       404:
 *         description: No readings found
 *         content:
 *           application/json:
 *             example:
 *               error: No readings found
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
