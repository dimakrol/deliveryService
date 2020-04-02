'use strict';
const {COURIER_STATUSES} = require('../../config/constants');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Couriers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
        unique: true,
      },
      password: {
        allowNull: false,
        type: Sequelize.STRING
      },
      phone: {
        allowNull: false,
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM(COURIER_STATUSES.ACTIVE, COURIER_STATUSES.INACTIVE, COURIER_STATUSES.DELIVERS),
        defaultValue: COURIER_STATUSES.INACTIVE
      },
      currentDistrict: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Couriers');
  }
};
