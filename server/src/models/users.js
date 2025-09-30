const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// Define the User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },

  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.STRING(20),
    defaultValue: 'user'
  },

  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// -------------------- Helper functions --------------------

// Create a new user
async function createUser({ name, email, password_hash, role = 'user' }) {
  return await User.create({ name, email, password_hash, role });
}

// Find a user by email
async function findByEmail(email) {
  return await User.findOne({ where: { email } });
}

// Find a user by ID
async function findById(id) {
  return await User.findByPk(id);
}

// List all users (excluding password hashes)
async function listUsers() {
  return await User.findAll({
    attributes: ['id', 'name', 'email', 'role', 'active', 'created_at'],
    order: [['created_at', 'DESC']]
  });
}

// Update user details
async function updateUser(id, updates) {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update(updates);
}

// Deactivate user (soft delete)
async function deactivateUser(id) {
  const user = await User.findByPk(id);
  if (!user) return null;
  return await user.update({ active: false });
}

module.exports = {
  User,            // export the Sequelize model itself
  createUser,
  findByEmail,
  findById,
  listUsers,
  updateUser,
  deactivateUser
};
