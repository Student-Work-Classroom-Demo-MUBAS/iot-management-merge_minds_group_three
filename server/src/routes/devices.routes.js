/**
 * @swagger
 * tags:
 *   name: Devices
 *   description: Manage devices
 */
const router = require('express').Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { deviceCreateRules } = require('../middleware/validators');
const { createDevice, listDevices, getDeviceById, removeDevice } = require('../models/devices');

/**
 * @swagger
 * /api/devices:
 *   get:
 *     summary: List devices
 *     tags: [Devices]
 *     security: [{ bearerAuth: [] }]
 */
router.get('/', auth, async (_req, res) => {
  try {
    const devices = await listDevices();
    res.json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

/**
 * @swagger
 * /api/devices:
 *   post:
 *     summary: Register a device (returns plaintext API key once)
 *     tags: [Devices]
 *     security: [{ bearerAuth: [] }]
 */
router.post('/', auth, deviceCreateRules(), async (req, res) => {
  try {
    const { device_id, device_name, project_tag = 'greenhouse', location, status = 'active' } = req.body;

    // Check if device already exists
    const exists = await getDeviceById(device_id);
    if (exists) return res.status(409).json({ error: 'device_id exists' });

    // Generate API key
    const apiKeyPlain = crypto.randomBytes(24).toString('hex');
    const api_key_hash = await bcrypt.hash(apiKeyPlain, Number(process.env.BCRYPT_SALT_ROUNDS) || 12);

    // Create device
    const device = await createDevice({
      device_id,
      device_name,
      project_tag,
      location,
      status,
      api_key_hash,
      created_by: req.user.sub
    });

    res.status(201).json({ device, apiKey: apiKeyPlain });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register device' });
  }
});

/**
 * @swagger
 * /api/devices/{device_id}:
 *   delete:
 *     summary: Remove a device
 *     tags: [Devices]
 *     security: [{ bearerAuth: [] }]
 */
router.delete('/:device_id', auth, async (req, res) => {
  try {
    await removeDevice(req.params.device_id);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove device' });
  }
});

module.exports = router;
