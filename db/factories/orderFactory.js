const faker = require('faker');
const models = require('../../app/models');
const {ORDER_STATUSES, DISTRICTS} = require('../../config/constants');
/**
 *
 * @param  {Object} props Properties to use for the Order.
 *
 * @return {Object}       An object to build the Order from.
 */
const data = async (props = {}) => {
  const defaultProps = {
    status: faker.random.arrayElement(
      Object.values(ORDER_STATUSES)
    ),
    district: faker.random.arrayElement(
      Object.values(DISTRICTS)
    ),
    address: faker.address.streetAddress(),
    deliveredAt: Date.now(),
    deliveryCost: faker.random.number({min:50, max:200}),
    totalPrice: faker.random.number({min:50, max:1000}),
  };

  return Object.assign({}, defaultProps, props);
};
/**
 *
 * @param  {Object} props Properties to use for the Order.
 *
 * @return {Object}       A Order instance
 */
module.exports = async (props = {}) =>
  models.Order.create(await data(props));
