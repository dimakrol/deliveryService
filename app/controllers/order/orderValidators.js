const { check, body } = require('express-validator');
const {ORDER_STATUSES, DISTRICTS} = require('../../../config/constants');
const models = require('../../models');

exports.indexValidator = [
  check('offset').isNumeric().optional(),
];
exports.createValidator = [
  body('status').isIn(Object.values(ORDER_STATUSES)).not().isEmpty(),
  body('district').isIn(Object.values(DISTRICTS)).not().isEmpty(),
  body('address').not().isEmpty().isString(),
  body('deliveredAt').not().isEmpty().custom( async (value) => {
    if (!isValidDate(value)) {
      throw new Error(`Date is not valid!`);
    }
  }),
  body('deliveryCost').not().isEmpty().isNumeric(),
  body('totalPrice').not().isEmpty().isNumeric(),
  body('CustomerId').not().isEmpty().isNumeric().custom(async (value) => {
    await checkEntityExists('Customer', value)
  }),
  body('RestaurantId').not().isEmpty().isNumeric().custom(async (value) => {
    await checkEntityExists('Restaurant', value)
  }),
  body('CourierId').not().isEmpty().isNumeric().custom(async (value) => {
    await checkEntityExists('Restaurant', value)
  }).optional(),
];

exports.updateValidator = [
  check('id').not().isEmpty().isNumeric(),
  body('district').isIn(Object.values(DISTRICTS)).not().isEmpty(),
  body('address').not().isEmpty().isString(),
  body('deliveredAt').not().isEmpty().custom( async (value) => {
    if (!isValidDate(value)) {
      throw new Error(`Date is not valid!`);
    }
  }),
  body('deliveryCost').not().isEmpty().isNumeric(),
  body('totalPrice').not().isEmpty().isNumeric(),
  body('CustomerId').not().isEmpty().isNumeric().custom(async (value) => {
    await checkEntityExists('Customer', value)
  }),
  body('RestaurantId').not().isEmpty().isNumeric().custom(async (value) => {
    await checkEntityExists('Restaurant', value)
  }),
  body('CourierId').not().isEmpty().isNumeric().custom(async (value) => {
    await checkEntityExists('Restaurant', value)
  }).optional(),
];

exports.idValidator = [
  check('id').not().isEmpty().isNumeric(),
];

const checkEntityExists = async (entityName, id) => {
  if (parseInt(id) && id) {
    const entity = await models[entityName].findByPk(id);
    if (!entity) {
      throw new Error(`${entityName} not found!`);
    }
  }
};

const isValidDate = (value) => {
  return !isNaN(new Date(value).getTime());
};
