const express = require('express');
const {totalOrdersAction, sumDeliveredAction, populatesDistrictAction, avgDeliveryTimeAction} = require('./courierAnalyticsController');
const baseValidator = require('../../helpers/baseValidator');
const {idValidator} = require('./courierAnalyticsValidators');

exports.init = app => {
  const api = express.Router();
  api.get('/:id/total-orders', idValidator, baseValidator, totalOrdersAction);
  api.get('/:id/sum-orders', idValidator, baseValidator, sumDeliveredAction);
  api.get('/:id/populates-district', idValidator, baseValidator, populatesDistrictAction);
  api.get('/:id/avg-delivery-time', idValidator, baseValidator, avgDeliveryTimeAction);
  app.use('/courier-analytics', api)
};
