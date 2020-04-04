'use strict';
module.exports = (sequelize, DataTypes) => {
  const Restaurant = sequelize.define('Restaurant', {
    title: DataTypes.STRING,
    district: DataTypes.STRING,
    address: DataTypes.STRING
  }, {});
  Restaurant.associate = ({Order}) => {
    Restaurant.hasMany(Order, {as: 'orders'});
  };
  return Restaurant;
};
