'use strict';
const {COURIER_STATUSES} = require('../../config/constants')

module.exports = (sequelize, DataTypes) => {
  const Courier = sequelize.define('Courier', {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.ENUM(COURIER_STATUSES.ACTIVE, COURIER_STATUSES.INACTIVE, COURIER_STATUSES.DELIVERS),
    currentDistrict: DataTypes.STRING
  }, {});
  Courier.associate = function(models) {
    // associations can be defined here
  };
  return Courier;
};
