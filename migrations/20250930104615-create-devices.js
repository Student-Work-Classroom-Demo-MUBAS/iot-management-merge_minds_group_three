'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('devices', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      device_id: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      device_name: { type: Sequelize.STRING(100), allowNull: false },
      project_tag: { type: Sequelize.STRING(50) },
      location: { type: Sequelize.STRING(100) },
      status: { type: Sequelize.STRING(20), defaultValue: 'offline' },
      api_key: { type: Sequelize.STRING, allowNull: false },
      user_id: {
        type: Sequelize.INTEGER,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('devices');
  }
};
