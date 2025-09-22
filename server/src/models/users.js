const { pool } = require('../config/db');

/**
 * Create a new user
 */
async function createUser({ name, email, password_hash, role = 'user' }) {
  const query = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  try {
    const { rows } = await pool.query(query, [name, email, password_hash, role]);
    return rows[0];
  } catch (err) {
    console.error('Error creating user:', err);
    throw err;
  }
}

/**
 * Find a user by email
 */
async function findByEmail(email) {
  const query = `SELECT * FROM users WHERE email = $1`;
  try {
    const { rows } = await pool.query(query, [email]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error finding user by email:', err);
    throw err;
  }
}

/**
 * Find a user by ID
 */
async function findById(id) {
  const query = `SELECT * FROM users WHERE id = $1`;
  try {
    const { rows } = await pool.query(query, [id]);
    return rows[0] || null;
  } catch (err) {
    console.error('Error finding user by ID:', err);
    throw err;
  }
}

/**
 * List all users (excluding password hashes)
 */
async function listUsers() {
  const query = `SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC`;
  try {
    const { rows } = await pool.query(query);
    return rows;
  } catch (err) {
    console.error('Error listing users:', err);
    throw err;
  }
}

/**
 * Update user details
 */
async function updateUser(id, updates) {
  const fields = [];
  const values = [];
  let i = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${i}`);
    values.push(value);
    i++;
  }

  const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${i} RETURNING id, name, email, role, created_at`;
  values.push(id);

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error('Error updating user:', err);
    throw err;
  }
}

/**
 * Deactivate user (soft delete)
 */
async function deactivateUser(id) {
  const query = `UPDATE users SET active = false WHERE id = $1`;
  try {
    await pool.query(query, [id]);
  } catch (err) {
    console.error('Error deactivating user:', err);
    throw err;
  }
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  listUsers,
  updateUser,
  deactivateUser
};
