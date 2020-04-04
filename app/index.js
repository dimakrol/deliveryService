const express = require('express');
const logger = require('morgan');
const controllers = require('./controllers');

const app = express();
const api = express.Router();

if(process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

controllers.init(api);
app.use('/api/v1', api);

module.exports = app;
