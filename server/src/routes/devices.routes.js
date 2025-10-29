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
const Device = require('../models/devices');   // ✅ Sequelize model

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
 *         content:
 *           application/json:
 *             example:
 *               - device_id: dev_001
 *                 device_name: Greenhouse Sensor
 *                 project_tag: greenhouse
 *                 location: Blantyre
 *                 status: active
 *                 user_id: 1
 *                 created_at: 2025-10-28T12:00:00Z
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - device_id
 *               - device_name
 *             properties:
 *               device_id:
 *                 type: string
 *                 example: dev_003
 *               device_name:
 *                 type: string
 *                 example: Soil Moisture Sensor
 *               project_tag:
 *                 type: string
 *                 example: greenhouse
 *               location:
 *                 type: string
 *                 example: Lilongwe
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 example: active
 *     responses:
 *       201:
 *         description: Device registered successfully
 *         content:
 *           application/json:
 *             example:
 *               device:
 *                 device_id: dev_003
 *                 device_name: Soil Moisture Sensor
 *                 project_tag: greenhouse
 *                 location: Lilongwe
 *                 status: active
 *                 user_id: 1
 *                 created_at: 2025-10-28T12:30:00Z
 *               apiKey: "a1b2c3d4e5f6..."
 *       409:
 *         description: Device already exists
 *         content:
 *           application/json:
 *             example:
 *               error: device_id exists
 *       500:
 *         description: Server error during registration
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
      apiKey: apiKeyPlain,   // ✅ correct field name
      user_id: req.user.sub  // ✅ from JWT
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
 *     parameters:
 *       - in: path
 *         name: device_id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique device_id of the device to delete
 *     responses:
 *       200:
 *         description: Device deleted successfully
 *         content:
 *           application/json:
 *             example:
 *               message: Device deleted successfully
 *               device_id: dev_003
 *       404:
 *         description: Device not found
 *         content:
 *           application/json:
 *             example:
 *               error: Device not found
 */
router.delete('/:device_id', auth, async (req, res) => {
  try {
    const { device_id } = req.params;

    // Find the device first
    const device = await Device.findOne({ where: { device_id } });
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Delete the device
    await device.destroy();

    // Respond with confirmation
    res.status(200).json({
      message: 'Device deleted successfully',
      device_id: device_id
    });
  } catch (err) {
    console.error('Remove device error:', err);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

module.exports = router;
