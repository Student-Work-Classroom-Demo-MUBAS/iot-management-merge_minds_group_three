/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints for user authentication (API clients use JSON; web forms use EJS)
 */
const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { registerRules, loginRules } = require('../middleware/validators');
const { createUser, findByEmail } = require('../models/users');

// -------------------- SIGNUP --------------------
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user (API JSON)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               name: John Doe
 *               email: john@example.com
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             example:
 *               error: Email already registered
 *       500:
 *         description: Server error during registration
 */
router.post('/register', registerRules(), async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await findByEmail(email);
    if (existing) {
      if (req.is('application/json')) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      return res.status(409).render('signup', {
        title: 'Sign Up',
        page: 'signup',
        error: 'Email already registered',
        formData: { name, email }
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, password: password_hash });

    if (req.is('application/json')) {
      return res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email
      });
    }

    res.redirect('/login');
  } catch (err) {
    console.error('Register error:', err);
    if (req.is('application/json')) {
      return res.status(500).json({ error: 'Server error during registration' });
    }
    res.status(500).render('signup', {
      title: 'Sign Up',
      page: 'signup',
      error: 'Server error during registration',
      formData: { name, email }
    });
  }
});

// -------------------- LOGIN --------------------
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT (API JSON)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: StrongPass123!
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *         content:
 *           application/json:
 *             example:
 *               token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             example:
 *               error: Invalid credentials
 *       500:
 *         description: Server error during login
 */
router.post('/login', loginRules(), async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await findByEmail(email);
    if (!user) {
      if (req.is('application/json')) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.status(401).render('login', {
        title: 'Login',
        page: 'login',
        error: 'Invalid credentials',
        formData: { email }
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      if (req.is('application/json')) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      return res.status(401).render('login', {
        title: 'Login',
        page: 'login',
        error: 'Invalid credentials',
        formData: { email }
      });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    if (req.is('application/json')) {
      return res.json({ token });
    }

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    res.redirect('/');
  } catch (err) {
    console.error('Login error:', err);
    if (req.is('application/json')) {
      return res.status(500).json({ error: 'Server error during login' });
    }
    res.status(500).render('login', {
      title: 'Login',
      page: 'login',
      error: 'Server error during login',
      formData: { email }
    });
  }
});

module.exports = router;
