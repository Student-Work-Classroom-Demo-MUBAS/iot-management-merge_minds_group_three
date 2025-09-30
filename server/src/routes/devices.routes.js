/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Manage IoT devices
 */
const router = require('express').Router();
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { deviceCreateRules } = require('../middleware/validators');
const Device = require('../models/devices');   // ✅ use Sequelize model

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: List all registered devices
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of devices
 */
router.get('/', auth, async (_req, res) => {
  try {
    const devices = await Device.findAll({
      attributes: [
        'device_id',
        'device_name',
        'project_tag',
        'location',
        'status',
        'user_id',
        'created_at'
      ],
      order: [['device_name', 'ASC']]
    });
    res.json(devices);
  } catch (err) {
    console.error('List devices error:', err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Register a new device (returns plaintext API key once)
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth, deviceCreateRules(), async (req, res) => {
  try {
    const { device_id, device_name, project_tag = 'greenhouse', location, status = 'active' } = req.body;

    // Check if device already exists
    const exists = await Device.findOne({ where: { device_id } });
    if (exists) return res.status(409).json({ error: 'device_id exists' });

    // Generate API key (plaintext, returned once)
    const apiKeyPlain = crypto.randomBytes(24).toString('hex');

    // Create device
    const device = await Device.create({
      device_id,
      device_name,
      project_tag,
      location,
      status,
      api_key: apiKeyPlain,   // ✅ store plaintext
      user_id: req.user.sub   // ✅ from JWT
    });

    res.status(201).json({
      device: {
        device_id: device.device_id,
        device_name: device.device_name,
        project_tag: device.project_tag,
        location: device.location,
        status: device.status,
        user_id: device.user_id,
        created_at: device.created_at
      },
      apiKey: apiKeyPlain   // ✅ only returned once
    });
  } catch (err) {
    console.error('Device register error:', err);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * @swagger
 * /api/devices/{device_id}:
 *   delete:
 *     summary: Remove a device by ID
 *     tags: [Devices]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:device_id', auth, async (req, res) => {
  try {
    const deleted = await Device.destroy({ where: { device_id: req.params.device_id } });
    if (!deleted) return res.status(404).json({ error: 'Device not found' });
    res.status(204).end();
  } catch (err) {
    console.error('Remove device error:', err);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

module.exports = router;
