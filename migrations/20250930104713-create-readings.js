'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('readings', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      device_id: {
        type: Sequelize.STRING(50),
        references: { model: 'devices', key: 'device_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      temperature: { type: Sequelize.FLOAT },
      humidity: { type: Sequelize.FLOAT },
      soil_moisture: { type: Sequelize.FLOAT },
      light_level: { type: Sequelize.FLOAT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('readings');
  }
};
