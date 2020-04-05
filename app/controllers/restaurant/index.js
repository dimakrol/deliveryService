const express = require('express');
const {indexAction, showAction, createAction, updateAction, deleteAction} = require('./restaurantController');
const baseValidator = require('../../helpers/baseValidator');
const {indexValidator, createValidator, updateValidator, idValidator} = require('./restaurantValidators');

exports.init = app => {
  const api = express.Router();
  api.get('/', indexValidator, baseValidator, indexAction);
  api.get('/:id', idValidator, baseValidator, showAction);
  api.post('/', createValidator, baseValidator, createAction);
  api.put('/:id', updateValidator, baseValidator, updateAction);
  api.delete('/:id', idValidator, baseValidator, deleteAction);
  app.use('/restaurant', api)
};
