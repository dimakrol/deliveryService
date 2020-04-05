const { check } = require('express-validator');

exports.idValidator = [
  check('id').not().isEmpty().isNumeric(),
];
