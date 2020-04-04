'use strict';
const {ORDER_STATUSES} = require('../../config/constants');

module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    status: DataTypes.ENUM(
      ORDER_STATUSES.NEW,
      ORDER_STATUSES.IN_PROGRESS,
      ORDER_STATUSES.DELIVERED,
      ORDER_STATUSES.REJECTED
    ),
    district: DataTypes.STRING,
    address: DataTypes.STRING,
    deliveredAt: DataTypes.DATE,
    deliveryCost: DataTypes.FLOAT,
    totalPrice: DataTypes.FLOAT
  }, {});
  Order.associate = function(models) {
    Order.belongsTo(models.Customer, {as: 'customer'});
    Order.belongsTo(models.Courier, {as: 'courier'});
    Order.belongsTo(models.Restaurant, {as: 'restaurant'});
  };
  return Order;
};
