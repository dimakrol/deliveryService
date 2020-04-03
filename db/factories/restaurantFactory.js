const faker = require('faker');
const models = require('../../app/models');
const {DISTRICTS} = require('../../config/constants');
const {Restaurant} = require('../../app/models');

/**
 * Generate an object which container attributes needed
 * to successfully create a user instance.
 *
 * @param  {Object} props Properties to use for the user.
 *
 * @return {Object}       An object to build the user from.
 */
const data = async (props = {}) => {
  const defaultProps = {
    title: faker.company.companyName(),
    district: faker.random.arrayElement(
      Object.values(DISTRICTS)
    ),
    address: faker.address.streetAddress(),
  };

  return Object.assign({}, defaultProps, props);
};
/**
 * Generates a user instance from the properties provided.
 *
 * @param  {Object} props Properties to use for the user.
 *
 * @return {Object}       A user instance
 */
module.exports = async (props = {}) =>
  models.Restaurant.create(await data(props));
