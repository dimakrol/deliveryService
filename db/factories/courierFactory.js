const faker = require('faker');
const {Courier} = require('../../app/models');
const {COURIER_STATUSES, DISTRICTS} = require('../../config/constants');
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
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    phone: faker.phone.phoneNumber(),
    status: faker.random.arrayElement([
      COURIER_STATUSES.INACTIVE,
      COURIER_STATUSES.ACTIVE,
      COURIER_STATUSES.DELIVERS
    ]),
    currentDistrict: faker.random.arrayElement(
      Object.values(DISTRICTS)
    )
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
  Courier.create(await data(props));
