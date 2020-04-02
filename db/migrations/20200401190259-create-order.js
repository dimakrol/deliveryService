'use strict';
const {ORDER_STATUSES} = require('../../config/constants');
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM(
          ORDER_STATUSES.NEW,
          ORDER_STATUSES.IN_PROGRESS,
          ORDER_STATUSES.DELIVERED,
          ORDER_STATUSES.REJECTED
        ),
        defaultValue: ORDER_STATUSES.NEW
      },
      district: {
        allowNull: false,
        type: Sequelize.STRING
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING
      },
      deliveryTime: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deliveryCost: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      totalPrice: {
        allowNull: false,
        type: Sequelize.FLOAT
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
    return queryInterface.dropTable('Orders');
  }
};
