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
  res.json(await listDevices());
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
  const { device_id, device_name, project_tag='greenhouse', location } = req.body;
  const exists = await getDeviceById(device_id);
  if (exists) return res.status(409).json({ error: 'device_id exists' });
  const apiKeyPlain = crypto.randomBytes(24).toString('hex');
  const api_key_hash = await bcrypt.hash(apiKeyPlain, Number(process.env.BCRYPT_SALT_ROUNDS) || 12);
  const device = await createDevice({ device_id, device_name, project_tag, location, api_key_hash, created_by: req.user.sub });
  res.status(201).json({ device, apiKey: apiKeyPlain });
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
  await removeDevice(req.params.device_id);
  res.status(204).end();
});

module.exports = router;
