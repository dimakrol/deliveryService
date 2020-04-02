const express = require('express');
const logger = require('morgan');
const controllers = require('./controllers');

const index = express();
const api = express.Router();

if(process.env.NODE_ENV !== 'test') {
  index.use(logger('dev'));
}

index.use(express.json());
index.use(express.urlencoded({ extended: false }));

controllers.init(api);
index.use('/api/v1', api);

module.exports = index;
