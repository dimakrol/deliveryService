const { check, body } = require('express-validator');
const {DISTRICTS} = require('../../../config/constants');

exports.indexValidator = [
  check('offset').isNumeric().optional(),
];
exports.createValidator = [
  body('title').not().isEmpty().isString(),
  body('address').not().isEmpty().isString(),
  body('district').isIn(Object.values(DISTRICTS)).not().isEmpty(),
];

exports.updateValidator = [
  check('id').not().isEmpty().isNumeric(),
  body('title').not().isEmpty().isString(),
  body('address').not().isEmpty().isString(),
  body('district').isIn(Object.values(DISTRICTS)).not().isEmpty(),
];

exports.deleteValidator = [
  check('id').not().isEmpty().isNumeric(),
];
