const express = require('express');
const {indexAction, createAction, updateAction, deleteAction} = require('./restaurantController');
const baseValidator = require('../../helpers/baseValidator');
const {indexValidator, createValidator, updateValidator, deleteValidator} = require('./restaurantValidators');

exports.init = app => {
  const api = express.Router();
  api.get('/', indexValidator, baseValidator, indexAction);
  api.post('/', createValidator, baseValidator, createAction);
  api.put('/:id', updateValidator, baseValidator, updateAction);
  api.delete('/:id', deleteValidator, baseValidator, deleteAction);
  app.use('/restaurant', api)
};
