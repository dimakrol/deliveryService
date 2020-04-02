const { check, body } = require('express-validator');
const { Op } = require("sequelize");
const {COURIER_STATUSES, DISTRICTS} = require('../../../config/constants');
const {Courier} = require('../../models');

exports.indexValidator = [
  check('offset').isNumeric().optional(),
];
exports.createValidator = [
  body('name').not().isEmpty(),
  body('email').not().isEmpty().isEmail().custom(async value => {
    if (value) {
      const courier = await Courier.count({
        where: { email: value }
      });
      if (courier) {
        throw new Error('E-mail already in use');
      }
    }
  }),
  body('password').not().isEmpty().isLength({ min: 8 }).isString(),
  body('phone').not().isEmpty().isString(),
  body('status').isIn(Object.values(COURIER_STATUSES)).not().isEmpty(),
];

exports.updateValidator = [
  check('id').not().isEmpty().isNumeric(),
  body('name').not().isEmpty().isString(),
  body('email').not().isEmpty().isEmail().custom(async (value, {req}) => {
    if (value) {
      const courier = await Courier.count({
        where: {
          id: {
            [Op.ne]: req.params.id
          },
          email: {
            [Op.eq]: value
          }
        }
      });
      if (courier) {
        throw new Error('E-mail already in use');
      }
    }
  }),
  body('password').isLength({ min: 8 }).isString().optional(),
  body('phone').not().isEmpty().isString(),
  body('status').isIn(Object.values(COURIER_STATUSES)).not().isEmpty(),
  body('currentDistrict').isIn(Object.values(DISTRICTS)).not().isEmpty(),
];

exports.deleteValidator = [
  check('id').not().isEmpty().isNumeric(),
];
