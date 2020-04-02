'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Orders',
      'CustomerId',
      {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Customers',
          key: 'id',
        },
        foreignKey: { allowNull: false },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      }
    ).then(() => {
      return queryInterface.addColumn(
        'Orders',
        'RestaurantId',
        {
          allowNull: false,
          type: Sequelize.INTEGER,
          references: {
            model: 'Restaurants',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        }
      )
    }).then(() => {
      return queryInterface.addColumn(
        'Orders',
        'CourierId',
        {
          allowNull: true,
          type: Sequelize.INTEGER,
          references: {
            model: 'Couriers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }
      )
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Orders', // name of Source model
      'CustomerId' // key we want to remove
    ).then(() => {
      return queryInterface.removeColumn(
        'Orders', // name of Source model
        'RestaurantId' // key we want to remove
      )
    }).then(() => {
      return queryInterface.removeColumn(
        'Orders', // name of Source model
        'CourierId' // key we want to remove
      )
    })
  }
};
