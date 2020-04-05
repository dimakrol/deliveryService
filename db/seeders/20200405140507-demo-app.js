'use strict';
const customerFactory = require('../../db/factories/customerFactory');
const courierFactory = require('../../db/factories/courierFactory');
const restaurantFactory = require('../../db/factories/restaurantFactory');
const orderFactory = require('../../db/factories/orderFactory');
const truncate = require('../../test/truncate');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for(let i = 0; i < 10; i++) {
      const courier = await courierFactory();
      const restaurant = await restaurantFactory();
      const customer = await customerFactory();

      const orderRelations = {CustomerId: customer.id, RestaurantId: restaurant.id, CourierId: courier.id};

      for (let i = 0; i < 10; i++) {
        await orderFactory(orderRelations);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await truncate()
  }
};
