'use strict';
module.exports = (sequelize, DataTypes) => {
  const Customer = sequelize.define('Customer', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    district: DataTypes.STRING,
    address: DataTypes.STRING
  }, {});
  Customer.associate = ({Order}) => {
    Customer.hasMany(Order, {as: 'orders'});
  };
  return Customer;
};
