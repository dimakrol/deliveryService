const express = require('express');
const {indexAction, showAction, createAction, updateAction, deleteAction} = require('./customerController');
const baseValidator = require('../../helpers/baseValidator');
const {indexValidator, createValidator, updateValidator, idValidator} = require('./customerValidators');

exports.init = app => {
  const api = express.Router();
  api.get('/', indexValidator, baseValidator, indexAction);
  api.get('/:id', idValidator, baseValidator, showAction);
  api.post('/', createValidator, baseValidator, createAction);
  api.put('/:id', updateValidator, baseValidator, updateAction);
  api.delete('/:id', idValidator, baseValidator, deleteAction);
  app.use('/customer', api)
};
